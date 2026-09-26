import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const headers = {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
};

export default function Auditoria() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState({
    action: '',
    from: '',
    to: '',
  });
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const r = await axios.get(
        `${API_URL}/smart/auditoria`,
        {
          params: filter,
          ...headers,
        }
      );

      setLogs(r.data);
      setError('');
    } catch {
      setError('No se pudo cargar la auditoría.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateFilter = (field, value) => {
    setFilter((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const formatDetails = (details) => {
    if (details === null || details === undefined || details === '') {
      return '-';
    }

    if (typeof details === 'string') {
      try {
        const parsed = JSON.parse(details);

        if (typeof parsed === 'object' && parsed !== null) {
          return Object.entries(parsed)
            .map(([key, value]) => {
              if (value === null || value === undefined) {
                return `${key}: -`;
              }

              if (typeof value === 'object') {
                return `${key}: ${JSON.stringify(value)}`;
              }

              return `${key}: ${value}`;
            })
            .join(' | ');
        }

        return String(parsed);
      } catch {
        return details;
      }
    }

    if (typeof details === 'object') {
      return Object.entries(details)
        .map(([key, value]) => {
          if (value === null || value === undefined) {
            return `${key}: -`;
          }

          if (typeof value === 'object') {
            return `${key}: ${JSON.stringify(value)}`;
          }

          return `${key}: ${value}`;
        })
        .join(' | ');
    }

    return String(details);
  };

  return (
    <div className="min-h-full bg-[#f7f8f6] p-6 lg:p-8">

      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Seguridad y control
        </p>

        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Auditoría de operaciones
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Registro de las acciones administrativas y operativas
          realizadas dentro del sistema.
        </p>
      </div>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

        <div className="mb-5">
          <h3 className="text-base font-semibold text-slate-900">
            Buscar operaciones
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Utiliza los filtros para consultar registros específicos.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_auto]">

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Acción
            </label>

            <input
              placeholder="Ej. UPDATE, CREATE, DELETE"
              value={filter.action}
              onChange={(e) =>
                updateFilter('action', e.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

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

          <div className="flex items-end">
            <button
              type="button"
              onClick={load}
              className="h-11 w-full rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98] lg:w-auto"
            >
              Aplicar filtros
            </button>
          </div>

        </div>
      </section>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Registros encontrados
            </p>

            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {logs.length}
            </p>
          </div>

          <p className="text-sm text-slate-500">
            Operaciones correspondientes a los filtros actuales
          </p>

        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4">
          <p className="text-sm font-semibold text-red-700">
            No se pudo cargar la auditoría
          </p>

          <p className="mt-1 text-sm text-red-600">
            Comprueba la conexión con el servidor e inténtalo nuevamente.
          </p>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

        <div className="border-b border-slate-100 px-5 py-5 lg:px-6">
          <h3 className="text-base font-semibold text-slate-900">
            Registro de operaciones
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Historial de actividades registradas por el sistema.
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
                  Usuario
                </th>

                <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Acción
                </th>

                <th className="min-w-[420px] px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Detalle
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="transition hover:bg-slate-50/70"
                >

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                    {new Date(log.timestamp).toLocaleString('es')}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                        {(log.user?.name || '-')
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <span className="text-sm font-medium text-slate-700">
                        {log.user?.name || '-'}
                      </span>

                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {log.action}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm leading-6 text-slate-600">
                    <div className="max-w-3xl break-words">
                      {formatDetails(log.details)}
                    </div>
                  </td>

                </tr>
              ))}

              {!logs.length && !error && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-14 text-center"
                  >
                    <p className="text-sm font-semibold text-slate-700">
                      No hay operaciones registradas
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      No se encontraron registros para los filtros aplicados.
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