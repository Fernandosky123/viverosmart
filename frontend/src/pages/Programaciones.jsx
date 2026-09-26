import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CalendarClock,
  Plus,
  Trash2,
  Pencil,
  Clock3,
  Droplets,
  Lightbulb,
} from 'lucide-react';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const headers = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

const empty = {
  type: 'RIEGO',
  sectorId: '',
  date: '',
  time: '08:00',
  durationMins: 30,
  enabled: true,
};

export default function Programaciones() {
  const [items, setItems] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const [programaciones, sectores] = await Promise.all([
        axios.get(
          `${API_URL}/smart/programaciones`,
          headers()
        ),
        axios.get(
          `${API_URL}/smart/sectores`,
          headers()
        ),
      ]);

      setItems(programaciones.data);
      setSectors(sectores.data);
    } catch (error) {
      setMessage('No se pudieron cargar las programaciones.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();

    try {
      const data = {
        ...form,
        sectorId: Number(form.sectorId),
        durationMins: Number(form.durationMins),
      };

      if (editing) {
        await axios.put(
          `${API_URL}/smart/programaciones/${editing}`,
          data,
          headers()
        );

        setMessage(
          'Programación actualizada correctamente.'
        );
      } else {
        await axios.post(
          `${API_URL}/smart/programaciones`,
          data,
          headers()
        );

        setMessage(
          'Programación creada correctamente.'
        );
      }

      setForm(empty);
      setEditing(null);
      load();
    } catch (err) {
      setMessage(
        err.response?.data?.error ||
          'No se pudo guardar la programación.'
      );
    }
  };

  const edit = (item) => {
    setEditing(item.id);

    setForm({
      type: item.type,
      sectorId: String(item.sectorId),
      date: item.date
        ? item.date.slice(0, 10)
        : '',
      time: item.time,
      durationMins: item.durationMins,
      enabled: item.enabled,
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const remove = async (id) => {
    if (!window.confirm('¿Eliminar esta programación?')) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/smart/programaciones/${id}`,
        headers()
      );

      setMessage('Programación eliminada.');
      load();
    } catch (error) {
      setMessage(
        'No se pudo eliminar la programación.'
      );
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(empty);
    setMessage('');
  };

  return (
    <div className="min-h-full bg-[#f6f8f6] p-6 lg:p-8">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5f3ec] text-[#176b4d] shadow-sm">
            <CalendarClock
              size={24}
              strokeWidth={2}
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Programación operativa
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Gestiona el riego y la iluminación de cada sector.
            </p>
          </div>

        </div>

        {editing && (
          <button
            type="button"
            onClick={cancelEdit}
            className="self-start rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancelar edición
          </button>
        )}

      </div>

      {/* =====================================================
          FORMULARIO
      ====================================================== */}

      <form
        onSubmit={save}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6"
      >

        {/* CABECERA DEL FORMULARIO */}

        <div className="mb-5 flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">

            {form.type === 'RIEGO' ? (
              <Droplets size={18} />
            ) : (
              <Lightbulb size={18} />
            )}

          </div>

          <div>

            <h3 className="text-sm font-bold text-slate-800">
              {editing
                ? 'Editar programación'
                : 'Nueva programación'}
            </h3>

            <p className="text-xs text-slate-400">
              Configura cuándo y cómo se ejecutará.
            </p>

          </div>

        </div>

        {/* CAMPOS */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">

          {/* ACTIVIDAD */}

          <div className="xl:col-span-1">

            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Actividad
            </label>

            <select
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value,
                })
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="RIEGO">
                Riego
              </option>

              <option value="ILUMINACION">
                Iluminación
              </option>
            </select>

          </div>

          {/* SECTOR */}

          <div className="xl:col-span-1">

            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Sector
            </label>

            <select
              required
              value={form.sectorId}
              onChange={(e) =>
                setForm({
                  ...form,
                  sectorId: e.target.value,
                })
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">
                Seleccionar
              </option>

              {sectors.map((sector) => (
                <option
                  key={sector.id}
                  value={sector.id}
                >
                  {sector.name}
                </option>
              ))}

            </select>

          </div>

          {/* FECHA */}

          <div className="xl:col-span-1">

            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Fecha
            </label>

            <input
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm({
                  ...form,
                  date: e.target.value,
                })
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />

          </div>

          {/* HORA */}

          <div className="xl:col-span-1">

            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Hora
            </label>

            <input
              required
              type="time"
              value={form.time}
              onChange={(e) =>
                setForm({
                  ...form,
                  time: e.target.value,
                })
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />

          </div>

          {/* DURACIÓN */}

          <div className="xl:col-span-1">

            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Duración
            </label>

            <div className="relative">

              <input
                required
                min="1"
                type="number"
                value={form.durationMins}
                onChange={(e) =>
                  setForm({
                    ...form,
                    durationMins: e.target.value,
                  })
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pr-12 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />

              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                min
              </span>

            </div>

          </div>

          {/* ESTADO / SWITCH */}

          <div className="xl:col-span-1">

            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Estado
            </label>

            <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3">

              <button
                type="button"
                role="switch"
                aria-checked={form.enabled}
                onClick={() =>
                  setForm({
                    ...form,
                    enabled: !form.enabled,
                  })
                }
                className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 ${
                  form.enabled
                    ? 'bg-emerald-600'
                    : 'bg-slate-300'
                }`}
              >

                <span
                  className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    form.enabled
                      ? 'translate-x-4'
                      : 'translate-x-0'
                  }`}
                />

              </button>

              <span
                className={`ml-2 text-xs font-semibold ${
                  form.enabled
                    ? 'text-emerald-700'
                    : 'text-slate-500'
                }`}
              >
                {form.enabled
                  ? 'Activa'
                  : 'Pausada'}
              </span>

            </div>

          </div>

        </div>

        {/* BOTÓN */}

        <div className="mt-5 flex items-center justify-end border-t border-slate-100 pt-5">

          <button
            type="submit"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#123c30] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d3026] hover:shadow-md active:scale-[0.98]"
          >

            <Plus
              size={16}
              strokeWidth={2.5}
            />

            <span>
              {editing
                ? 'Actualizar programación'
                : 'Agregar programación'}
            </span>

          </button>

        </div>

        {/* MENSAJE */}

        {message && (
          <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {message}
          </div>
        )}

      </form>

      {/* =====================================================
          TABLA
      ====================================================== */}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* CABECERA TABLA */}

        <div className="border-b border-slate-100 px-5 py-4">

          <div className="flex items-center justify-between">

            <div>

              <h3 className="text-sm font-bold text-slate-800">
                Programaciones registradas
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                {items.length}{' '}
                {items.length === 1
                  ? 'programación'
                  : 'programaciones'}
              </p>

            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
              <CalendarClock size={18} />
            </div>

          </div>

        </div>

        {/* TABLA */}

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-slate-50/80">

              <tr>

                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Actividad
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Sector
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Fecha
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Hora
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Duración
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Estado
                </th>

                <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Acciones
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {items.map((item) => (

                <tr
                  key={item.id}
                  className="transition hover:bg-slate-50/70"
                >

                  {/* ACTIVIDAD */}

                  <td className="px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                          item.type === 'RIEGO'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >

                        {item.type === 'RIEGO' ? (
                          <Droplets size={17} />
                        ) : (
                          <Lightbulb size={17} />
                        )}

                      </div>

                      <span className="text-sm font-semibold text-slate-700">
                        {item.type === 'RIEGO'
                          ? 'Riego'
                          : 'Iluminación'}
                      </span>

                    </div>

                  </td>

                  {/* SECTOR */}

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {item.sector?.name || '—'}
                  </td>

                  {/* FECHA */}

                  <td className="px-5 py-4 text-sm text-slate-500">
                    {item.date
                      ? new Date(
                          item.date
                        ).toLocaleDateString('es')
                      : 'Recurrente'}
                  </td>

                  {/* HORA */}

                  <td className="px-5 py-4">

                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">

                      <Clock3 size={13} />

                      {item.time}

                    </span>

                  </td>

                  {/* DURACIÓN */}

                  <td className="px-5 py-4 text-sm font-medium text-slate-600">
                    {item.durationMins} min
                  </td>

                  {/* ESTADO */}

                  <td className="px-5 py-4">

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.enabled
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >

                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          item.enabled
                            ? 'bg-emerald-500'
                            : 'bg-slate-400'
                        }`}
                      />

                      {item.enabled
                        ? 'Activa'
                        : 'Pausada'}

                    </span>

                  </td>

                  {/* ACCIONES */}

                  <td className="px-5 py-4">

                    <div className="flex justify-end gap-2">

                      <button
                        type="button"
                        onClick={() => edit(item)}
                        title="Editar"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          remove(item.id)
                        }
                        title="Eliminar"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

              {/* SIN REGISTROS */}

              {items.length === 0 && (

                <tr>

                  <td
                    colSpan="7"
                    className="px-6 py-14 text-center"
                  >

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                      <CalendarClock size={24} />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-slate-600">
                      No hay programaciones registradas
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Crea la primera programación usando el formulario.
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}