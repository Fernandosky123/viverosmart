import { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Users, Shield, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', roleId: '' });
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'Administrador';

  useEffect(() => {
    if (!isAdmin) return; // Solo admin puede ver usuarios
    
    const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }};
    axios.get(`${API_URL}/smart/usuarios`, config).then(res => setUsuarios(res.data));
    axios.get(`${API_URL}/smart/roles`, config).then(res => setRoles(res.data));
  }, [isAdmin]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/smart/usuarios`, newUser, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowForm(false);
      setNewUser({ name: '', email: '', password: '', roleId: '' });
      // Refrescar
      const res = await axios.get(`${API_URL}/smart/usuarios`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      setUsuarios(res.data);
    } catch (error) {
      alert('Error creando usuario');
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-12 text-center">
        <Shield size={64} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Acceso Restringido</h2>
        <p className="text-gray-500 mt-2">Esta sección es exclusiva para el rol de Administrador. Tú eres {currentUser.role}.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-stone-200 text-stone-700 rounded-xl">
            <Settings size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800">Gestión de Personal</h2>
            <p className="text-sm text-gray-500">Administra los accesos de Operadores, Técnicos y Clientes.</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-700">
          <Plus size={18} /> {showForm ? 'Cancelar' : 'Añadir Empleado'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-200 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
            <input required type="text" value={newUser.name} onChange={e=>setNewUser({...newUser, name: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Correo (Email)</label>
            <input required type="email" value={newUser.email} onChange={e=>setNewUser({...newUser, email: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña</label>
            <input required type="password" value={newUser.password} onChange={e=>setNewUser({...newUser, password: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Cargo / Rol</label>
            <select required value={newUser.roleId} onChange={e=>setNewUser({...newUser, roleId: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-white">
              <option value="">Selecciona un rol...</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-4 flex justify-end">
            <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold">Guardar Usuario</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-black text-stone-500 uppercase">Nombre</th>
              <th className="px-6 py-4 text-left text-xs font-black text-stone-500 uppercase">Email</th>
              <th className="px-6 py-4 text-left text-xs font-black text-stone-500 uppercase">Rol / Cargo</th>
              <th className="px-6 py-4 text-left text-xs font-black text-stone-500 uppercase">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-stone-100">
            {usuarios.map(user => (
              <tr key={user.id} className="hover:bg-stone-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold 
                    ${user.role === 'Administrador' ? 'bg-purple-100 text-purple-700' : 
                      user.role === 'Operador' ? 'bg-blue-100 text-blue-700' : 
                      user.role === 'Tecnico' ? 'bg-orange-100 text-orange-700' : 
                      'bg-gray-100 text-gray-700'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap"><span className="text-emerald-500 font-bold">Activo</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
