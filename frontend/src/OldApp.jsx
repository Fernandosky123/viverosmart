import { useState, useEffect } from 'react';
import axios from 'axios';
import PixelArtVivero from './components/PixelArtVivero';
import MapaPin from './components/MapaPin';
import { Droplet, Sun, AlertTriangle, Info, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function OldApp() {
  const navigate = useNavigate();
  const [plantId, setPlantId] = useState(1);
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulatedMoisture, setSimulatedMoisture] = useState(30);
  
  const soilState = plant?.soilStates?.[0]?.state || 'media';
  const weatherState = plant?.weatherStates?.[0]?.state || 'nublado';
  const recommendation = plant?.recommendations?.[0];

  useEffect(() => {
    fetchPlantData();
  }, [plantId]);

  const fetchPlantData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/plantas/${plantId}`);
      setPlant(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = async (lat, lng) => {
    try {
      await axios.post(`${API_URL}/plantas/${plantId}/ubicacion`, { lat, lng });
      fetchPlantData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRegar = async () => {
    try {
      await axios.post(`${API_URL}/plantas/${plantId}/riego`);
      fetchPlantData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSimularHumedad = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/plantas/${plantId}/simular-humedad`, {
        moisturePercentage: Number(simulatedMoisture)
      });
      fetchPlantData();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading && !plant) return <div className="p-8 text-center text-xl">Cargando vivero clásico...</div>;
  if (!plant && !loading) return <div className="p-8 text-center max-w-md mx-auto">Vivero vacío. Vuelve al Dashboard.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <header className="bg-white shadow rounded-lg p-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-green-700">{plant.name}</h1>
            <p className="text-gray-500 italic">Modo Visual Clásico</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="bg-blue-600 text-white px-4 py-2 rounded">
            Volver a ViveroSmart
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-center">Estado Visual</h2>
              <PixelArtVivero soilState={soilState} weatherState={weatherState} />
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="font-semibold mb-4">Controles Interactivos</h3>
              <button onClick={handleRegar} className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 mb-4 flex justify-center items-center gap-2">
                <Droplet size={18} /> Regar Manualmente (100%)
              </button>
              <form onSubmit={handleSimularHumedad} className="flex gap-2">
                <input type="number" value={simulatedMoisture} onChange={(e) => setSimulatedMoisture(e.target.value)} className="border rounded px-3 py-2 w-full" placeholder="% humedad" min="0" max="100" />
                <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition">Simular</button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`shadow rounded-lg p-6 border-l-4 ${recommendation?.urgencyLevel === 'critico' ? 'bg-red-50 border-red-500' : 'bg-blue-50 border-blue-500'}`}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle /> Recomendación Actual
              </h2>
              <p className="text-lg">{recommendation?.message || 'Todo en orden.'}</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <MapPin size={20} /> Ubicación
              </h2>
              <MapaPin onLocationChange={handleLocationChange} currentLat={plant.lat} currentLng={plant.lng} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
