import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';
import { FileText, Table, Filter, Plus, Search } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Reportes() {
  const [consumos, setConsumos] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [resource, setResource] = useState('ALL');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('desc');
  const [manualOpen, setManualOpen] = useState(false);
  const [manual, setManual] = useState({ resourceType: 'AGUA', quantity: '', sectorId: '', timestamp: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const [resConsumos, resSectores] = await Promise.all([
        axios.get(`${API_URL}/smart/consumos`, { headers }),
        axios.get(`${API_URL}/smart/sectores`, { headers })
      ]);
      setConsumos(resConsumos.data);
      setSectores(resSectores.data);
    } catch (error) {
      if (error.response?.status === 401) navigate('/');
    }
  };

  const filteredConsumos = consumos.filter(c => {
    const date = new Date(c.timestamp);
    const text = `${c.id} ${c.resourceType} ${c.sector?.name || ''} ${c.quantity}`.toLowerCase();
    return (selectedSector === 'ALL' || c.sectorId === Number(selectedSector))
      && (resource === 'ALL' || c.resourceType === resource)
      && (!from || date >= new Date(`${from}T00:00:00`))
      && (!to || date <= new Date(`${to}T23:59:59`))
      && text.includes(query.toLowerCase());
  }).sort((a, b) => sort === 'asc' ? new Date(a.timestamp) - new Date(b.timestamp) : new Date(b.timestamp) - new Date(a.timestamp));

  const registerManual = async event => {
    event.preventDefault();
    await axios.post(`${API_URL}/smart/consumos`, { ...manual, quantity: Number(manual.quantity), sectorId: Number(manual.sectorId), isManual: true, timestamp: manual.timestamp || undefined }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    setManual({ resourceType: 'AGUA', quantity: '', sectorId: '', timestamp: '' }); setManualOpen(false); fetchData();
  };

  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      
      const sectorName = selectedSector === 'ALL' 
        ? 'Todos los Sectores' 
        : sectores.find(s => s.id === Number(selectedSector))?.name || 'Sector Específico';
      
      doc.text(`Reporte de Consumos - ${sectorName}`, 14, 15);
      
      const tableColumn = ["ID", "Recurso", "Cantidad", "Tipo", "Sector", "Fecha"];
      const tableRows = [];

      filteredConsumos.forEach(c => {
        const rowData = [
          c.id,
          c.resourceType,
          `${c.quantity} ${c.resourceType === 'AGUA' ? 'L' : 'kWh'}`,
          c.isManual ? 'Manual' : 'Automático',
          c.sector?.name || 'N/A',
          new Date(c.timestamp).toLocaleString()
        ];
        tableRows.push(rowData);
      });

      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
      doc.save(`reporte_${sectorName.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      alert("Hubo un error al generar el PDF. Revisa la consola.");
    }
  };

  const exportExcel = () => {
    const data = filteredConsumos.map(c => ({
      ID: c.id,
      Recurso: c.resourceType,
      Cantidad: c.quantity,
      Unidad: c.resourceType === 'AGUA' ? 'Litros' : 'kWh',
      Registro: c.isManual ? 'Manual' : 'Automático',
      Sector: c.sector?.name || 'N/A',
      Fecha: new Date(c.timestamp).toLocaleString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Consumos");
    
    const sectorName = selectedSector === 'ALL' 
      ? 'Todos' 
      : sectores.find(s => s.id === Number(selectedSector))?.name || 'Sector';
    
    XLSX.writeFile(workbook, `reporte_consumos_${sectorName.replace(/\s+/g, '_').toLowerCase()}.xlsx`);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Historial y Reportes (Auditoría)</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-2 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 px-2 border-r border-gray-200">
            <Filter size={18} className="text-gray-500" />
            <select 
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-transparent border-none outline-none text-gray-700 font-medium cursor-pointer"
            >
              <option value="ALL">Todos los Invernaderos</option>
              {sectores.map(sector => (
                <option key={sector.id} value={sector.id}>{sector.name}</option>
              ))}
            </select>
          </div>
          
          <button onClick={exportPDF} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 transition">
            <FileText size={18} /> Exportar PDF
          </button>
          <button onClick={exportExcel} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition">
            <Table size={18} /> Exportar Excel
          </button>
          <button onClick={() => setManualOpen(value => !value)} className="flex items-center gap-2 bg-emerald-800 text-white px-4 py-2 rounded shadow"><Plus size={18}/> Registro manual</button>
        </div>
      </div>

      {manualOpen && <form onSubmit={registerManual} className="mb-5 p-4 border rounded-lg bg-emerald-50 grid gap-3 md:grid-cols-5"><select value={manual.resourceType} onChange={e=>setManual({...manual,resourceType:e.target.value})}><option value="AGUA">Agua</option><option value="ENERGIA">Energía</option></select><input required min="0" type="number" step="0.01" placeholder="Cantidad" value={manual.quantity} onChange={e=>setManual({...manual,quantity:e.target.value})}/><select required value={manual.sectorId} onChange={e=>setManual({...manual,sectorId:e.target.value})}><option value="">Sector</option>{sectores.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><input type="datetime-local" value={manual.timestamp} onChange={e=>setManual({...manual,timestamp:e.target.value})}/><button className="bg-emerald-600 text-white rounded px-3 font-bold">Guardar lectura</button></form>}

      <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-3"><label className="flex items-center gap-2 border rounded px-3"><Search size={16}/><input className="w-full" placeholder="Buscar" value={query} onChange={e=>setQuery(e.target.value)}/></label><select value={resource} onChange={e=>setResource(e.target.value)}><option value="ALL">Todos los recursos</option><option value="AGUA">Agua</option><option value="ENERGIA">Energía</option></select><input type="date" aria-label="Desde" value={from} onChange={e=>setFrom(e.target.value)}/><input type="date" aria-label="Hasta" value={to} onChange={e=>setTo(e.target.value)}/><select value={sort} onChange={e=>setSort(e.target.value)}><option value="desc">Más reciente primero</option><option value="asc">Más antiguo primero</option></select></div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recurso</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registro</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredConsumos.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{c.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${c.resourceType === 'AGUA' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {c.resourceType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                  {c.quantity} {c.resourceType === 'AGUA' ? 'L' : 'kWh'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.sector?.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.isManual ? 'Manual' : 'Automático'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(c.timestamp).toLocaleString()}</td>
              </tr>
            ))}
            {filteredConsumos.length === 0 && (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No hay registros para este invernadero</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
