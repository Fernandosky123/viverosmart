import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const headers = {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
};

export default function Comparacion() {
  const [sectors, setSectors] = useState([]);

  const [period, setPeriod] = useState({
    from: '',
    to: '',
    previousFrom: '',
    previousTo: '',
    resourceType: '',
  });

  const [sector, setSector] = useState({
    sectorA: '',
    sectorB: '',
    from: '',
    to: '',
    resourceType: '',
  });

  const [periodResult, setPeriodResult] = useState(null);
  const [sectorResult, setSectorResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get(`${API_URL}/smart/sectores`, headers)
      .then((r) => setSectors(r.data))
      .catch(() => {});
  }, []);

  const comparePeriod = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.get(
        `${API_URL}/smart/consumos/comparacion`,
        {
          params: period,
          ...headers,
        }
      );

      setPeriodResult(data);
      setError('');
    } catch {
      setError('Completa los períodos correctamente.');
    }
  };

  const compareSectors = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.get(
        `${API_URL}/smart/consumos/comparacion-sectores`,
        {
          params: sector,
          ...headers,
        }
      );

      setSectorResult(data);
      setError('');
    } catch {
      setError('Completa sectores y fechas.');
    }
  };

  const updatePeriod = (field, value) => {
    setPeriod((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateSector = (field, value) => {
    setSector((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const renderCards = (result) => {
    if (!result) return null;

    const entries = Object.entries(result).filter(
      ([key]) => !['sectorA', 'sectorB'].includes(key)
    );

    return (
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {entries.map(([key, value]) => (
          <article
            key={key}
            className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition hover:border-slate-300 hover:bg-white"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {key}
            </p>

            <p className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900">
              {typeof value === 'number'
                ? value.toFixed(2)
                : value ?? '—'}
            </p>
          </article>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-full bg-[#f7f8f6] p-6 lg:p-8">

      {/* HEADER */}
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Análisis
        </p>

        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Comparación de consumos
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Contrasta el comportamiento de los consumos entre distintos
          períodos o sectores.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4">
          <p className="text-sm font-semibold text-red-700">
            No se pudo realizar la comparación
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* COMPARACIÓN DE PERIODOS */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] lg:p-6">

        <div className="mb-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Análisis temporal
          </p>

          <h3 className="text-xl font-bold text-slate-900">
            Comparar períodos
          </h3>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            Compara un período actual con un período anterior para
            identificar cambios en el consumo.
          </p>
        </div>

        <form
          onSubmit={comparePeriod}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-5"
        >

          {/* RECURSO */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Recurso
            </label>

            <select
              value={period.resourceType}
              onChange={(e) =>
                updatePeriod('resourceType', e.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">Agua y energía</option>
              <option value="AGUA">Agua</option>
              <option value="ENERGIA">Energía</option>
            </select>
          </div>

          {/* PERIODO ACTUAL DESDE */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Período actual · Desde
            </label>

            <input
              required
              type="date"
              value={period.from}
              onChange={(e) =>
                updatePeriod('from', e.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          {/* PERIODO ACTUAL HASTA */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Período actual · Hasta
            </label>

            <input
              required
              type="date"
              value={period.to}
              onChange={(e) =>
                updatePeriod('to', e.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          {/* PERIODO ANTERIOR DESDE */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Período anterior · Desde
            </label>

            <input
              required
              type="date"
              value={period.previousFrom}
              onChange={(e) =>
                updatePeriod('previousFrom', e.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          {/* PERIODO ANTERIOR HASTA */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Período anterior · Hasta
            </label>

            <input
              required
              type="date"
              value={period.previousTo}
              onChange={(e) =>
                updatePeriod('previousTo', e.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <button
            type="submit"
            className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98] md:col-span-2 xl:col-span-5"
          >
            Comparar períodos
          </button>
        </form>

        {periodResult && (
          <div className="mt-6 border-t border-slate-100 pt-6">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-800">
                Resultado de la comparación
              </h4>

              <p className="mt-1 text-xs text-slate-400">
                Valores obtenidos para los períodos seleccionados.
              </p>
            </div>

            {renderCards(periodResult)}
          </div>
        )}
      </section>

      {/* COMPARACIÓN DE SECTORES */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] lg:p-6">

        <div className="mb-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Análisis por sector
          </p>

          <h3 className="text-xl font-bold text-slate-900">
            Comparar sectores
          </h3>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            Compara el consumo de dos sectores durante el mismo
            período de tiempo.
          </p>
        </div>

        <form
          onSubmit={compareSectors}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-5"
        >

          {/* SECTOR A */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Primer sector
            </label>

            <select
              required
              value={sector.sectorA}
              onChange={(e) =>
                updateSector('sectorA', e.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">Seleccionar sector</option>

              {sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* SECTOR B */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Segundo sector
            </label>

            <select
              required
              value={sector.sectorB}
              onChange={(e) =>
                updateSector('sectorB', e.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">Seleccionar sector</option>

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
              required
              type="date"
              value={sector.from}
              onChange={(e) =>
                updateSector('from', e.target.value)
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
              required
              type="date"
              value={sector.to}
              onChange={(e) =>
                updateSector('to', e.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          {/* RECURSO */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Recurso
            </label>

            <select
              value={sector.resourceType}
              onChange={(e) =>
                updateSector('resourceType', e.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">Agua y energía</option>
              <option value="AGUA">Agua</option>
              <option value="ENERGIA">Energía</option>
            </select>
          </div>

          <button
            type="submit"
            className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98] md:col-span-2 xl:col-span-5"
          >
            Comparar sectores
          </button>
        </form>

        {sectorResult && (
          <div className="mt-6 border-t border-slate-100 pt-6">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-800">
                Resultado de la comparación
              </h4>

              <p className="mt-1 text-xs text-slate-400">
                Valores obtenidos para los sectores seleccionados.
              </p>
            </div>

            {renderCards(sectorResult)}
          </div>
        )}
      </section>
    </div>
  );
}