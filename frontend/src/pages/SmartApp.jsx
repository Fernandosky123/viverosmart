import '../styles/premium.css';
import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Leaf, FileSpreadsheet, LogOut, Settings, Bell, TreePine, Sprout, CalendarClock, Radio, Activity, ShieldCheck, UserRound, Menu, X, ChevronDown, ArrowUpRight } from 'lucide-react';
import Dashboard from './Dashboard';
import Sectores from './Sectores';
import Sensores from './Sensores';
import Umbrales from './Umbrales';
import Reportes from './Reportes';
import Usuarios from './Usuarios';
import MisPlantas from './MisPlantas';
import Programaciones from './Programaciones';
import Cultivos from './Cultivos';
import Comparacion from './Comparacion';
import Permisos from './Permisos';
import Auditoria from './Auditoria';
import Alertas from './Alertas';
import Consolidados from './Consolidados';
import Anomalias from './Anomalias';
import Historicos from './Historicos';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const menuPermissions = {
  '/dashboard': 'REPORTS_VIEW', '/dashboard/mis-plantas': 'REPORTS_VIEW', '/dashboard/sectores': 'SECTORS_MANAGE',
  '/dashboard/cultivos': 'CROPS_MANAGE', '/dashboard/sensores': 'SENSORS_MANAGE', '/dashboard/umbrales': 'THRESHOLDS_MANAGE',
  '/dashboard/programaciones': 'SCHEDULES_MANAGE', '/dashboard/reportes': 'REPORTS_VIEW', '/dashboard/comparacion': 'REPORTS_VIEW',
  '/dashboard/alertas': 'REPORTS_VIEW', '/dashboard/anomalias': 'REPORTS_VIEW', '/dashboard/consolidados': 'REPORTS_VIEW',
  '/dashboard/historicos': 'REPORTS_VIEW', '/dashboard/usuarios': 'USERS_MANAGE', '/dashboard/permisos': 'ROLES_MANAGE', '/dashboard/auditoria': 'AUDIT_VIEW'
};

