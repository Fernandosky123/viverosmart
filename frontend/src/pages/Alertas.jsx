import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const headers = {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
};

export default function Alertas() {
  const [alerts, setAlerts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [filter, setFilter] = useState({
    resourceType: '',
    sectorId: '',
    from: '',
    to: '',
  });

  const load = async () => {
    const { data } = await axios.get(
      `${API_URL}/smart/alertas`,
      {
        params: {
          ...filter,
          limit: 200,
        },
        ...headers,
      }
    );

    setAlerts(data);
  };

  useEffect(() => {
    Promise.all([
      load(),
      axios
        .get(`${API_URL}/smart/sectores`, headers)
        .then((r) => setSectors(r.data)),
    ]).catch(() => {});
  }, []);

  const updateFilter = (field, value) => {
    setFilter((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-full bg-[#f7f8f6] p-6 lg:p-8">

      {/* HEADER */}
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Monitoreo
        </p>

        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Centro de alertas
          </h2>

          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            Consulta los consumos que superaron los límites configurados
            y revisa las incidencias detectadas en tus sectores.
          </p>
        </div>
      </div>

      {/* FILTROS */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

        <div className="mb-5">
          <h3 className="text-base font-semibold text-slate-900">
            Filtrar alertas
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Ajusta los criterios para encontrar las alertas que necesitas.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          {/* RECURSO */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Recurso
            </label>

            <select
              value={filter.resourceType}
              onChange={(e) =>
                updateFilter('resourceType', e.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">Todos los recursos</option>
              <option value="AGUA">Agua</option>
              <option value="ENERGIA">Energía</option>
            </select>
          </div>

          {/* SECTOR */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Sector
            </label>

            <select
              value={filter.sectorId}
              onChange={(e) =>
                updateFilter('sectorId', e.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">Todos los sectores</option>

              {sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* DESDE */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Desde
            </label>

            <input
              type="date"
              value={filter.from}
              onChange={(e) =>
                updateFilter('from', e.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          {/* HASTA */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Hasta
            </label>

            <input
              type="date"
              value={filter.to}
              onChange={(e) =>
                updateFilter('to', e.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          {/* BOTÓN */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={load}
              className="h-11 w-full rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      </section>

      {/* RESUMEN */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Alertas encontradas
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {alerts.length}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Según los filtros seleccionados
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Estado del monitoreo
          </p>

          <div className="mt-3 flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

            <span className="text-sm font-semibold text-slate-700">
              Sistema activo
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Las alertas disponibles corresponden a los criterios actuales.
          </p>
        </div>
      </div>

      {/* TABLA */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

        <div className="border-b border-slate-100 px-5 py-5 lg:px-6">
          <h3 className="text-base font-semibold text-slate-900">
            Historial de alertas
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Registro de consumos que superaron los límites configurados.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">

            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Fecha
                </th>

                <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Recurso
                </th>

                <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Sector
                </th>

                <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Nivel
                </th>

                <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Motivo
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {alerts.map((a) => (
                <tr
                  key={a.id}
                  className="transition hover:bg-slate-50/70"
                >
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                    {new Date(a.timestamp).toLocaleString('es')}
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {a.resourceType}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm font-medium text-slate-700">
                    {a.sector?.name || '—'}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        a.level === 'CRITICAL'
                          ? 'bg-red-50 text-red-700'
                          : a.level === 'WARNING'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {a.level}
                    </span>
                  </td>

                  <td className="max-w-md px-5 py-4 text-sm leading-5 text-slate-600">
                    {a.reason}
                  </td>
                </tr>
              ))}

              {!alerts.length && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-14 text-center"
                  >
                    <p className="text-sm font-semibold text-slate-700">
                      No hay alertas
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      No se encontraron alertas para los filtros aplicados.
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