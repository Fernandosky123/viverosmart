import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Leaf, MessageCircle, Send, Check, X, Play, Eye, EyeOff } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showPlanes, setShowPlanes] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isOffline) {
      alert('Estás en modo sin conexión. No puedes iniciar sesión hasta recuperar internet.');
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (error) {
      alert('Error en inicio de sesión. Verifica credenciales.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8faf9] overflow-hidden font-sans">
      
      <style>{`
        @keyframes grow { 0% { height: 0; opacity: 0; } 100% { height: 100px; opacity: 1; } }
        @keyframes popLeafLeft { 0% { transform: scale(0) rotate(-20deg); } 100% { transform: scale(1) rotate(0deg); } }
        @keyframes popLeafRight { 0% { transform: scale(0) rotate(20deg); } 100% { transform: scale(1) rotate(0deg); } }
        @keyframes floatBg { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes fadeIn { from { opacity: 0; backdrop-filter: blur(0px); } to { opacity: 1; backdrop-filter: blur(8px); } }
        @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes rotateSun { 100% { transform: rotate(360deg); } }
      `}</style>

      {/* --- MODAL DE PLANES --- */}
      {showPlanes && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-900/60" style={{ animation: 'fadeIn 0.3s forwards' }}>
          <div className="bg-white rounded-3xl p-8 max-w-5xl w-full mx-4 relative" style={{ animation: 'slideUp 0.4s ease-out' }}>
            <button onClick={() => setShowPlanes(false)} className="absolute top-6 right-6 text-gray-400 hover:text-emerald-700 bg-gray-100 rounded-full p-2"><X size={24}/></button>
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-gray-800">Escala tu Vivero al Siguiente Nivel</h2>
              <p className="text-gray-500 mt-3">Planes diseñados para agricultores modernos y empresas agroindustriales.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Plan Básico */}
              <div className="border border-stone-200 p-8 rounded-2xl hover:border-emerald-300 transition-all">
                <h3 className="text-xl font-bold text-gray-700">🌱 Semilla</h3>
                <div className="text-4xl font-black text-emerald-600 my-4">$29<span className="text-lg text-gray-400 font-normal">/mes</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-gray-600 text-sm"><Check size={16} className="text-emerald-500"/> Hasta 5 Sensores IoT</li>
                  <li className="flex items-center gap-2 text-gray-600 text-sm"><Check size={16} className="text-emerald-500"/> Alertas por Correo</li>
                  <li className="flex items-center gap-2 text-gray-600 text-sm"><Check size={16} className="text-emerald-500"/> Soporte en 48 hrs</li>
                </ul>
                <button className="w-full py-3 rounded-xl border-2 border-emerald-500 text-emerald-600 font-bold hover:bg-emerald-50">Elegir Plan</button>
              </div>
              {/* Plan Pro (Destacado) */}
              <div className="border-2 border-emerald-500 p-8 rounded-2xl bg-emerald-50 relative transform md:-translate-y-4 shadow-xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Más Popular</div>
                <h3 className="text-xl font-bold text-gray-800">🌿 Brote (Pro)</h3>
                <div className="text-4xl font-black text-emerald-700 my-4">$79<span className="text-lg text-emerald-600/70 font-normal">/mes</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-gray-700 text-sm font-medium"><Check size={16} className="text-emerald-600"/> Sensores IoT Ilimitados</li>
                  <li className="flex items-center gap-2 text-gray-700 text-sm font-medium"><Check size={16} className="text-emerald-600"/> Seguimiento de Crecimiento</li>
                  <li className="flex items-center gap-2 text-gray-700 text-sm font-medium"><Check size={16} className="text-emerald-600"/> Exportación Excel / PDF</li>
                  <li className="flex items-center gap-2 text-gray-700 text-sm font-medium"><Check size={16} className="text-emerald-600"/> Automatización de Riego</li>
                </ul>
                <button className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200">Empezar Ahora</button>
              </div>
              {/* Plan Enterprise */}
              <div className="border border-stone-200 p-8 rounded-2xl hover:border-emerald-300 transition-all bg-gray-900 text-white">
                <h3 className="text-xl font-bold text-gray-100">🌳 Cosecha</h3>
                <div className="text-4xl font-black text-emerald-400 my-4">Contactar</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-gray-300 text-sm"><Check size={16} className="text-emerald-400"/> Hardware a Medida</li>
                  <li className="flex items-center gap-2 text-gray-300 text-sm"><Check size={16} className="text-emerald-400"/> IA para Predicción de Plagas</li>
                  <li className="flex items-center gap-2 text-gray-300 text-sm"><Check size={16} className="text-emerald-400"/> Soporte 24/7 Dedicado</li>
                </ul>
                <button className="w-full py-3 rounded-xl bg-white text-gray-900 font-bold hover:bg-gray-100">Hablar con Ventas</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDemo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80" style={{ animation: 'fadeIn 0.3s forwards' }}>
          <div className="bg-[#87CEEB] rounded-3xl w-full max-w-3xl h-[500px] mx-4 relative overflow-hidden flex flex-col shadow-2xl" style={{ animation: 'slideUp 0.4s ease-out' }}>
            <button onClick={() => setShowDemo(false)} className="absolute top-4 right-4 z-50 text-white hover:text-red-300 bg-black/20 rounded-full p-2"><X size={24}/></button>
            
            {/* Sol Animado */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-yellow-300 rounded-full blur-[2px] opacity-90 shadow-[0_0_50px_rgba(255,255,0,0.8)]" style={{ animation: 'rotateSun 20s linear infinite' }}></div>
            
            {/* UI del dashboard superpuesta */}
            <div className="absolute top-6 left-24 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-white/50">
              <h4 className="font-black text-gray-800 text-lg">Tomate Cherry</h4>
              <p className="text-xs font-bold text-emerald-600 mb-2">Estado: Óptimo 🟢</p>
              <div className="flex gap-4 text-xs">
                <div><span className="text-gray-500">Humedad:</span> <span className="font-bold text-blue-600">65%</span></div>
                <div><span className="text-gray-500">Temp:</span> <span className="font-bold text-orange-500">22°C</span></div>
              </div>
            </div>

            {/* Planta de Tomate CSS/SVG */}
            <div className="flex-1 flex items-end justify-center -mb-2 relative z-10">
              <svg width="250" height="300" viewBox="0 0 200 300" className="drop-shadow-2xl">
                {/* Tallo principal */}
                <path d="M100 300 Q95 200 105 100 Q110 50 95 20" stroke="#2E7D32" strokeWidth="8" fill="none" strokeLinecap="round" />
                {/* Ramas */}
                <path d="M103 230 Q140 210 160 180" stroke="#388E3C" strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d="M98 160 Q60 150 40 120" stroke="#388E3C" strokeWidth="5" fill="none" strokeLinecap="round" />
                <path d="M105 90 Q140 80 150 50" stroke="#4CAF50" strokeWidth="4" fill="none" strokeLinecap="round" />
                {/* Hojas */}
                <path d="M160 180 Q170 170 180 185 Q165 195 160 180" fill="#4CAF50" />
                <path d="M40 120 Q30 110 20 125 Q35 135 40 120" fill="#4CAF50" />
                <path d="M150 50 Q160 40 170 55 Q155 65 150 50" fill="#81C784" />
                <path d="M95 20 Q85 10 75 25 Q90 35 95 20" fill="#81C784" />
                {/* Tomates (Rojos brillantes) */}
                <circle cx="140" cy="200" r="12" fill="#E53935" stroke="#B71C1C" strokeWidth="2" />
                <path d="M138 188 Q140 195 142 188" stroke="#2E7D32" strokeWidth="2" fill="none" />
                
                <circle cx="55" cy="135" r="14" fill="#E53935" stroke="#B71C1C" strokeWidth="2" />
                <path d="M53 121 Q55 128 57 121" stroke="#2E7D32" strokeWidth="2" fill="none" />
                
                <circle cx="130" cy="70" r="10" fill="#FF5252" stroke="#D32F2F" strokeWidth="1.5" />
              </svg>
            </div>
            
            {/* Suelo */}
            <div className="h-16 bg-[#5D4037] w-full relative z-20 border-t-12 border-[#388E3C]">
               <div className="absolute top-2 left-10 w-4 h-1 bg-[#4E342E] rounded-full"></div>
               <div className="absolute top-6 right-20 w-6 h-1.5 bg-[#4E342E] rounded-full"></div>
            </div>
          </div>
        </div>
      )}

      {/* Seccion Comercial / Landing (Izquierda) */}
      <div className="w-full md:w-3/5 bg-emerald-800 text-white p-12 flex flex-col justify-between relative z-10 overflow-hidden">
        
        <style>{`
          @keyframes growStem { 0% { transform: scaleY(0); } 100% { transform: scaleY(1); } }
          @keyframes popFruit { 0% { transform: scale(0); opacity: 0; } 80% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
          @keyframes popLeaf { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
          .animate-stem { transform-origin: bottom center; animation: growStem 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
          .animate-leaf { transform-origin: center; animation: popLeaf 0.5s ease-out forwards; opacity: 0; }
          .animate-fruit { transform-origin: center; animation: popFruit 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; opacity: 0; }
        `}</style>

        {/* Fondo decorativo (Hojas) */}
        <div className="absolute top-10 left-10 opacity-10" style={{ animation: 'floatBg 6s ease-in-out infinite' }}>
          <Leaf size={150} />
        </div>
        <div className="absolute bottom-20 right-10 opacity-10" style={{ animation: 'floatBg 8s ease-in-out infinite' }}>
          <Leaf size={200} />
        </div>

        <div className="relative z-20">
          <div className="flex items-center gap-3 mb-16">
            <div className="bg-white p-2 rounded-xl text-emerald-800 shadow-lg">
              <Leaf size={32} />
            </div>
            <h1 className="text-3xl font-black tracking-tight">ViveroSmart</h1>
          </div>
          
          <h2 className="text-5xl font-black mb-6 leading-tight">Monitoreo Inteligente <br/>para Viveros del Futuro</h2>
          <p className="text-xl text-emerald-100 mb-10 max-w-lg leading-relaxed">
            Optimiza tus recursos, recibe alertas en tiempo real, controla tus sensores IoT y sigue el crecimiento de tus plantas en una sola plataforma.
          </p>

          <div className="flex gap-4">
            <button onClick={() => setShowPlanes(true)} className="bg-white text-emerald-900 font-bold px-8 py-3 rounded-full hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              Conoce Nuestros Planes
            </button>
          </div>
        </div>

        {/* Escena de Plantas Creciendo (Automática al Iniciar) */}
        <div className="relative h-64 w-full flex items-end justify-center mt-12 z-20 pointer-events-none">
           
           <div className="flex gap-16 items-end relative z-10 -mb-2">
             
             {/* GIRASOL ANIMADO */}
             <div className="relative w-32 h-48 flex items-end justify-center">
               <svg width="100%" height="100%" viewBox="0 0 100 150" className="drop-shadow-2xl overflow-visible">
                 {/* Tallo */}
                 <path className="animate-stem" d="M50 150 Q45 100 50 40" stroke="#4CAF50" strokeWidth="6" fill="none" strokeLinecap="round" />
                 {/* Hojas */}
                 <path className="animate-leaf" style={{ animationDelay: '1s' }} d="M50 110 Q70 100 80 120 Q60 130 50 110" fill="#81C784" />
                 <path className="animate-leaf" style={{ animationDelay: '1.2s' }} d="M48 80 Q25 70 20 90 Q40 100 48 80" fill="#81C784" />
                 
                 {/* Cabeza del Girasol */}
                 <g className="animate-fruit" style={{ animationDelay: '1.8s' }}>
                   <circle cx="50" cy="40" r="28" fill="#FFD54F" />
                   {/* Petalos (Girasol) */}
                   <path d="M50 0 L56 18 L44 18 Z" fill="#FFC107" />
                   <path d="M50 80 L56 62 L44 62 Z" fill="#FFC107" />
                   <path d="M10 40 L28 34 L28 46 Z" fill="#FFC107" />
                   <path d="M90 40 L72 34 L72 46 Z" fill="#FFC107" />
                   <path d="M22 12 L36 24 L28 29 Z" fill="#FFC107" />
                   <path d="M78 12 L64 24 L72 29 Z" fill="#FFC107" />
                   <path d="M78 68 L64 56 L72 51 Z" fill="#FFC107" />
                   <path d="M22 68 L36 56 L28 51 Z" fill="#FFC107" />
                   {/* Centro (Semillas) */}
                   <circle cx="50" cy="40" r="16" fill="#5D4037" stroke="#3E2723" strokeWidth="2" />
                   <circle cx="50" cy="40" r="10" fill="#4E342E" stroke="#3E2723" strokeWidth="1" strokeDasharray="2,2" />
                 </g>
               </svg>
             </div>

             {/* TOMATE ANIMADO */}
             <div className="relative w-40 h-56 flex items-end justify-center">
               <svg width="100%" height="100%" viewBox="0 0 150 200" className="drop-shadow-2xl overflow-visible">
                 {/* Tallo principal */}
                 <g className="animate-stem" style={{ animationDelay: '0.4s' }}>
                   <path d="M75 200 Q70 120 80 50 Q85 20 70 10" stroke="#2E7D32" strokeWidth="6" fill="none" strokeLinecap="round" />
                   <path d="M77 150 Q105 130 120 110" stroke="#388E3C" strokeWidth="4" fill="none" strokeLinecap="round" />
                   <path d="M72 100 Q40 90 25 70" stroke="#388E3C" strokeWidth="4" fill="none" strokeLinecap="round" />
                   <path d="M78 60 Q100 55 110 30" stroke="#4CAF50" strokeWidth="3" fill="none" strokeLinecap="round" />
                 </g>

                 {/* Hojas */}
                 <path className="animate-leaf" style={{ animationDelay: '1.4s' }} d="M120 110 Q130 100 140 115 Q125 125 120 110" fill="#4CAF50" />
                 <path className="animate-leaf" style={{ animationDelay: '1.5s' }} d="M25 70 Q15 60 5 75 Q20 85 25 70" fill="#4CAF50" />
                 <path className="animate-leaf" style={{ animationDelay: '1.6s' }} d="M110 30 Q120 20 130 35 Q115 45 110 30" fill="#81C784" />
                 <path className="animate-leaf" style={{ animationDelay: '1.7s' }} d="M70 10 Q60 0 50 15 Q65 25 70 10" fill="#81C784" />
                 
                 {/* Tomates (Rojos) */}
                 <g className="animate-fruit" style={{ animationDelay: '2.1s' }}>
                   <circle cx="105" cy="130" r="10" fill="#E53935" stroke="#B71C1C" strokeWidth="1" />
                   <path d="M103 120 Q105 125 107 120" stroke="#2E7D32" strokeWidth="2" fill="none" />
                 </g>
                 
                 <g className="animate-fruit" style={{ animationDelay: '2.3s' }}>
                   <circle cx="35" cy="85" r="12" fill="#E53935" stroke="#B71C1C" strokeWidth="1" />
                   <path d="M33 75 Q35 80 37 75" stroke="#2E7D32" strokeWidth="2" fill="none" />
                 </g>
                 
                 <g className="animate-fruit" style={{ animationDelay: '2.5s' }}>
                   <circle cx="95" cy="45" r="8" fill="#FF5252" stroke="#D32F2F" strokeWidth="1" />
                 </g>
               </svg>
             </div>

           </div>

           {/* Suelo */}
           <div className="absolute bottom-0 w-3/4 max-w-lg h-3 bg-emerald-950 rounded-full blur-[3px]"></div>
           <div className="absolute bottom-1 w-3/4 max-w-lg h-2 bg-[#4E342E] rounded-full border-t border-[#388E3C]"></div>
        </div>
      </div>

      {/* Seccion Login (Derecha) */}
      <div className="w-full md:w-2/5 flex flex-col items-center justify-center p-8 bg-white relative z-20 shadow-[-20px_0_30px_-15px_rgba(0,0,0,0.1)]">
        
        {/* Badge Offline / Online */}
        {isOffline && (
          <div className="absolute top-6 right-6 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-200 flex items-center gap-1 animate-pulse">
            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            Modo Sin Conexión (Guardando datos)
          </div>
        )}

        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-800">Bienvenido de nuevo</h2>
            <p className="text-gray-500 mt-2">Ingresa a tu panel de control ViveroSmart</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Correo Electrónico</label>
              <input 
                type="email" required placeholder="ejemplo@vivero.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors bg-gray-50 focus:bg-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} required placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors bg-gray-50 focus:bg-white pr-12" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded text-emerald-500 focus:ring-emerald-500" />
                <span className="font-medium text-gray-600">Recordarme</span>
              </label>
              <a href="#" className="font-bold text-emerald-600 hover:text-emerald-700">¿Olvidaste tu contraseña?</a>
            </div>

            <button 
              type="submit" 
              className="w-full bg-emerald-600 text-white py-4 px-4 rounded-xl hover:bg-emerald-700 font-bold transition-all shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 text-lg"
            >
              Iniciar Sesión
            </button>
          </form>

          <p className="text-center mt-8 text-gray-500 text-sm">
            ¿Quieres ser parte de nuestra red? <button onClick={() => setShowChat(true)} className="font-bold text-emerald-600 hover:underline">Contáctanos</button>
          </p>
        </div>
      </div>

      {/* CHATBOT */}
      <div className="fixed bottom-6 right-6 z-50">
        {showChat && (
          <div className="bg-white w-80 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-4 transform transition-all" style={{ animation: 'slideUp 0.3s ease-out' }}>
            <div className="bg-emerald-600 p-4 text-white font-bold flex justify-between items-center">
              <span>Asesor ViveroSmart</span>
              <button onClick={() => setShowChat(false)} className="text-emerald-100 hover:text-white"><X size={20}/></button>
            </div>
            <div className="p-4 h-64 bg-gray-50 overflow-y-auto space-y-4">
              <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-sm text-gray-700 inline-block border border-gray-100">
                ¡Hola! 👋 Bienvenido a ViveroSmart. He notado que estás revisando nuestros planes. ¿Hay alguna duda con la que te pueda ayudar para integrar nuestro software a tus cultivos?
              </div>
            </div>
            <div className="p-3 bg-white border-t flex items-center gap-2">
              <input type="text" placeholder="Escribe un mensaje..." className="flex-1 border border-gray-200 focus:ring-0 text-sm bg-gray-50 rounded-full px-4 py-2 outline-none focus:border-emerald-500" />
              <button className="p-2 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white rounded-full"><Send size={16}/></button>
            </div>
          </div>
        )}
        
        <button 
          onClick={() => setShowChat(!showChat)}
          className="bg-emerald-600 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-700 transition-all flex items-center justify-center hover:scale-110"
        >
          <MessageCircle size={28} />
        </button>
      </div>

    </div>
  );
}
