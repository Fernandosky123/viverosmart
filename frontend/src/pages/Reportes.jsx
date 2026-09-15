import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from 'xlsx';
import { Download, FileText, Table } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Reportes() {
  const [consumos, setConsumos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchConsumos();
  }, []);

  const fetchConsumos = async () => {
    try {
      const res = await axios.get(`${API_URL}/smart/consumos`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setConsumos(res.data);
    } catch (error) {
      if(error.response?.status === 401) navigate('/');
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Consumos - ViveroSmart", 14, 15);
    
    const tableColumn = ["ID", "Recurso", "Cantidad", "Tipo", "Sector", "Fecha"];
    const tableRows = [];

    consumos.forEach(c => {
      const rowData = [
        c.id,
        c.resourceType,
        `${c.quantity} ${c.resourceType === 'AGUA' ? 'L' : 'kWh'}`,
        c.isManual ? 'Manual' : 'Automático (Sensor)',
        c.sector?.name || 'N/A',
        new Date(c.timestamp).toLocaleString()
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 });
    doc.save("reporte_consumos.pdf");
  };

  const exportExcel = () => {
    const data = consumos.map(c => ({
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
    XLSX.writeFile(workbook, "reporte_consumos.xlsx");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Historial y Reportes (Auditoría)</h2>
        <div className="flex gap-4">
          <button onClick={exportPDF} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700">
            <FileText size={18} /> Exportar PDF
          </button>
          <button onClick={exportExcel} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">
            <Table size={18} /> Exportar Excel
          </button>
        </div>
      </div>

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
            {consumos.map(c => (
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
            {consumos.length === 0 && (
              <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No hay registros de consumo</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
