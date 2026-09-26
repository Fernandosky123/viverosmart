import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TreePine,
  Zap,
  Droplet,
  Plus,
  Trash2,
  Pencil,
  X,
  Cpu,
} from 'lucide-react';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Sensores() {
  const [sensores, setSensores] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [newSensor, setNewSensor] = useState({
    code: '',
    type: 'AGUA',
    sectorId: '',
    status: 'ACTIVO',
  });

  const [editingId, setEditingId] = useState(null);

  /* =========================================================
     CARGAR DATOS
  ========================================================= */

  useEffect(() => {
    fetchData();
  }, []);

  const getHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  const fetchData = async () => {
    try {
      const [sensoresRes, sectoresRes] = await Promise.all([
        axios.get(
          `${API_URL}/smart/sensores`,
          getHeaders()
        ),
        axios.get(
          `${API_URL}/smart/sectores`,
          getHeaders()
        ),
      ]);

      setSensores(sensoresRes.data);
      setSectores(sectoresRes.data);
    } catch (error) {
      console.error('Error cargando sensores:', error);
    }
  };

  /* =========================================================
     CREAR / EDITAR
  ========================================================= */

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      const body = {
        ...newSensor,
        sectorId: parseInt(newSensor.sectorId),
      };

      if (editingId) {
        await axios.put(
          `${API_URL}/smart/sensores/${editingId}`,
          body,
          getHeaders()
        );
      } else {
        await axios.post(
          `${API_URL}/smart/sensores`,
          body,
          getHeaders()
        );
      }

      setShowForm(false);
      setEditingId(null);

      setNewSensor({
        code: '',
        type: 'AGUA',
        sectorId: '',
        status: 'ACTIVO',
      });

      fetchData();
    } catch (error) {
      console.error('Error guardando sensor:', error);
      alert('Error guardando sensor');
    }
  };

  /* =========================================================
     EDITAR
  ========================================================= */

  const handleEdit = (sensor) => {
    setEditingId(sensor.id);

    setNewSensor({
      code: sensor.code,
      type: sensor.type,
      sectorId: String(sensor.sectorId),
      status: sensor.status,
    });

    setShowForm(true);
  };

  /* =========================================================
     ELIMINAR
  ========================================================= */

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        '¿Seguro que deseas eliminar permanentemente este sensor IoT?'
      )
    ) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/smart/sensores/${id}`,
        getHeaders()
      );

      fetchData();
    } catch (error) {
      console.error('Error eliminando sensor:', error);
      alert('Error al eliminar el sensor');
    }
  };

  /* =========================================================
     CANCELAR
  ========================================================= */

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);

    setNewSensor({
      code: '',
      type: 'AGUA',
      sectorId: '',
      status: 'ACTIVO',
    });
  };

  /* =========================================================
     ESTADO VISUAL
  ========================================================= */

  const getStatusStyle = (status) => {
    switch (status) {
      case 'ACTIVO':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100';

      case 'INACTIVO':
        return 'bg-slate-100 text-slate-600 border border-slate-200';

      case 'INCIDENCIA':
        return 'bg-amber-50 text-amber-700 border border-amber-100';

      default:
        return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ACTIVO':
        return 'Activo';

      case 'INACTIVO':
        return 'Inactivo';

      case 'INCIDENCIA':
        return 'Con incidencia';

      default:
        return status;
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-full bg-[#f7f8f6] p-6 lg:p-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-8">
        <div className="flex flex-col gap-2">

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Infraestructura IoT
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Sensores IoT
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Administra los dispositivos instalados y
                controla su asignación dentro de las zonas
                del vivero.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (showForm) {
                  cancelForm();
                } else {
                  setShowForm(true);
                }
              }}
              className="flex w-fit shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              {showForm ? (
                <>
                  <X size={17} />
                  Cancelar
                </>
              ) : (
                <>
                  <Plus size={17} />
                  Añadir sensor
                </>
              )}
            </button>

          </div>
        </div>
      </div>

      {/* =====================================================
          RESUMEN
      ===================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

        {/* TOTAL */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Sensores registrados
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {sensores.length}
              </p>
            </div>

            <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <Cpu size={21} />
            </div>

          </div>
        </div>

        {/* AGUA */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Sensores de agua
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {
                  sensores.filter(
                    (sensor) => sensor.type === 'AGUA'
                  ).length
                }
              </p>
            </div>

            <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Droplet size={21} />
            </div>

          </div>
        </div>

        {/* ENERGÍA */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Sensores de energía
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {
                  sensores.filter(
                    (sensor) => sensor.type === 'ENERGIA'
                  ).length
                }
              </p>
            </div>

            <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <Zap size={21} />
            </div>

          </div>
        </div>

      </div>

      {/* =====================================================
          FORMULARIO
      ===================================================== */}

      {showForm && (
        <section
          className={`mb-6 rounded-2xl border p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] lg:p-6 ${
            editingId
              ? 'border-amber-100 bg-amber-50/60'
              : 'border-emerald-100 bg-white'
          }`}
        >

          <div className="mb-5 flex items-start justify-between gap-4">

            <div>
              <div className="flex items-center gap-2">

                <div
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                    editingId
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {editingId ? (
                    <Pencil size={17} />
                  ) : (
                    <Plus size={17} />
                  )}
                </div>

                <h3 className="text-base font-semibold text-slate-900">
                  {editingId
                    ? 'Editar sensor'
                    : 'Registrar nuevo sensor'}
                </h3>

              </div>

              <p className="mt-2 text-sm text-slate-500">
                {editingId
                  ? 'Actualiza la información del dispositivo seleccionado.'
                  : 'Ingresa los datos del dispositivo IoT para incorporarlo al sistema.'}
              </p>
            </div>

          </div>

          <form
            onSubmit={handleCreate}
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          >

            {/* CÓDIGO */}

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Código / Identificador
              </label>

              <input
                required
                type="text"
                value={newSensor.code}
                onChange={(e) =>
                  setNewSensor({
                    ...newSensor,
                    code: e.target.value,
                  })
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                placeholder="Ej. SN-AGUA-03"
              />
            </div>

            {/* TIPO */}

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Tipo de sensor
              </label>

              <select
                required
                value={newSensor.type}
                onChange={(e) =>
                  setNewSensor({
                    ...newSensor,
                    type: e.target.value,
                  })
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="AGUA">
                  Flujo de agua (L)
                </option>

                <option value="ENERGIA">
                  Eléctrico (kWh)
                </option>
              </select>
            </div>

            {/* SECTOR */}

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Zona asignada
              </label>

              <select
                required
                value={newSensor.sectorId}
                onChange={(e) =>
                  setNewSensor({
                    ...newSensor,
                    sectorId: e.target.value,
                  })
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="">
                  Seleccionar zona...
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

            {/* ESTADO */}

            {editingId && (
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Estado
                </label>

                <select
                  value={newSensor.status}
                  onChange={(e) =>
                    setNewSensor({
                      ...newSensor,
                      status: e.target.value,
                    })
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="ACTIVO">
                    Activo
                  </option>

                  <option value="INACTIVO">
                    Inactivo
                  </option>

                  <option value="INCIDENCIA">
                    Con incidencia
                  </option>
                </select>
              </div>
            )}

            {/* BOTÓN */}

            <div className="md:col-span-2 xl:col-span-4">
              <button
                type="submit"
                className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition active:scale-[0.99] ${
                  editingId
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
              >
                {editingId ? (
                  <>
                    <Pencil size={17} />
                    <span>
                      Actualizar sensor
                    </span>
                  </>
                ) : (
                  <>
                    <Plus size={17} />
                    <span>
                      Instalar sensor
                    </span>
                  </>
                )}
              </button>
            </div>

          </form>
        </section>
      )}

      {/* =====================================================
          LISTADO
      ===================================================== */}

      <section>

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Sensores desplegados
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Dispositivos IoT actualmente registrados en el vivero.
            </p>
          </div>

          <span className="w-fit rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            {sensores.length} sensores
          </span>

        </div>

        {/* TARJETAS */}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

          {sensores.map((sensor) => (

            <div
              key={sensor.id}
              className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(15,23,42,0.07)]"
            >

              {/* ACCIONES */}

              <div className="absolute right-4 top-4 flex gap-1 opacity-0 transition group-hover:opacity-100">

                <button
                  type="button"
                  onClick={() =>
                    handleEdit(sensor)
                  }
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
                  title="Editar sensor"
                >
                  <Pencil size={16} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(sensor.id)
                  }
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  title="Eliminar sensor"
                >
                  <Trash2 size={16} />
                </button>

              </div>

              {/* ICONO + ESTADO */}

              <div className="mb-5 flex items-start justify-between">

                <div
                  className={`grid h-12 w-12 place-items-center rounded-xl ${
                    sensor.type === 'AGUA'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {sensor.type === 'AGUA' ? (
                    <Droplet size={23} />
                  ) : (
                    <Zap size={23} />
                  )}
                </div>

                <span
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                    sensor.status
                  )}`}
                >
                  {getStatusLabel(
                    sensor.status
                  )}
                </span>

              </div>

              {/* INFORMACIÓN */}

              <div>

                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {sensor.type === 'AGUA'
                    ? 'Sensor de agua'
                    : 'Sensor de energía'}
                </p>

                <h3 className="text-xl font-bold tracking-tight text-slate-900">
                  {sensor.code}
                </h3>

                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">

                  <TreePine
                    size={16}
                    className="text-emerald-600"
                  />

                  <p className="text-sm text-slate-500">
                    Sector:{' '}
                    <span className="font-semibold text-slate-700">
                      {sensor.sector?.name ||
                        'No asignado'}
                    </span>
                  </p>

                </div>

              </div>

            </div>

          ))}

          {/* SIN SENSORES */}

          {sensores.length === 0 && (
            <div className="col-span-full rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-14 text-center">

              <div className="mx-auto flex max-w-sm flex-col items-center">

                <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-50 text-slate-400">
                  <Cpu size={25} />
                </div>

                <p className="text-sm font-semibold text-slate-700">
                  No hay sensores instalados
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Registra un sensor IoT para comenzar
                  a capturar datos automáticos del
                  vivero.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setShowForm(true)
                  }
                  className="mt-5 flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  <Plus size={16} />
                  Añadir sensor
                </button>

              </div>

            </div>
          )}

        </div>

      </section>

    </div>
  );
}