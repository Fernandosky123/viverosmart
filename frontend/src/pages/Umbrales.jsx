import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, ShieldAlert } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Umbrales() {
  const [agua, setAgua] = useState('');
  const [energia, setEnergia] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUmbrales();
  }, []);

  const fetchUmbrales = async () => {
    try {
      const res = await axios.get(`${API_URL}/smart/umbrales`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      const data = res.data;
      const uAgua = data.find(u => u.resourceType === 'AGUA');
      const uEnergia = data.find(u => u.resourceType === 'ENERGIA');
      if (uAgua) setAgua(uAgua.maxLimit);
      if (uEnergia) setEnergia(uEnergia.maxLimit);
    } catch (error) {
      console.error(error);
    }
  };

  const saveUmbral = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/smart/umbrales`, { agua, energia }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessage('¡Umbrales actualizados y activos en el motor IoT!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      alert('Error guardando los umbrales');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
          <ShieldAlert size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-800">Umbrales y Alertas IoT</h2>
          <p className="text-gray-500">Configura los límites máximos permitidos antes de disparar una alerta.</p>
        </div>
      </div>

      {message && <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-xl font-bold">{message}</div>}

      <form onSubmit={saveUmbral} className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Límite Crítico de Agua (Litros / lectura)</label>
          <input type="number" required value={agua} onChange={(e) => setAgua(e.target.value)} className="w-full border-2 border-stone-200 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Límite Crítico de Energía (kWh / lectura)</label>
          <input type="number" required value={energia} onChange={(e) => setEnergia(e.target.value)} className="w-full border-2 border-stone-200 rounded-xl px-4 py-3 focus:border-amber-500 outline-none transition-colors" />
        </div>
        
        <div className="pt-4 border-t border-stone-100 flex justify-end">
          <button type="submit" className="bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-emerald-700 hover:shadow-lg transition-all">Guardar Reglas</button>
        </div>
      </form>
    </div>
  );
}