export default function SmartApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const role = (typeof currentUser.role === 'string' ? currentUser.role : currentUser.role?.name) || 'Cliente';

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
    localStorage.removeItem('user');
    navigate('/');
  };

  // RBAC Menu Filtering
  const allMenuItems = [
    { path: '/dashboard', label: 'Dashboard Analítico', icon: <LayoutDashboard size={19} />, section: 'Principal', roles: ['Administrador', 'Operador', 'Cliente', 'Tecnico'] },
    { path: '/dashboard/mis-plantas', label: 'Mis Plantas', icon: <Sprout size={19} />, section: 'Principal', roles: ['Administrador', 'Cliente'] },
    { path: '/dashboard/sectores', label: 'Zonas y Cultivos', icon: <Leaf size={19} />, section: 'Operación', roles: ['Administrador', 'Operador'] },
    { path: '/dashboard/cultivos', label: 'Cultivos', icon: <Sprout size={19} />, section: 'Operación', roles: ['Administrador', 'Operador'] },
    { path: '/dashboard/sensores', label: 'Sensores IoT', icon: <Radio size={19} />, section: 'Operación', roles: ['Administrador', 'Tecnico'] },
    { path: '/dashboard/umbrales', label: 'Umbrales y Alertas', icon: <Bell size={19} />, section: 'Operación', roles: ['Administrador', 'Tecnico'] },
    { path: '/dashboard/programaciones', label: 'Riego e Iluminación', icon: <CalendarClock size={19} />, section: 'Operación', roles: ['Administrador', 'Operador'] },
    { path: '/dashboard/reportes', label: 'Auditoría y Exportación', icon: <FileSpreadsheet size={19} />, section: 'Análisis', roles: ['Administrador', 'Cliente'] },
    { path: '/dashboard/comparacion', label: 'Comparar Consumos', icon: <Activity size={19} />, section: 'Análisis', roles: ['Administrador', 'Operador', 'Cliente'] },
    { path: '/dashboard/alertas', label: 'Centro de Alertas', icon: <Bell size={19} />, section: 'Análisis', roles: ['Administrador', 'Operador', 'Tecnico'] },
    { path: '/dashboard/anomalias', label: 'Consumos Anormales', icon: <Activity size={19} />, section: 'Análisis', roles: ['Administrador', 'Operador', 'Tecnico'] },
    { path: '/dashboard/consolidados', label: 'Reportes Consolidados', icon: <FileSpreadsheet size={19} />, section: 'Análisis', roles: ['Administrador', 'Operador', 'Cliente'] },
    { path: '/dashboard/historicos', label: 'Archivos Históricos', icon: <FileSpreadsheet size={19} />, section: 'Análisis', roles: ['Administrador', 'Operador', 'Cliente'] },
    { path: '/dashboard/usuarios', label: 'Gestión de Personal', icon: <Settings size={19} />, section: 'Administración', roles: ['Administrador'] },
    { path: '/dashboard/permisos', label: 'Roles y Permisos', icon: <ShieldCheck size={19} />, section: 'Administración', roles: ['Administrador'] },
    { path: '/dashboard/auditoria', label: 'Registro de Auditoría', icon: <FileSpreadsheet size={19} />, section: 'Administración', roles: ['Administrador'] },
  ];

  const assignedPermissions = new Set(Array.isArray(currentUser.permissions) ? currentUser.permissions : []);
  const menuItems = allMenuItems.filter(item => role === 'Administrador' || (assignedPermissions.size
    ? assignedPermissions.has(menuPermissions[item.path])
    : item.roles.includes(role)));
  const canAccess = path => role === 'Administrador' || (assignedPermissions.size
    ? assignedPermissions.has(menuPermissions[path])
    : Boolean(allMenuItems.find(item => item.path === path)?.roles.includes(role)));
  const protectedPage = (path, element) => canAccess(path) ? element : <Navigate to="/dashboard" replace />;
  const pages = {
    '/dashboard': <Dashboard />,
    '/dashboard/mis-plantas': protectedPage('/dashboard/mis-plantas', <MisPlantas />),
    '/dashboard/sectores': protectedPage('/dashboard/sectores', <Sectores />),
    '/dashboard/cultivos': protectedPage('/dashboard/cultivos', <Cultivos />),
    '/dashboard/sensores': protectedPage('/dashboard/sensores', <Sensores />),
    '/dashboard/umbrales': protectedPage('/dashboard/umbrales', <Umbrales />),
    '/dashboard/programaciones': protectedPage('/dashboard/programaciones', <Programaciones />),
    '/dashboard/reportes': protectedPage('/dashboard/reportes', <Reportes />),
    '/dashboard/comparacion': protectedPage('/dashboard/comparacion', <Comparacion />),
    '/dashboard/alertas': protectedPage('/dashboard/alertas', <Alertas />),
    '/dashboard/anomalias': protectedPage('/dashboard/anomalias', <Anomalias />),
    '/dashboard/consolidados': protectedPage('/dashboard/consolidados', <Consolidados />),
    '/dashboard/historicos': protectedPage('/dashboard/historicos', <Historicos />),
    '/dashboard/usuarios': protectedPage('/dashboard/usuarios', <Usuarios />),
    '/dashboard/permisos': protectedPage('/dashboard/permisos', <Permisos />),
    '/dashboard/auditoria': protectedPage('/dashboard/auditoria', <Auditoria />),
    '/dashboard/cuenta': <div className="p-8 max-w-3xl"><div className="bg-white border border-emerald-100 rounded-2xl p-8 shadow-sm"><h2 className="text-3xl font-black text-emerald-900 mb-6">Mi cuenta</h2><p className="font-bold">{currentUser.name || 'Usuario'}</p><p className="text-emerald-600">{role}</p>{currentUser.email && <p className="mt-3 text-stone-500">{currentUser.email}</p>}</div></div>
  };
  const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';
  const currentPage = pages[normalizedPath] || <Navigate to="/dashboard" replace />;
  const sections = ['Principal', 'Operación', 'Análisis', 'Administración'];
  useEffect(() => {
    setShowNotifications(false);
    setShowAccount(false);
    setWorkspaceOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  if (!localStorage.getItem('token')) return <Navigate to="/" replace />;

  return (
    <div className="premium-shell flex h-screen overflow-hidden bg-[#f4f7f6] font-sans selection:bg-emerald-200">

      {mobileOpen && <button aria-label="Cerrar navegación" className="fixed inset-0 z-30 bg-black/45 md:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar - Theme Vivero */}
      <aside className={`premium-sidebar fixed inset-y-0 left-0 z-40 w-72 shrink-0 bg-[#1a2f26] text-emerald-50 flex flex-col shadow-2xl transition-transform md:static md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-6 py-5 flex items-center gap-3 bg-black/10">
          <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-900/50">
            <TreePine className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wide text-white">ViveroSmart</h1>
            <p className="text-emerald-400/80 text-xs font-bold uppercase tracking-widest mt-1">Enterprise Edition</p>
          </div><button className="ml-auto md:hidden" onClick={() => setMobileOpen(false)} aria-label="Cerrar navegación"><X size={20}/></button>
        </div>

        <div className="relative px-4 pt-4"><button onClick={() => { setWorkspaceOpen(value => !value); setShowAccount(false); setShowNotifications(false); }} className="workspace-label flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left hover:bg-white/10"><span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500 font-black text-white">V</span><span className="flex-1 text-sm font-bold">Mi vivero<small className="block font-normal text-emerald-200/60">Espacio de trabajo</small></span><ChevronDown size={16}/></button>{workspaceOpen && <div className="workspace-popover absolute left-4 right-4 top-full z-50 mt-2 rounded-xl border border-emerald-700 bg-[#214438] p-2 shadow-xl"><button onClick={() => navigate('/dashboard/sectores')} className="flex w-full items-center justify-between rounded-lg p-2 text-sm hover:bg-white/10">Ver sectores <ArrowUpRight size={14}/></button><button onClick={() => navigate('/simulador')} className="flex w-full items-center justify-between rounded-lg p-2 text-sm hover:bg-white/10">Abrir simulador <ArrowUpRight size={14}/></button></div>}</div>

        <nav className="flex-1 px-4 pb-4 overflow-y-auto">
          {sections.map(section => <div key={section} className="mt-5"><p className="px-4 mb-2 text-[10px] font-bold text-emerald-500/60 uppercase tracking-[.16em]">{section}</p>{menuItems.filter(item => item.section === section).map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-200 text-sm font-semibold ${
                  isActive
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 -translate-y-0.5'
                  : 'text-emerald-100/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            )
          })}</div>)}

          <div className="pt-8 mt-8 border-t border-white/10 relative">
            <p className="px-4 text-xs font-bold text-emerald-500/50 uppercase tracking-widest mb-4">Herramientas Visuales</p>
            <button
              onClick={() => navigate('/simulador')}
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
      </aside>

      {/* Main Content Area */}
      <div className="min-w-0 flex-1 overflow-auto flex flex-col relative">
        {/* Top Navbar */}
        <header className="premium-topbar h-20 bg-white border-b border-stone-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 shadow-sm">
          <button className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 text-stone-600 md:hidden" onClick={() => setMobileOpen(true)} aria-label="Abrir navegación"><Menu size={20}/></button>
          <div className="ml-auto flex items-center gap-4 relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative w-10 h-10 bg-white border border-stone-200 rounded-full flex items-center justify-center text-stone-500 hover:text-emerald-600 hover:border-emerald-300 transition-colors shadow-sm">
              <Bell size={20} />
              {alerts.length > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
            </button>
            <button aria-label="Abrir menú de usuario" onClick={() => setShowAccount(!showAccount)} className="topbar-avatar w-10 h-10 bg-emerald-600 border border-emerald-700 rounded-full flex items-center justify-center text-white text-xs font-black hover:bg-emerald-700 transition-colors shadow-sm">
              {(currentUser.name || role).split(/\s+/).map(x => x[0]).join('').slice(0,2).toUpperCase()}
            </button>
            {showAccount && <div className="account-popover absolute top-12 right-0 w-64 bg-white border border-stone-200 rounded-2xl shadow-xl p-3 z-50"><div className="p-3 border-b"><b className="block">{currentUser.name || 'Usuario'}</b><small className="text-emerald-600">{role}</small></div><button onClick={() => { setShowAccount(false); navigate('/dashboard/cuenta'); }} className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-stone-50"><UserRound size={17}/> Mi cuenta</button><button onClick={handleLogout} className="w-full flex items-center gap-2 p-3 rounded-lg text-red-600 hover:bg-red-50"><LogOut size={17}/> Cerrar sesión</button></div>}

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

        <div className="premium-content flex-1 pb-12">
          <div data-dashboard-path={normalizedPath}>{currentPage}</div>
        </div>
      </div>

    </div>
  );
}
