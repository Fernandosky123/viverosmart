import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Droplet, Zap, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [consumptions, setConsumptions] = useState([]);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/');
    
    // Fetch data
    axios.get(`${API_URL}/smart/consumos`, { headers: { Authorization: `Bearer ${token}` }})
      .then(res => setConsumptions(res.data))
      .catch(err => console.error(err));
  }, [navigate]);

  // Mock data para los gráficos ya que la DB podría estar vacía al principio
  const data = [
    { name: 'Lun', agua: 4000, energia: 2400 },
    { name: 'Mar', agua: 3000, energia: 1398 },
    { name: 'Mie', agua: 2000, energia: 9800 },
    { name: 'Jue', agua: 2780, energia: 3908 },
    { name: 'Vie', agua: 1890, energia: 4800 },
    { name: 'Sab', agua: 2390, energia: 3800 },
    { name: 'Dom', agua: 3490, energia: 4300 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      
      {/* Cabecera con botón de reporte directo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
        <div>
          <h2 className="text-3xl font-extrabold text-emerald-900 tracking-tight">Resumen General</h2>
          <p className="text-emerald-600/80 mt-1 font-medium">Monitoreo automático de recursos del Vivero</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/reportes')} 
          className="mt-4 md:mt-0 flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-1 transition-all duration-200 font-bold"
        >
          <FileText size={20} /> 
          Generar Reporte Completo
          <ArrowRight size={18} />
        </button>
      </div>
        
      {/* KPIs Themed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-sm border border-blue-200 flex items-center justify-between group hover:shadow-md transition-shadow">
          <div>
            <p className="text-blue-600 text-sm font-bold uppercase tracking-wider">Consumo Agua (Mensual)</p>
            <h2 className="text-4xl font-black text-blue-900 mt-1">12,450 <span className="text-xl font-bold text-blue-700">L</span></h2>
          </div>
          <div className="bg-blue-500 text-white p-4 rounded-2xl group-hover:scale-110 transition-transform">
            <Droplet size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl shadow-sm border border-amber-200 flex items-center justify-between group hover:shadow-md transition-shadow">
          <div>
            <p className="text-amber-700 text-sm font-bold uppercase tracking-wider">Energía (Mensual)</p>
            <h2 className="text-4xl font-black text-amber-950 mt-1">3,240 <span className="text-xl font-bold text-amber-800">kWh</span></h2>
          </div>
          <div className="bg-amber-500 text-white p-4 rounded-2xl group-hover:scale-110 transition-transform">
            <Zap size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-6 rounded-2xl shadow-sm border border-rose-200 flex items-center justify-between group hover:shadow-md transition-shadow">
          <div>
            <p className="text-rose-600 text-sm font-bold uppercase tracking-wider">Alertas Activas</p>
            <h2 className="text-4xl font-black text-rose-900 mt-1">2</h2>
          </div>
          <div className="bg-rose-500 text-white p-4 rounded-2xl group-hover:scale-110 transition-transform">
            <AlertTriangle size={32} />
          </div>
        </div>
      </div>

      {/* Charts Themed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
          <h3 className="text-xl font-extrabold text-stone-800 mb-6 flex items-center gap-2">
            <Droplet className="text-blue-500" /> Histórico de Agua (Semanal)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#78716c'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#78716c'}} />
                <Tooltip cursor={{fill: '#f5f5f4'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" />
                <Bar dataKey="agua" fill="#3b82f6" name="Litros consumidos" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
          <h3 className="text-xl font-extrabold text-stone-800 mb-6 flex items-center gap-2">
            <Zap className="text-amber-500" /> Histórico de Energía (Semanal)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#78716c'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#78716c'}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="energia" stroke="#f59e0b" name="kWh consumidos" strokeWidth={4} dot={{strokeWidth: 2, r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
