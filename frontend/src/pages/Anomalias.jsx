import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const headers = {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
};

export default function Anomalias() {
  const [data, setData] = useState([]);

  const load = () =>
    axios
      .get(`${API_URL}/smart/anomalias`, {
        params: {
          unresolved: 'true',
        },
        ...headers,
      })
      .then((r) => setData(r.data));

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const resolve = async (id) => {
    await axios.put(
      `${API_URL}/smart/anomalias/${id}/resolver`,
      {},
      headers
    );

    load();
  };

  return (
    <div className="min-h-full bg-[#f7f8f6] p-6 lg:p-8">

      {/* HEADER */}
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Monitoreo
        </p>

        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Consumos anormales
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Lecturas que excedieron advertencias o límites críticos
          y requieren revisión.
        </p>
      </div>

      {/* RESUMEN */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Anomalías pendientes
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {data.length}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Requieren revisión
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Estado
          </p>

          <div className="mt-3 flex items-center gap-3">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                data.length
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />

            <span className="text-sm font-semibold text-slate-700">
              {data.length
                ? 'Revisión pendiente'
                : 'Sin anomalías pendientes'}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            {data.length
              ? 'Existen consumos que requieren atención.'
              : 'No existen consumos pendientes de revisión.'}
          </p>
        </div>
      </div>

      {/* TABLA */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

        <div className="border-b border-slate-100 px-5 py-5 lg:px-6">
          <h3 className="text-base font-semibold text-slate-900">
            Anomalías detectadas
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Revisa las lecturas y marca como resueltas aquellas
            que ya hayan sido atendidas.
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
                  Sector
                </th>

                <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Recurso
                </th>

                <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Cantidad
                </th>

                <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Nivel
                </th>

                <th className="min-w-[240px] whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Motivo
                </th>

                <th className="whitespace-nowrap px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Acción
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {data.map((x) => (
                <tr
                  key={x.id}
                  className="transition hover:bg-slate-50/70"
                >

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                    {new Date(x.timestamp).toLocaleString('es')}
                  </td>

                  <td className="px-5 py-4 text-sm font-medium text-slate-700">
                    {x.sector?.name || '—'}
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {x.resourceType}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-700">
                    {x.quantity}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        x.level === 'CRITICAL'
                          ? 'bg-red-50 text-red-700'
                          : x.level === 'WARNING'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {x.level}
                    </span>
                  </td>

                  <td className="max-w-md px-5 py-4 text-sm leading-5 text-slate-600">
                    {x.reason}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 active:scale-[0.98]"
                      onClick={() => resolve(x.id)}
                    >
                      Resolver
                    </button>
                  </td>

                </tr>
              ))}

              {!data.length && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-14 text-center"
                  >
                    <p className="text-sm font-semibold text-slate-700">
                      No hay anomalías pendientes
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Todas las lecturas se encuentran dentro
                      del estado esperado.
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