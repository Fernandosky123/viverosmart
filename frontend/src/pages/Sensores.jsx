import { useState, useEffect } from 'react';
import axios from 'axios';
import { TreePine, Zap, Droplet, Plus, Trash2 } from 'lucide-react';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Sensores() {
  const [sensores, setSensores] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newSensor, setNewSensor] = useState({ code: '', type: 'AGUA', sectorId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }};
    axios.get(`${API_URL}/smart/sensores`, config).then(res => setSensores(res.data));
    axios.get(`${API_URL}/smart/sectores`, config).then(res => setSectores(res.data));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/smart/sensores`, { ...newSensor, sectorId: parseInt(newSensor.sectorId) }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowForm(false);
      setNewSensor({ code: '', type: 'AGUA', sectorId: '' });
      fetchData();
    } catch (error) {
      alert('Error creando sensor');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar permanentemente este sensor IoT?')) return;
    try {
      await axios.delete(`${API_URL}/smart/sensores/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchData();
    } catch (error) {
      alert('Error al eliminar el sensor');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <TreePine size={28} />
          </div>
          <h2 className="text-2xl font-black text-gray-800">Sensores IoT Desplegados</h2>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <Plus size={18} /> {showForm ? 'Cancelar' : 'Añadir Sensor'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-200 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Código MAC / Identificador</label>
            <input required type="text" value={newSensor.code} onChange={e=>setNewSensor({...newSensor, code: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="Ej. SN-AGUA-03" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de Sensor</label>
            <select required value={newSensor.type} onChange={e=>setNewSensor({...newSensor, type: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-white">
              <option value="AGUA">Flujo de Agua (L)</option>
              <option value="ENERGIA">Eléctrico (kWh)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Asignar a Zona</label>
            <select required value={newSensor.sectorId} onChange={e=>setNewSensor({...newSensor, sectorId: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-white">
              <option value="">Seleccione Zona...</option>
              {sectores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-emerald-600 w-full text-white px-6 py-2 rounded-lg font-bold">Instalar Sensor</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sensores.map(sensor => (
          <div key={sensor.id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 relative group">
            <button 
              onClick={() => handleDelete(sensor.id)} 
              className="absolute top-4 right-4 text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              title="Eliminar Sensor"
            >
              <Trash2 size={20} />
            </button>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${sensor.type === 'AGUA' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                {sensor.type === 'AGUA' ? <Droplet size={24} /> : <Zap size={24} />}
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mr-8">{sensor.status}</span>
            </div>
            <h3 className="font-black text-gray-800 text-xl">{sensor.code}</h3>
            <p className="text-sm font-bold text-gray-500 mt-1">Sector: {sensor.sector?.name || 'No asignado'}</p>
          </div>
        ))}
        {sensores.length === 0 && (
          <div className="col-span-full text-center p-8 bg-white rounded-2xl border-2 border-dashed border-stone-300">
            <p className="text-gray-500 font-bold">No hay sensores IoT instalados. Regístralos en el sistema para empezar a capturar datos automáticos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
