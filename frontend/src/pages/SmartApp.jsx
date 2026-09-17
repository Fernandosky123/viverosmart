import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Leaf, FileSpreadsheet, LogOut, Settings, Bell, TreePine, Sprout } from 'lucide-react';
import Dashboard from './Dashboard';
import Sectores from './Sectores';
import Sensores from './Sensores';
import Umbrales from './Umbrales';
import Reportes from './Reportes';
import Usuarios from './Usuarios';
import MisPlantas from './MisPlantas';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function SmartApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const role = currentUser.role || 'Cliente';

  useEffect(() => {
    // Fetch notifications
    const fetchAlerts = async () => {
      try {
        const res = await axios.get(`${API_URL}/smart/alertas`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
        setAlerts(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // RBAC Menu Filtering
  const allMenuItems = [
    { path: '/dashboard', label: 'Dashboard Analítico', icon: <LayoutDashboard size={22} />, roles: ['Administrador', 'Operador', 'Cliente', 'Tecnico'] },
    { path: '/dashboard/mis-plantas', label: 'Mis Plantas', icon: <Sprout size={22} />, roles: ['Administrador', 'Cliente'] },
    { path: '/dashboard/sectores', label: 'Zonas y Cultivos', icon: <Leaf size={22} />, roles: ['Administrador', 'Operador'] },
    { path: '/dashboard/sensores', label: 'Sensores IoT', icon: <TreePine size={22} />, roles: ['Administrador', 'Tecnico'] },
    { path: '/dashboard/umbrales', label: 'Umbrales y Alertas', icon: <Bell size={22} />, roles: ['Administrador', 'Tecnico'] },
    { path: '/dashboard/reportes', label: 'Auditoría y Exportación', icon: <FileSpreadsheet size={22} />, roles: ['Administrador', 'Cliente'] },
    { path: '/dashboard/usuarios', label: 'Gestión de Personal', icon: <Settings size={22} />, roles: ['Administrador'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(role));

  return (
    <div className="flex h-screen bg-[#f4f7f6] font-sans selection:bg-emerald-200">
      
      {/* Sidebar - Theme Vivero */}
      <div className="w-72 bg-[#1a2f26] text-emerald-50 flex flex-col shadow-2xl z-10">
        <div className="p-8 flex items-center gap-4 bg-black/10">
          <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-900/50">
            <TreePine className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wide text-white">ViveroSmart</h1>
            <p className="text-emerald-400/80 text-xs font-bold uppercase tracking-widest mt-1">Enterprise Edition</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 mt-4 space-y-3">
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-all duration-300 font-semibold ${
                  isActive 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 -translate-y-0.5' 
                  : 'text-emerald-100/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            )
          })}
          
          <div className="pt-8 mt-8 border-t border-white/10 relative">
            <p className="px-4 text-xs font-bold text-emerald-500/50 uppercase tracking-widest mb-4">Herramientas Visuales</p>
            <button
              onClick={() => navigate('/old-app')}
              className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-100 transition-colors border border-emerald-700/50 font-medium"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              Simulador Interactivo
            </button>
          </div>
        </nav>

        <div className="p-6 bg-black/20">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-inner border-2 
              ${role === 'Administrador' ? 'bg-purple-700 border-purple-400' : 
                role === 'Operador' ? 'bg-blue-700 border-blue-400' : 
                role === 'Tecnico' ? 'bg-orange-700 border-orange-400' : 
                'bg-emerald-700 border-emerald-400'}`}>
              {role.substring(0,2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{currentUser.name || 'Usuario'}</p>
              <p className="text-xs text-emerald-400">{role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/30 px-4 py-3 rounded-xl transition-all font-bold">
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto flex flex-col relative">
        {/* Top Navbar */}
        <header className="h-20 bg-white/50 backdrop-blur-md border-b border-stone-200 flex items-center justify-end px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4 relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative w-10 h-10 bg-white border border-stone-200 rounded-full flex items-center justify-center text-stone-500 hover:text-emerald-600 hover:border-emerald-300 transition-colors shadow-sm">
              <Bell size={20} />
              {alerts.length > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
            </button>
            <button onClick={() => navigate('/dashboard/usuarios')} className="w-10 h-10 bg-white border border-stone-200 rounded-full flex items-center justify-center text-stone-500 hover:text-emerald-600 hover:border-emerald-300 transition-colors shadow-sm">
              <Settings size={20} />
            </button>
            
            {/* Notificaciones Dropdown */}
            {showNotifications && (
              <div className="absolute top-12 right-12 w-80 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden z-50">
                <div className="p-4 bg-stone-50 border-b border-stone-200 font-bold text-stone-700">Últimas Alertas</div>
                <div className="max-h-64 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <div className="p-4 text-sm text-stone-500 text-center">No hay alertas recientes</div>
                  ) : alerts.map(a => (
                    <div key={a.id} className="p-4 border-b border-stone-100 hover:bg-stone-50">
                      <p className="text-xs font-bold text-red-600 mb-1">{a.level}</p>
                      <p className="text-sm text-stone-800">{a.reason}</p>
                      <p className="text-xs text-stone-400 mt-2">{new Date(a.timestamp).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 pb-12">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/mis-plantas" element={<MisPlantas />} />
            <Route path="/sectores" element={<Sectores />} />
            <Route path="/sensores" element={<Sensores />} />
            <Route path="/umbrales" element={<Umbrales />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/usuarios" element={<Usuarios />} />
          </Routes>
        </div>
      </div>

    </div>
  );
}
