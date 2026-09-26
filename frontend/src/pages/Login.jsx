import '../styles/premium.css';
import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Eye, EyeOff, Leaf, LoaderCircle, ShieldCheck, Sprout } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Login() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [setupKnown, setSetupKnown] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    axios.get(`${API_URL}/auth/setup-status`, { signal: controller.signal })
      .then(({ data }) => setNeedsSetup(Boolean(data.needsInitialSetup)))
      .catch(requestError => {
        if (!axios.isCancel(requestError)) setError('No se pudo comprobar el estado del servidor.');
      })
      .finally(() => setSetupKnown(true));
    return () => controller.abort();
  }, []);

  if (localStorage.getItem('token')) return <Navigate to="/dashboard" replace />;

  function saveSession(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    navigate('/dashboard');
  }

  async function submit(event) {
    event.preventDefault();
    if (!setupKnown || pending) return;
    setPending(true);
    setError('');
    try {
      if (needsSetup) await axios.post(`${API_URL}/auth/setup`, { name, email, password });
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
      saveSession(data);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No pudimos procesar la solicitud. Comprueba la conexión e inténtalo nuevamente.');
    } finally {
      setPending(false);
    }
  }

  return <main className="premium-login min-h-screen grid lg:grid-cols-[1.1fr_.9fr] bg-stone-50">
    <section className="hidden lg:flex relative overflow-hidden bg-emerald-950 text-white p-14 flex-col justify-between">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_25%_25%,#34d399_0,transparent_35%),radial-gradient(circle_at_80%_75%,#84cc16_0,transparent_30%)]" />
      <div className="relative flex items-center gap-3 text-2xl font-black"><span className="grid place-items-center size-11 rounded-2xl bg-emerald-400 text-emerald-950"><Leaf /></span>ViveroSmart</div>
      <div className="relative max-w-xl"><span className="inline-flex items-center gap-2 text-xs font-bold tracking-[.25em] text-emerald-300"><ShieldCheck size={17} /> GESTIÓN PRIVADA</span><h1 className="mt-5 text-6xl font-black leading-[1.02]">Todo el vivero,<br/><span className="text-emerald-300">en orden.</span></h1><p className="mt-6 text-lg leading-8 text-emerald-100/75">Controla cultivos, zonas, sensores y recursos desde un espacio reservado para tu equipo.</p></div>
      <div className="relative flex items-center gap-3 text-sm text-emerald-100/70"><Sprout size={19}/> Naturaleza y tecnología trabajando juntas.</div>
    </section>

    <section className="login-panel flex items-center justify-center px-6 py-12">
      <div className="login-card w-full max-w-md">
        <div className="lg:hidden flex items-center gap-2 mb-10 text-xl font-black text-emerald-950"><Leaf/> ViveroSmart</div>
        <span className="text-xs font-black tracking-[.2em] text-emerald-600">{needsSetup ? 'CONFIGURACIÓN INICIAL' : 'ACCESO AL VIVERO'}</span>
        <h2 className="mt-3 text-4xl font-black text-stone-900">{needsSetup ? 'Crea la cuenta administradora' : 'Bienvenido de nuevo'}</h2>
        <p className="mt-3 text-stone-500">{needsSetup ? 'Esta opción solo aparece cuando la base de datos todavía no tiene usuarios.' : 'Ingresa con las credenciales asignadas por la administración.'}</p>

        <form className="mt-8 grid gap-4" onSubmit={submit}>
          {needsSetup && <label className="grid gap-2 text-sm font-bold text-stone-700" htmlFor="name">Nombre completo<input className="rounded-xl border border-stone-300 bg-white px-4 py-3 font-normal outline-none focus:border-emerald-500" id="name" autoComplete="name" required minLength="3" value={name} onChange={event => setName(event.target.value)} /></label>}
          <label className="grid gap-2 text-sm font-bold text-stone-700" htmlFor="email">Correo electrónico<input className="rounded-xl border border-stone-300 bg-white px-4 py-3 font-normal outline-none focus:border-emerald-500" id="email" type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} /></label>
          <label className="grid gap-2 text-sm font-bold text-stone-700" htmlFor="password">Contraseña<div className="relative"><input className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 pr-12 font-normal outline-none focus:border-emerald-500" id="password" type={visible ? 'text' : 'password'} autoComplete={needsSetup ? 'new-password' : 'current-password'} required minLength={needsSetup ? 8 : 1} value={password} onChange={event => setPassword(event.target.value)} /><button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-500" type="button" onClick={() => setVisible(value => !value)} aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{visible ? <EyeOff size={19}/> : <Eye size={19}/>}</button></div></label>
          {!needsSetup && <Link className="justify-self-end text-sm font-bold text-emerald-700 hover:text-emerald-900" to="/restablecer-contrasena">¿Olvidaste tu contraseña?</Link>}
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
          <button className="mt-2 flex items-center justify-between rounded-xl bg-emerald-800 px-5 py-4 font-bold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60" disabled={!setupKnown || pending} type="submit"><span>{pending ? 'Procesando…' : needsSetup ? 'Crear cuenta y entrar' : 'Iniciar sesión'}</span>{pending ? <LoaderCircle className="animate-spin" size={19}/> : <ArrowRight size={19}/>}</button>
        </form>
        <p className="mt-10 text-center text-xs text-stone-400">Acceso privado · ViveroSmart © {new Date().getFullYear()}</p>
      </div>
    </section>
  </main>;
}
