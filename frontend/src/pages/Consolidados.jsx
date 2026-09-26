import { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Consolidados() {
  const [period, setPeriod] = useState('day');
  const [data, setData] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = async () => {
    const r = await axios.get(
      `${API_URL}/smart/consumos/consolidados`,
      {
        params: {
          period,
          from: from || undefined,
          to: to || undefined,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    setData(r.data);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      data.map((x) => ({
        'Período': x.period,
        'Agua (L)': x.AGUA,
        'Energía (kWh)': x.ENERGIA,
      }))
    );

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      'Consolidados'
    );

    XLSX.writeFile(
      wb,
      `reporte_${
        period === 'day' ? 'diario' : 'mensual'
      }.xlsx`
    );
  };

  return (
    <div className="min-h-full bg-[#f7f8f6] p-6 lg:p-8">

      {/* HEADER */}
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Reportes
        </p>

        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Reportes consolidados
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Consulta los totales de consumo de agua y energía
          agrupados por día o por mes.
        </p>
      </div>

      {/* CONFIGURACIÓN DEL REPORTE */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] lg:p-6">

        <div className="mb-6">
          <h3 className="text-base font-semibold text-slate-900">
            Configurar reporte
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Selecciona el período y el rango de fechas que deseas consultar.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">

          {/* AGRUPACIÓN */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Agrupación
            </label>

            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="day">Diario</option>
              <option value="month">Mensual</option>
            </select>
          </div>

          {/* DESDE */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Desde
            </label>

            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
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
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          {/* GENERAR */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={load}
              className="h-11 w-full rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
            >
              Generar reporte
            </button>
          </div>

          {/* EXPORTAR */}
          <div className="flex items-end">
            <button
              type="button"
              disabled={!data.length}
              onClick={exportExcel}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-50 disabled:text-slate-300"
            >
              Exportar Excel
            </button>
          </div>

        </div>
      </section>

      {/* RESUMEN */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Registros
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {data.length}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Períodos incluidos
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Agrupación
          </p>

          <p className="mt-2 text-xl font-bold text-slate-900">
            {period === 'day' ? 'Diaria' : 'Mensual'}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Forma de consolidación
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
                  ? 'bg-emerald-500'
                  : 'bg-slate-300'
              }`}
            />

            <span className="text-sm font-semibold text-slate-700">
              {data.length
                ? 'Reporte generado'
                : 'Sin reporte'}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            {data.length
              ? 'Los datos están listos para consultar o exportar.'
              : 'Configura los filtros para generar un reporte.'}
          </p>
        </div>

      </div>

      {/* TABLA */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

        <div className="border-b border-slate-100 px-5 py-5 lg:px-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Datos consolidados
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Resumen de consumo de agua y energía.
              </p>
            </div>

            {data.length > 0 && (
              <span className="w-fit rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                {data.length} registros
              </span>
            )}

          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">

            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">

                <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Período
                </th>

                <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Agua
                </th>

                <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Energía
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {data.map((item) => (
                <tr
                  key={item.period}
                  className="transition hover:bg-slate-50/70"
                >

                  <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-700">
                    {item.period}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="text-sm font-semibold text-slate-700">
                      {item.AGUA ?? '—'}
                    </span>

                    <span className="ml-2 text-xs text-slate-400">
                      L
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="text-sm font-semibold text-slate-700">
                      {item.ENERGIA ?? '—'}
                    </span>

                    <span className="ml-2 text-xs text-slate-400">
                      kWh
                    </span>
                  </td>

                </tr>
              ))}

              {data.length === 0 && (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-14 text-center"
                  >
                    <p className="text-sm font-semibold text-slate-700">
                      No hay datos para mostrar
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Selecciona un período y genera el reporte.
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