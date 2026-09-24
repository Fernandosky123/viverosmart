import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Sectores() {
  const [sectores, setSectores] = useState([]);
  const [newSector, setNewSector] = useState({ name: '', description: '' });
  const [editingSector, setEditingSector] = useState(null);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const canManage = currentUser.role === 'Administrador' || (currentUser.permissions || []).includes('SECTORS_MANAGE');

  useEffect(() => {
    fetchSectores();
  }, []);

  const fetchSectores = async () => {
    try {
      const res = await axios.get(`${API_URL}/smart/sectores`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSectores(res.data);
    } catch (error) {
      if(error.response?.status === 401) navigate('/');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!canManage) return;
    try {
      if (editingSector) {
        // Actualizar
        await axios.put(`${API_URL}/smart/sectores/${editingSector.id}`, newSector, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setEditingSector(null);
      } else {
        // Crear
        await axios.post(`${API_URL}/smart/sectores`, newSector, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      setNewSector({ name: '', description: '' });
      fetchSectores();
    } catch (error) {
      alert('Error guardando sector');
    }
  };

  const handleEdit = (sector) => {
    setEditingSector(sector);
    setNewSector({ name: sector.name, description: sector.description || '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este sector y todos sus sensores?')) return;
    try {
      await axios.delete(`${API_URL}/smart/sectores/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchSectores();
    } catch (error) {
      alert('Error eliminando sector');
    }
  };

  const cancelEdit = () => {
    setEditingSector(null);
    setNewSector({ name: '', description: '' });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Zonas y Cultivos (Gestión)</h2>
      
      {canManage ? <div className={`p-6 rounded-2xl shadow-sm border mb-8 ${editingSector ? 'bg-amber-50 border-amber-200' : 'bg-white border-emerald-100'}`}>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          {editingSector ? '✏️ Editando Sector' : '🌱 Añadir Nueva Zona'}
          {editingSector && (
            <button type="button" onClick={cancelEdit} className="ml-auto text-sm bg-stone-200 text-stone-700 px-3 py-1 rounded hover:bg-stone-300 flex items-center gap-1">
              <X size={14} /> Cancelar
            </button>
          )}
        </h3>
        <form onSubmit={handleCreate} className="flex gap-4 items-end flex-wrap md:flex-nowrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
            <input required type="text" value={newSector.name} onChange={(e) => setNewSector({...newSector, name: e.target.value})} className="block w-full px-4 py-2 border-2 border-stone-200 rounded-xl outline-none focus:border-emerald-500" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
            <input type="text" value={newSector.description} onChange={(e) => setNewSector({...newSector, description: e.target.value})} className="block w-full px-4 py-2 border-2 border-stone-200 rounded-xl outline-none focus:border-emerald-500" />
          </div>
          <button type="submit" className={`px-8 py-2 rounded-xl text-white font-bold transition-all ${editingSector ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'} shadow-lg`}>
            {editingSector ? 'Actualizar' : 'Guardar'}
          </button>
        </form>
      </div> : <p className="mb-8 rounded-xl border border-stone-200 bg-stone-50 p-4 text-stone-600">Solo puedes consultar las zonas que tienes asignadas. La creación y edición están reservadas a la administración.</p>}

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-black text-stone-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-left text-xs font-black text-stone-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-4 text-left text-xs font-black text-stone-500 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-4 text-left text-xs font-black text-stone-500 uppercase tracking-wider">Sensores IoT</th>
              <th className="px-6 py-4 text-right text-xs font-black text-stone-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-stone-100">
            {sectores.map(sector => (
              <tr key={sector.id} className="hover:bg-stone-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-stone-400">#{sector.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-emerald-900">{sector.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{sector.description || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">{sector.sensors?.length || 0} dispositivos</span>
                </td>
                {canManage && <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(sector)} className="text-amber-600 hover:text-amber-900 mr-4 transition-colors">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(sector.id)} className="text-red-500 hover:text-red-700 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>}
              </tr>
            ))}
            {sectores.length === 0 && (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-stone-500 font-bold">No hay zonas registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
