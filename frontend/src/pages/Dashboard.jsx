import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Droplet, Zap, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [consumptions, setConsumptions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/');

    // Fetch data
    Promise.all([
      axios.get(`${API_URL}/smart/consumos`, { headers: { Authorization: `Bearer ${token}` }}),
      axios.get(`${API_URL}/smart/alertas`, { headers: { Authorization: `Bearer ${token}` }}).catch(() => ({ data: [] }))
    ]).then(([consumptionResponse, alertResponse]) => {
      setConsumptions(Array.isArray(consumptionResponse.data) ? consumptionResponse.data : []);
      setAlerts(Array.isArray(alertResponse.data) ? alertResponse.data : []);
    }).catch(() => setError('No se pudieron cargar los consumos del vivero.')).finally(() => setLoading(false));
  }, [navigate]);

  const recordedLatest = consumptions.reduce((date, item) => new Date(item.timestamp) > date ? new Date(item.timestamp) : date, new Date(0));
  const latest = recordedLatest.getTime() ? recordedLatest : new Date();
  const data = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(latest); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - 6 + offset);
    const next = new Date(date); next.setDate(next.getDate() + 1);
    const rows = consumptions.filter(item => { const value = new Date(item.timestamp); return value >= date && value < next; });
    return { name: date.toLocaleDateString('es', { weekday: 'short' }).replace('.', ''), agua: rows.filter(item => String(item.resourceType).toUpperCase() === 'AGUA').reduce((sum, item) => sum + Number(item.quantity || 0), 0), energia: rows.filter(item => String(item.resourceType).toUpperCase() === 'ENERGIA').reduce((sum, item) => sum + Number(item.quantity || 0), 0) };
  });
  const water = consumptions.filter(item => String(item.resourceType).toUpperCase() === 'AGUA').reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const energy = consumptions.filter(item => String(item.resourceType).toUpperCase() === 'ENERGIA').reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const value = amount => loading ? '…' : new Intl.NumberFormat('es', { maximumFractionDigits: 1 }).format(amount);

  return (
    <div className="dashboard-page p-6 max-w-7xl mx-auto w-full space-y-6">

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
      {error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="metric-water bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-sm border border-blue-200 flex items-center justify-between group hover:shadow-md transition-shadow">
          <div>
            <p className="text-blue-600 text-sm font-bold uppercase tracking-wider">Consumo Agua (Mensual)</p>
            <h2 className="text-4xl font-black text-blue-900 mt-1">{value(water)} <span className="text-xl font-bold text-blue-700">L</span></h2>
          </div>
          <div className="bg-blue-500 text-white p-4 rounded-2xl group-hover:scale-110 transition-transform">
            <Droplet size={32} />
          </div>
        </div>

        <div className="metric-energy bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl shadow-sm border border-amber-200 flex items-center justify-between group hover:shadow-md transition-shadow">
          <div>
            <p className="text-amber-700 text-sm font-bold uppercase tracking-wider">Energía (Mensual)</p>
            <h2 className="text-4xl font-black text-amber-950 mt-1">{value(energy)} <span className="text-xl font-bold text-amber-800">kWh</span></h2>
          </div>
          <div className="bg-amber-500 text-white p-4 rounded-2xl group-hover:scale-110 transition-transform">
            <Zap size={32} />
          </div>
        </div>

        <div className="metric-alerts bg-gradient-to-br from-rose-50 to-rose-100 p-6 rounded-2xl shadow-sm border border-rose-200 flex items-center justify-between group hover:shadow-md transition-shadow">
          <div>
            <p className="text-rose-600 text-sm font-bold uppercase tracking-wider">Alertas Activas</p>
            <h2 className="text-4xl font-black text-rose-900 mt-1">{loading ? '…' : alerts.length}</h2>
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
