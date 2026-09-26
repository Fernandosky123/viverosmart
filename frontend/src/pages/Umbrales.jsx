import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  AlertTriangle,
  Droplets,
  Zap,
  Trash2,
  Save,
  Gauge,
  Globe2,
  Leaf,
} from 'lucide-react';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const headers = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

export default function Umbrales() {
  const [sectors, setSectors] = useState([]);
  const [thresholds, setThresholds] = useState([]);

  const [form, setForm] = useState({
    sectorId: '',
    warningAgua: '',
    agua: '',
    warningEnergia: '',
    energia: '',
  });

  const [message, setMessage] = useState('');

  const load = async () => {
    const [s, t] = await Promise.all([
      axios.get(`${API_URL}/smart/sectores`, headers()),
      axios.get(`${API_URL}/smart/umbrales`, headers()),
    ]);

    setSectors(s.data);
    setThresholds(t.data);
  };

  useEffect(() => {
    load().catch(() => {
      setMessage('No se pudieron cargar los umbrales.');
    });
  }, []);

  const choose = (id) => {
    const w = thresholds.find(
      (t) =>
        t.resourceType === 'AGUA' &&
        String(t.sectorId || '') === String(id)
    );

    const e = thresholds.find(
      (t) =>
        t.resourceType === 'ENERGIA' &&
        String(t.sectorId || '') === String(id)
    );

    setForm({
      sectorId: id,
      warningAgua: w?.warningLimit ?? '',
      agua: w?.maxLimit ?? '',
      warningEnergia: e?.warningLimit ?? '',
      energia: e?.maxLimit ?? '',
    });

    setMessage('');
  };

  const save = async (e) => {
    e.preventDefault();

    if (
      Number(form.warningAgua) >= Number(form.agua) ||
      Number(form.warningEnergia) >= Number(form.energia)
    ) {
      setMessage(
        'La advertencia debe ser menor que el límite crítico.'
      );
      return;
    }

    try {
      await axios.post(
        `${API_URL}/smart/umbrales`,
        form,
        headers()
      );

      setMessage('Umbrales guardados correctamente.');
      await load();
    } catch {
      setMessage('No se pudieron guardar los umbrales.');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('¿Eliminar este umbral?')) return;

    try {
      await axios.delete(
        `${API_URL}/smart/umbrales/${id}`,
        headers()
      );

      await load();
      setMessage('Umbral eliminado.');
    } catch {
      setMessage('No se pudo eliminar el umbral.');
    }
  };

  const waterThresholds = thresholds.filter(
    (t) => t.resourceType === 'AGUA'
  );

  const energyThresholds = thresholds.filter(
    (t) => t.resourceType === 'ENERGIA'
  );

  return (
    <div className="min-h-full bg-[#f7f8f6] p-6 lg:p-8">

      {/* HEADER */}
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Operación
        </p>

        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Umbrales y alertas
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Define los niveles de advertencia y límites críticos
          para controlar el consumo de agua y energía.
        </p>
      </div>

      {/* RESUMEN */}
      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* TOTAL */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Reglas configuradas
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {thresholds.length}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Umbrales registrados
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <Gauge size={19} />
            </div>

          </div>
        </div>

        {/* AGUA */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Agua
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {waterThresholds.length}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Reglas de consumo
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Droplets size={19} />
            </div>

          </div>
        </div>

        {/* ENERGÍA */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Energía
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {energyThresholds.length}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Reglas de consumo
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <Zap size={19} />
            </div>

          </div>
        </div>

        {/* SECTORES */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Sectores
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {sectors.length}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Sectores disponibles
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <Leaf size={19} />
            </div>

          </div>
        </div>

      </div>

      {/* CONFIGURACIÓN */}
      <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] lg:p-6">

        {/* CABECERA */}
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-start gap-3">

            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <AlertTriangle size={19} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Configuración
              </p>

              <h3 className="mt-1 text-xl font-bold text-slate-900">
                Definir umbrales
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Configura advertencias y límites críticos por sector.
              </p>
            </div>

          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <span className="block text-xs text-slate-400">
              Alcance
            </span>

            <span className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              {form.sectorId ? (
                <>
                  <Leaf size={14} />
                  Sector seleccionado
                </>
              ) : (
                <>
                  <Globe2 size={14} />
                  Regla global
                </>
              )}
            </span>
          </div>

        </div>

        <form
          onSubmit={save}
          className="grid gap-5 md:grid-cols-2"
        >

          {/* SECTOR */}
          <div className="md:col-span-2">

            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sector de aplicación
            </label>

            {/* CORREGIDO:
                Se quitó el Leaf absoluto que se superponía
                al texto "Regla global".
            */}
            <div className="relative">

              <select
                value={form.sectorId}
                onChange={(e) => choose(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              >

                <option value="">
                  Regla global
                </option>

                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}

              </select>

            </div>

            <p className="mt-2 text-xs text-slate-400">
              Selecciona un sector para cargar sus reglas existentes.
            </p>

          </div>

          {/* AGUA */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5">

            <div className="mb-5 flex items-center gap-3">

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-blue-600">
                <Droplets size={20} />
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Consumo de agua
                </h4>

                <p className="text-xs text-slate-500">
                  Valores expresados en litros
                </p>
              </div>

            </div>

            <div className="space-y-4">

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Nivel de advertencia
                </label>

                <div className="relative">

                  <input
                    required
                    min="0"
                    type="number"
                    value={form.warningAgua}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        warningAgua: e.target.value,
                      })
                    }
                    placeholder="0"
                    className="h-11 w-full rounded-xl border border-blue-100 bg-white px-4 pr-12 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    L
                  </span>

                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Límite crítico
                </label>

                <div className="relative">

                  <input
                    required
                    min="0"
                    type="number"
                    value={form.agua}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        agua: e.target.value,
                      })
                    }
                    placeholder="0"
                    className="h-11 w-full rounded-xl border border-blue-100 bg-white px-4 pr-12 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    L
                  </span>

                </div>
              </div>

            </div>
          </div>

          {/* ENERGÍA */}
          <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-5">

            <div className="mb-5 flex items-center gap-3">

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-600">
                <Zap size={20} />
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Consumo de energía
                </h4>

                <p className="text-xs text-slate-500">
                  Valores expresados en kWh
                </p>
              </div>

            </div>

            <div className="space-y-4">

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Nivel de advertencia
                </label>

                <div className="relative">

                  <input
                    required
                    min="0"
                    type="number"
                    value={form.warningEnergia}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        warningEnergia: e.target.value,
                      })
                    }
                    placeholder="0"
                    className="h-11 w-full rounded-xl border border-amber-100 bg-white px-4 pr-14 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    kWh
                  </span>

                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Límite crítico
                </label>

                <div className="relative">

                  <input
                    required
                    min="0"
                    type="number"
                    value={form.energia}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        energia: e.target.value,
                      })
                    }
                    placeholder="0"
                    className="h-11 w-full rounded-xl border border-amber-100 bg-white px-4 pr-14 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    kWh
                  </span>

                </div>
              </div>

            </div>
          </div>

          {/* GUARDAR */}
          <div className="flex justify-end border-t border-slate-100 pt-5 md:col-span-2">

            <button
              type="submit"
              className="inline-flex min-h-11 min-w-[170px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
            >
              <Save
                size={17}
                className="shrink-0"
              />

              <span className="whitespace-nowrap">
                Guardar reglas
              </span>
            </button>

          </div>

          {/* MENSAJE */}
          {message && (
            <div
              className={`md:col-span-2 rounded-xl border px-4 py-3 text-sm font-medium ${
                message.includes('menor') ||
                message.includes('No se pudieron') ||
                message.includes('No se pudo')
                  ? 'border-red-100 bg-red-50 text-red-700'
                  : 'border-emerald-100 bg-emerald-50 text-emerald-700'
              }`}
            >
              {message}
            </div>
          )}

        </form>
      </section>

      {/* TABLA */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between lg:p-6">

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Reglas configuradas
            </p>

            <h3 className="mt-1 text-xl font-bold text-slate-900">
              Umbrales registrados
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Consulta y administra los límites establecidos.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-3">

            <span className="block text-xs text-slate-400">
              Total
            </span>

            <span className="mt-1 block text-lg font-bold text-slate-800">
              {thresholds.length}

              <span className="ml-1 text-sm font-normal text-slate-400">
                reglas
              </span>
            </span>

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Sector
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Recurso
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Advertencia
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Límite crítico
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Acción
                </th>

              </tr>
            </thead>

            <tbody>

              {thresholds.map((t) => (

                <tr
                  key={t.id}
                  className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50/70"
                >

                  {/* SECTOR */}
                  <td className="px-6 py-4">

                    <div className="flex items-center gap-3">

                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600">

                        {t.sector?.name ? (
                          <Leaf size={17} />
                        ) : (
                          <Globe2 size={17} />
                        )}

                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {t.sector?.name || 'Global'}
                        </p>

                        {!t.sector?.name && (
                          <p className="text-xs text-slate-400">
                            Aplicación general
                          </p>
                        )}
                      </div>

                    </div>

                  </td>

                  {/* RECURSO */}
                  <td className="px-6 py-4">

                    <span
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                        t.resourceType === 'AGUA'
                          ? 'border-blue-200 bg-blue-50 text-blue-700'
                          : 'border-amber-200 bg-amber-50 text-amber-700'
                      }`}
                    >

                      {t.resourceType === 'AGUA' ? (
                        <Droplets size={14} />
                      ) : (
                        <Zap size={14} />
                      )}

                      {t.resourceType}

                    </span>

                  </td>

                  {/* ADVERTENCIA */}
                  <td className="px-6 py-4">

                    <span className="text-sm font-semibold text-slate-700">
                      {t.warningLimit ?? '-'}
                    </span>

                    <span className="ml-1 text-xs text-slate-400">
                      {t.resourceType === 'AGUA'
                        ? 'L'
                        : 'kWh'}
                    </span>

                  </td>

                  {/* CRÍTICO */}
                  <td className="px-6 py-4">

                    <span className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">

                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

                      {t.maxLimit}{' '}

                      {t.resourceType === 'AGUA'
                        ? 'L'
                        : 'kWh'}

                    </span>

                  </td>

                  {/* ELIMINAR */}
                  <td className="px-6 py-4">

                    <div className="flex justify-end">

                      <button
                        onClick={() => remove(t.id)}
                        title="Eliminar umbral"
                        className="rounded-lg p-2.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >

                        <Trash2
                          size={17}
                          strokeWidth={1.8}
                        />

                      </button>

                    </div>

                  </td>

                </tr>

              ))}

              {thresholds.length === 0 && (
                <tr>

                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center"
                  >

                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-50 text-slate-400">
                      <Gauge size={22} />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No hay umbrales configurados
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Define una regla para comenzar a monitorear
                      los consumos.
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