import { useState, useEffect } from 'react';
import axios from 'axios';
import { Sun, Droplets, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PlantAvatar = ({ type }) => {
  const isTomato = type.toLowerCase().includes('tomat') || type.toLowerCase().includes('solanum');
  const isSunflower = type.toLowerCase().includes('girasol') || type.toLowerCase().includes('helianthus');

  if (isTomato) {
    return (
      <svg width="60" height="60" viewBox="0 0 100 120" className="drop-shadow-lg transform transition-transform group-hover:scale-110">
        <path d="M50 120 Q48 70 52 20" stroke="#2E7D32" strokeWidth="4" fill="none" />
        <path d="M52 80 Q70 70 80 50" stroke="#388E3C" strokeWidth="3" fill="none" />
        <path d="M49 60 Q30 55 20 40" stroke="#388E3C" strokeWidth="3" fill="none" />
        <path d="M80 50 Q85 45 90 52 Q82 58 80 50" fill="#4CAF50" />
        <path d="M20 40 Q15 35 10 42 Q18 48 20 40" fill="#4CAF50" />
        <circle cx="70" cy="90" r="12" fill="#E53935" stroke="#B71C1C" strokeWidth="1" />
        <circle cx="30" cy="70" r="14" fill="#E53935" stroke="#B71C1C" strokeWidth="1" />
        <circle cx="60" cy="30" r="10" fill="#FF5252" stroke="#D32F2F" strokeWidth="1" />
      </svg>
    );
  }

  if (isSunflower) {
    return (
      <svg width="60" height="60" viewBox="0 0 100 120" className="drop-shadow-lg transform transition-transform group-hover:scale-110">
        {/* Tallo */}
        <path d="M50 120 Q50 70 50 30" stroke="#4CAF50" strokeWidth="4" fill="none" />
        <path d="M50 80 Q70 70 75 85 Q65 90 50 80" fill="#81C784" />
        <path d="M50 60 Q30 50 25 65 Q35 70 50 60" fill="#81C784" />
        {/* Petalos (Girasol) */}
        <circle cx="50" cy="30" r="22" fill="#FFD54F" />
        <path d="M50 0 L55 15 L45 15 Z" fill="#FFC107" />
        <path d="M50 60 L55 45 L45 45 Z" fill="#FFC107" />
        <path d="M20 30 L35 25 L35 35 Z" fill="#FFC107" />
        <path d="M80 30 L65 25 L65 35 Z" fill="#FFC107" />
        <path d="M28 9 L40 18 L34 23 Z" fill="#FFC107" />
        <path d="M72 9 L60 18 L66 23 Z" fill="#FFC107" />
        <path d="M72 51 L60 42 L66 37 Z" fill="#FFC107" />
        <path d="M28 51 L40 42 L34 37 Z" fill="#FFC107" />
        {/* Centro (Semillas) */}
        <circle cx="50" cy="30" r="12" fill="#5D4037" stroke="#3E2723" strokeWidth="2" />
        <circle cx="50" cy="30" r="8" fill="#4E342E" stroke="#3E2723" strokeWidth="1" strokeDasharray="2,2" />
      </svg>
    );
  }

  // Generic Plant
  return (
    <svg width="60" height="60" viewBox="0 0 100 120" className="drop-shadow-lg transform transition-transform group-hover:scale-110">
      <path d="M50 120 Q50 80 50 60" stroke="#4CAF50" strokeWidth="4" fill="none" />
      <path d="M50 60 Q20 60 20 30 Q50 30 50 60" fill="#81C784" stroke="#4CAF50" strokeWidth="2" />
      <path d="M50 70 Q80 70 80 40 Q50 40 50 70" fill="#A5D6A7" stroke="#4CAF50" strokeWidth="2" />
    </svg>
  );
};

export default function MisPlantas() {
  const [plantas, setPlantas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlantas = async () => {
      try {
        const res = await axios.get(`${API_URL}/smart/mis-plantas`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setPlantas(res.data);
      } catch (error) {
        if(error.response?.status === 401) navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchPlantas();
  }, [navigate]);

  if (loading) return <div className="p-10 text-center">Cargando tus plantas...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl shadow-inner">
          <PlantAvatar type="generic" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-800">Mi Seguimiento de Cultivos</h2>
          <p className="text-gray-500">Monitorea el crecimiento y estado de tus plantas en tiempo real.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {plantas.map(planta => (
          <div key={planta.id} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden group hover:shadow-lg transition-all">

            {/* Header / Especie */}
            <div className="p-6 border-b border-stone-100 bg-gradient-to-br from-emerald-50 to-white relative overflow-hidden h-32 flex flex-col justify-center">
              <div className="absolute right-4 bottom-4">
                <PlantAvatar type={planta.species || planta.name} />
              </div>
              <h3 className="text-xl font-black text-emerald-900 relative z-10 w-3/4 leading-tight">{planta.name}</h3>
              <p className="text-sm font-bold text-emerald-600/70 uppercase tracking-widest relative z-10">{planta.species || 'Especie general'}</p>
            </div>

            {/* Body / Progreso */}
            <div className="p-6 space-y-6">

              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-stone-500 uppercase tracking-wider">Etapa Actual</span>
                  <span className="text-lg font-black text-emerald-700">{planta.stage}</span>
                </div>

                {/* Progress Bar Container */}
                <div className="h-4 w-full bg-stone-100 rounded-full overflow-hidden relative shadow-inner">
                  {/* Progress Bar Fill */}
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000"
                    style={{ width: `${planta.growthPercent}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs font-bold text-stone-400">Semilla</span>
                  <span className="text-xs font-bold text-emerald-600">{planta.growthPercent}% Crecido</span>
                  <span className="text-xs font-bold text-stone-400">Cosecha</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex flex-col items-center justify-center text-center">
                  <Sun size={24} className="text-amber-500 mb-2" />
                  <span className="text-xs font-bold text-amber-700 uppercase">Luz Recibida</span>
                  <span className="text-sm font-black text-amber-900">Óptima</span>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col items-center justify-center text-center">
                  <Droplets size={24} className="text-blue-500 mb-2" />
                  <span className="text-xs font-bold text-blue-700 uppercase">Riego</span>
                  <span className="text-sm font-black text-blue-900">Adecuado</span>
                </div>
              </div>

            </div>
          </div>
        ))}

        {plantas.length === 0 && (
          <div className="col-span-full p-12 bg-white rounded-2xl border-2 border-dashed border-stone-200 text-center">
            <div className="flex justify-center mb-4 opacity-50 grayscale"><PlantAvatar type="generic" /></div>
            <h3 className="text-xl font-bold text-stone-700 mb-2">No tienes cultivos asignados</h3>
            <p className="text-stone-500">Adquiere un plan para empezar a rastrear el crecimiento de tus plantas en nuestro vivero.</p>
            <button onClick={() => navigate('/simulador?nueva=1')} className="mt-6 bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 inline-flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-emerald-200">
              Registrar una planta <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
