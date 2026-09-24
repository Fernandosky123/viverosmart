const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const root = path.resolve(__dirname, '../dist');
const artifacts = fs.mkdtempSync(path.join(os.tmpdir(), 'viverosmart-dashboard-'));
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const server = http.createServer((request, response) => {
  let file = path.join(root, decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
  if (!file.startsWith(root)) return response.writeHead(403).end();
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html');
  response.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' })[path.extname(file)] || 'application/octet-stream');
  response.end(fs.readFileSync(file));
});

(async () => {
  await new Promise(resolve => server.listen(4176, '127.0.0.1', resolve));
  const browser = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--remote-debugging-port=9336', `--user-data-dir=${path.join(artifacts, 'profile')}`, 'about:blank'
  ], { windowsHide: true, stdio: 'ignore' });
  let socket;
  try {
    let tab;
    for (let attempt = 0; attempt < 60; attempt++) {
      try { tab = (await (await fetch('http://127.0.0.1:9336/json')).json()).find(item => item.type === 'page'); } catch {}
      if (tab) break;
      await sleep(150);
    }
    if (!tab) throw new Error('No se pudo iniciar Edge');
    socket = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
    let id = 0;
    const pending = new Map();
    const exceptions = [];
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const requestId = ++id;
      pending.set(requestId, { resolve, reject });
      socket.send(JSON.stringify({ id: requestId, method, params }));
    });
    socket.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const task = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) task.reject(message.error); else task.resolve(message.result);
      }
      if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text);
      if (message.method === 'Fetch.requestPaused') {
        const pathname = new URL(message.params.request.url).pathname;
        let body = [];
        if (pathname === '/api/smart/consumos') body = [
          { id: 1, resourceType: 'AGUA', quantity: 120, isManual: false, sectorId: 3, timestamp: new Date().toISOString(), sector: { id: 3, name: 'Invernadero Norte' }, sensor: { code: 'SN-AGUA-01' } },
          { id: 2, resourceType: 'ENERGIA', quantity: 24, isManual: true, sectorId: 8, timestamp: new Date().toISOString(), sector: { id: 8, name: 'Semilleros Sur' }, sensor: null }
        ];
        if (pathname === '/api/smart/alertas') body = [{ id: 1, level: 'CRITICA', reason: 'Consumo alto', sectorId: 3, timestamp: new Date().toISOString() }];
        if (pathname === '/api/smart/sectores') body = [{ id: 3, name: 'Invernadero Norte' }, { id: 8, name: 'Semilleros Sur' }];
        send('Fetch.fulfillRequest', {
          requestId: message.params.requestId,
          responseCode: 200,
          responseHeaders: [
            { name: 'Content-Type', value: 'application/json' },
            { name: 'Access-Control-Allow-Origin', value: '*' },
            { name: 'Access-Control-Allow-Headers', value: 'authorization,content-type' }
          ],
          body: Buffer.from(JSON.stringify(body)).toString('base64')
        });
      }
    });
    const evaluate = async expression => {
      const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
      return result.result.value;
    };
    const waitFor = async expression => {
      for (let attempt = 0; attempt < 80; attempt++) {
        if (await evaluate(`Boolean(${expression})`)) return;
        await sleep(100);
      }
      const pageText = await evaluate("document.body?.innerText?.slice(0,500) || ''");
      const location = await evaluate("location.href + ' path=' + (document.querySelector('[data-dashboard-path]')?.dataset.dashboardPath || 'none')");
      const content = await evaluate("document.querySelector('[data-dashboard-path]')?.innerHTML?.slice(0,500) || 'none'");
      throw new Error(`Tiempo agotado: ${expression}. URL: ${location}. Contenido: ${content}. Pantalla: ${pageText}. Excepciones: ${exceptions.join(', ')}`);
    };
    const assert = async (expression, label) => {
      if (!await evaluate(expression)) throw new Error(`Fallo: ${label}`);
      console.log(`PASS: ${label}`);
    };
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Fetch.enable', { patterns: [{ urlPattern: '*/api/*' }] });
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1050, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: 'http://127.0.0.1:4176/' });
    await waitFor("document.querySelector('#email')");
    await evaluate("(()=>{localStorage.setItem('token','ui-test');localStorage.setItem('user',JSON.stringify({name:'Administrador de prueba',role:'Administrador',email:'admin@vivero.com'}));location.href='/dashboard';return true})()");
    await waitFor("document.querySelector('.metric-water h2')?.textContent.includes('120')");
    await assert("document.querySelector('.metric-energy h2').textContent.includes('24')", 'muestra energía del backend');
    await assert("document.querySelector('.metric-alerts h2').textContent.includes('1')", 'muestra alertas del backend');
    await assert("document.querySelectorAll('.recharts-responsive-container').length===2", 'muestra los gráficos de agua y energía');
    await evaluate("document.querySelector('.topbar-avatar').click()");
    await assert("!!document.querySelector('.account-popover')", 'avatar abre el menú de usuario');
    await evaluate("document.querySelector('.workspace-label').click()");
    await assert("!!document.querySelector('.workspace-popover')", 'Mi vivero abre accesos del espacio');
    await assert("!document.querySelector('.account-popover')", 'los menús no se superponen');
    const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    fs.writeFileSync(path.join(artifacts, 'dashboard-color.png'), Buffer.from(screenshot.data, 'base64'));
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await send('Page.navigate', { url: 'http://127.0.0.1:4176/dashboard' });
    await waitFor("document.querySelector('.dashboard-page')");
    await assert('document.documentElement.scrollWidth <= innerWidth', 'sin desbordamiento horizontal en móvil');
    if (exceptions.length) throw new Error(`Excepciones: ${exceptions.join(', ')}`);
    console.log(`ARTIFACTS=${artifacts}`);
  } finally {
    socket?.close();
    browser.kill();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
