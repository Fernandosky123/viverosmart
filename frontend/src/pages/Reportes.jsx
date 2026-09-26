import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

  const [manual, setManual] = useState({
    resourceType: 'AGUA',
    quantity: '',
    sectorId: '',
    timestamp: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      };

      const [resConsumos, resSectores] = await Promise.all([
        axios.get(`${API_URL}/smart/consumos`, { headers }),
        axios.get(`${API_URL}/smart/sectores`, { headers }),
      ]);

      setConsumos(resConsumos.data);
      setSectores(resSectores.data);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/');
      }
    }
  };

  const filteredConsumos = consumos
    .filter((c) => {
      const date = new Date(c.timestamp);

      const text =
        `${c.id} ${c.resourceType} ${c.sector?.name || ''} ${c.quantity}`
          .toLowerCase();

      return (
        (selectedSector === 'ALL' ||
          c.sectorId === Number(selectedSector)) &&
        (resource === 'ALL' || c.resourceType === resource) &&
        (!from || date >= new Date(`${from}T00:00:00`)) &&
        (!to || date <= new Date(`${to}T23:59:59`)) &&
        text.includes(query.toLowerCase())
      );
    })
    .sort((a, b) =>
      sort === 'asc'
        ? new Date(a.timestamp) - new Date(b.timestamp)
        : new Date(b.timestamp) - new Date(a.timestamp)
    );

  const registerManual = async (event) => {
    event.preventDefault();

    try {
      await axios.post(
        `${API_URL}/smart/consumos`,
        {
          ...manual,
          quantity: Number(manual.quantity),
          sectorId: Number(manual.sectorId),
          isManual: true,
          timestamp: manual.timestamp || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setManual({
        resourceType: 'AGUA',
        quantity: '',
        sectorId: '',
        timestamp: '',
      });

      setManualOpen(false);

      fetchData();
    } catch (error) {
      console.error('Error al registrar consumo:', error);
      alert('No se pudo registrar la lectura.');
    }
  };

  const exportPDF = () => {
    try {
      const doc = new jsPDF();

      const sectorName =
        selectedSector === 'ALL'
          ? 'Todos los Sectores'
          : sectores.find(
              (s) => s.id === Number(selectedSector)
            )?.name || 'Sector Específico';

      doc.text(
        `Reporte de Consumos - ${sectorName}`,
        14,
        15
      );

      const tableColumn = [
        'ID',
        'Recurso',
        'Cantidad',
        'Tipo',
        'Sector',
        'Fecha',
      ];

      const tableRows = [];

      filteredConsumos.forEach((c) => {
        const rowData = [
          c.id,
          c.resourceType,
          `${c.quantity} ${
            c.resourceType === 'AGUA' ? 'L' : 'kWh'
          }`,
          c.isManual ? 'Manual' : 'Automático',
          c.sector?.name || 'N/A',
          new Date(c.timestamp).toLocaleString(),
        ];

        tableRows.push(rowData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });

      doc.save(
        `reporte_${sectorName
          .replace(/\s+/g, '_')
          .toLowerCase()}.pdf`
      );
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert(
        'Hubo un error al generar el PDF. Revisa la consola.'
      );
    }
  };

  const exportExcel = () => {
    const data = filteredConsumos.map((c) => ({
      ID: c.id,
      Recurso: c.resourceType,
      Cantidad: c.quantity,
      Unidad:
        c.resourceType === 'AGUA' ? 'Litros' : 'kWh',
      Registro: c.isManual ? 'Manual' : 'Automático',
      Sector: c.sector?.name || 'N/A',
      Fecha: new Date(c.timestamp).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Consumos'
    );

    const sectorName =
      selectedSector === 'ALL'
        ? 'Todos'
        : sectores.find(
            (s) => s.id === Number(selectedSector)
          )?.name || 'Sector';

    XLSX.writeFile(
      workbook,
      `reporte_consumos_${sectorName
        .replace(/\s+/g, '_')
        .toLowerCase()}.xlsx`
    );
  };

  return (
    <div className="min-h-full bg-[#f7f8f6] p-6 lg:p-8">

      {/* ENCABEZADO */}

      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Operación
        </p>

        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Historial y Reportes
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Consulta, filtra y exporta el historial de consumos
          registrados en los sectores.
        </p>
      </div>

      {/* BARRA SUPERIOR */}

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

        <div className="grid gap-4 lg:grid-cols-2">

          {/* SECTOR */}

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sector
            </label>

            <select
              value={selectedSector}
              onChange={(e) =>
                setSelectedSector(e.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="ALL">
                Todos los Invernaderos
              </option>

              {sectores.map((sector) => (
                <option
                  key={sector.id}
                  value={sector.id}
                >
                  {sector.name}
                </option>
              ))}
            </select>
          </div>

          {/* RECURSO */}

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Recurso
            </label>

            <select
              value={resource}
              onChange={(e) =>
                setResource(e.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="ALL">
                Todos los recursos
              </option>

              <option value="AGUA">
                Agua
              </option>

              <option value="ENERGIA">
                Energía
              </option>
            </select>
          </div>

        </div>

        {/* BOTONES */}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">

          <button
            onClick={exportPDF}
            className="h-11 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Exportar PDF
          </button>

          <button
            onClick={exportExcel}
            className="h-11 rounded-xl bg-green-600 px-5 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            Exportar Excel
          </button>

          <button
            onClick={() =>
              setManualOpen((value) => !value)
            }
            className="h-11 rounded-xl bg-emerald-800 px-5 text-sm font-semibold text-white transition hover:bg-emerald-900"
          >
            {manualOpen
              ? 'Cerrar registro'
              : 'Registro manual'}
          </button>

        </div>

      </div>

      {/* REGISTRO MANUAL */}

      {manualOpen && (
        <form
          onSubmit={registerManual}
          className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5"
        >

          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900">
              Registrar consumo manual
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Ingresa los datos de la lectura que deseas
              registrar.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Recurso
              </label>

              <select
                value={manual.resourceType}
                onChange={(e) =>
                  setManual({
                    ...manual,
                    resourceType: e.target.value,
                  })
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="AGUA">
                  Agua
                </option>

                <option value="ENERGIA">
                  Energía
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Cantidad
              </label>

              <input
                required
                min="0"
                step="0.01"
                type="number"
                placeholder="Cantidad"
                value={manual.quantity}
                onChange={(e) =>
                  setManual({
                    ...manual,
                    quantity: e.target.value,
                  })
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Sector
              </label>

              <select
                required
                value={manual.sectorId}
                onChange={(e) =>
                  setManual({
                    ...manual,
                    sectorId: e.target.value,
                  })
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="">
                  Seleccionar sector
                </option>

                {sectores.map((sector) => (
                  <option
                    key={sector.id}
                    value={sector.id}
                  >
                    {sector.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Fecha y hora
              </label>

              <input
                type="datetime-local"
                value={manual.timestamp}
                onChange={(e) =>
                  setManual({
                    ...manual,
                    timestamp: e.target.value,
                  })
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="h-11 w-full rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Guardar lectura
              </button>
            </div>

          </div>

        </form>
      )}

      {/* FILTROS */}

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900">
            Filtros
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Filtra los registros por texto, fecha o
            antigüedad.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

          {/* BUSCAR */}

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Buscar
            </label>

            <input
              type="text"
              placeholder="Buscar registros..."
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          {/* DESDE */}

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Desde
            </label>

            <input
              type="date"
              value={from}
              onChange={(e) =>
                setFrom(e.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          {/* HASTA */}

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Hasta
            </label>

            <input
              type="date"
              value={to}
              onChange={(e) =>
                setTo(e.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          {/* ORDEN */}

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Orden
            </label>

            <select
              value={sort}
              onChange={(e) =>
                setSort(e.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="desc">
                Más reciente primero
              </option>

              <option value="asc">
                Más antiguo primero
              </option>
            </select>
          </div>

        </div>

      </div>

      {/* TABLA */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between lg:p-6">

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Auditoría
            </p>

            <h3 className="mt-1 text-xl font-bold text-slate-900">
              Historial de consumos
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Registros encontrados según los filtros
              seleccionados.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-3">

            <span className="block text-xs text-slate-400">
              Registros
            </span>

            <span className="mt-1 block text-lg font-bold text-slate-800">
              {filteredConsumos.length}
            </span>

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  ID
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Recurso
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Cantidad
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Sector
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Registro
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Fecha
                </th>

              </tr>
            </thead>

            <tbody>

              {filteredConsumos.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50/70"
                >

                  <td className="px-6 py-4 text-sm text-slate-500">
                    #{c.id}
                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`inline-flex rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                        c.resourceType === 'AGUA'
                          ? 'border-blue-200 bg-blue-50 text-blue-700'
                          : 'border-amber-200 bg-amber-50 text-amber-700'
                      }`}
                    >
                      {c.resourceType}
                    </span>

                  </td>

                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                    {c.quantity}{' '}
                    {c.resourceType === 'AGUA'
                      ? 'L'
                      : 'kWh'}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {c.sector?.name || 'N/A'}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {c.isManual
                      ? 'Manual'
                      : 'Automático'}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(
                      c.timestamp
                    ).toLocaleString()}
                  </td>

                </tr>
              ))}

              {filteredConsumos.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center"
                  >
                    <p className="text-sm font-semibold text-slate-700">
                      No hay registros
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      No se encontraron consumos con los
                      filtros seleccionados.
                    </p>
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}