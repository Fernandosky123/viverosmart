import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export default function RecuperarContrasena() {
  const [params] = useSearchParams(); const token = params.get('token');
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [message, setMessage] = useState('');
  const submit = async e => { e.preventDefault(); try { if (token) { await axios.post(`${API_URL}/auth/password-reset/confirm`, { token, password }); setMessage('Contraseña actualizada. Ya puedes iniciar sesión.'); } else { await axios.post(`${API_URL}/auth/password-reset/request`, { email }); setMessage('Si existe una cuenta asociada, se enviaron las instrucciones.'); } } catch { setMessage('No se pudo procesar la solicitud.'); } };
  return <main className="login-page"><section className="login-panel"><div className="login-form-wrap"><h1>{token ? 'Nueva contraseña' : 'Recuperar contraseña'}</h1><p>{token ? 'Elige una contraseña nueva y segura.' : 'Indica tu correo para recibir el enlace de recuperación.'}</p><form className="login-form" onSubmit={submit}>{token ? <><label>Nueva contraseña</label><input required minLength="8" type="password" value={password} onChange={e=>setPassword(e.target.value)}/></> : <><label>Correo electrónico</label><input required type="email" value={email} onChange={e=>setEmail(e.target.value)}/></>}<button className="button button-dark">Continuar</button></form>{message && <p className="feedback">{message}</p>}<Link to="/">Volver al inicio de sesión</Link></div></section></main>;
}
