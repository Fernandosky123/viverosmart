import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const config = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

export default function Permisos() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [roleName, setRoleName] = useState('');
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');

  const choose = (role) => {
    setSelected(role);
    setSelectedIds(role.permissions.map((x) => x.permissionId));
  };

  const load = async () => {
    const [r, p] = await Promise.all([
      axios.get(`${API_URL}/smart/roles/permisos`, config()),
      axios.get(`${API_URL}/smart/permisos`, config()),
    ]);

    setRoles(r.data);
    setPermissions(p.data);

    if (!selected && r.data[0]) {
      choose(r.data[0]);
    }
  };

  useEffect(() => {
    load().catch(() =>
      setMessage('No se pudieron cargar los permisos.')
    );
  }, []);

  const savePermissions = async () => {
    await axios.put(
      `${API_URL}/smart/roles/${selected.id}/permisos`,
      { permissionIds: selectedIds },
      config()
    );

    setMessage('Permisos actualizados.');
    load();
  };

  const saveRole = async (e) => {
    e.preventDefault();

    try {
      if (editing) {
        await axios.put(
          `${API_URL}/smart/roles/${editing}`,
          { name: roleName },
          config()
        );
      } else {
        await axios.post(
          `${API_URL}/smart/roles`,
          { name: roleName },
          config()
        );
      }

      setRoleName('');
      setEditing(null);
      setMessage('Rol guardado.');
      load();
    } catch {
      setMessage('No se pudo guardar el rol.');
    }
  };

  const editRole = (role) => {
    setEditing(role.id);
    setRoleName(role.name);
  };

  const remove = async (role) => {
    if (!window.confirm(`¿Eliminar ${role.name}?`)) return;

    try {
      await axios.delete(
        `${API_URL}/smart/roles/${role.id}`,
        config()
      );

      if (selected?.id === role.id) {
        setSelected(null);
      }

      load();
    } catch (error) {
      setMessage(
        error.response?.data?.error ||
          'No se pudo eliminar el rol.'
      );
    }
  };

  const toggle = (id) => {
    setSelectedIds((ids) =>
      ids.includes(id)
        ? ids.filter((x) => x !== id)
        : [...ids, id]
    );
  };

  return (
    <div className="min-h-full bg-[#f7f8f6] p-6 lg:p-8">

      {/* HEADER */}
      <div className="mb-8">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Administración
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Roles y permisos
          </h2>

          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            Administra los roles del sistema y controla las operaciones
            disponibles para cada uno.
          </p>
        </div>
      </div>

      {/* CREAR / EDITAR ROL */}
      <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-900">
            {editing ? 'Editar rol' : 'Nuevo rol'}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {editing
              ? 'Modifica el nombre del rol seleccionado.'
              : 'Crea un nuevo rol para administrar sus permisos.'}
          </p>
        </div>

        <form
          onSubmit={saveRole}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <input
            required
            placeholder="Nombre del rol"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
          />

          <button
            type="submit"
            className="h-11 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
          >
            {editing ? 'Actualizar rol' : 'Crear rol'}
          </button>

          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setRoleName('');
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
          )}
        </form>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">

        {/* ROLES */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

          <div className="mb-4 px-2">
            <h3 className="text-sm font-bold text-slate-900">
              Roles
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Selecciona un rol para administrar sus permisos.
            </p>
          </div>

          <div className="space-y-2">
            {roles.map((role) => {
              const active = selected?.id === role.id;

              return (
                <div
                  key={role.id}
                  className={`group flex items-center gap-1 rounded-xl border transition ${
                    active
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => choose(role)}
                    className="min-w-0 flex-1 px-3 py-3 text-left"
                  >
                    <span
                      className={`block truncate text-sm font-semibold ${
                        active
                          ? 'text-emerald-800'
                          : 'text-slate-700'
                      }`}
                    >
                      {role.name}
                    </span>

                    <span className="mt-1 block text-xs text-slate-400">
                      {role.permissions?.length || 0} permisos
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => editRole(role)}
                    title="Editar"
                    className="mr-1 rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-700"
                  >
                    <Pencil size={16} strokeWidth={1.8} />
                  </button>

                  <button
                    type="button"
                    onClick={() => remove(role)}
                    title="Eliminar"
                    className="mr-1 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} strokeWidth={1.8} />
                  </button>
                </div>
              );
            })}
          </div>
        </aside>

        {/* PERMISOS */}
        {selected && (
          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] lg:p-6">

            {/* CABECERA */}
            <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-600">
                  Configuración de acceso
                </p>

                <h3 className="text-xl font-bold text-slate-900">
                  {selected.name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Define qué operaciones puede realizar este rol.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <span className="block text-xs text-slate-400">
                  Permisos activos
                </span>

                <span className="mt-1 block text-lg font-bold text-slate-800">
                  {selectedIds.length}
                  <span className="ml-1 text-sm font-normal text-slate-400">
                    / {permissions.length}
                  </span>
                </span>
              </div>
            </div>

            {/* LISTA DE PERMISOS */}
            <div className="grid gap-3 md:grid-cols-2">
              {permissions.map((permission) => {
                const active = selectedIds.includes(permission.id);

                return (
                  <label
                    key={permission.id}
                    className={`group flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 transition ${
                      active
                        ? 'border-emerald-200 bg-emerald-50/60'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="min-w-0">
                      <strong
                        className={`block text-sm font-semibold ${
                          active
                            ? 'text-emerald-800'
                            : 'text-slate-800'
                        }`}
                      >
                        {permission.code}
                      </strong>

                      <small className="mt-1 block text-xs leading-5 text-slate-500">
                        {permission.description}
                      </small>
                    </span>

                    {/* SWITCH */}
                    <span className="relative flex shrink-0 items-center">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggle(permission.id)}
                        className="peer sr-only"
                      />

                      <span className="h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-emerald-600 peer-focus-visible:ring-4 peer-focus-visible:ring-emerald-500/20" />

                      <span className="pointer-events-none absolute left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                    </span>
                  </label>
                );
              })}
            </div>

            {/* GUARDAR */}
            <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={savePermissions}
                className="h-11 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
              >
                Guardar permisos
              </button>
            </div>
          </section>
        )}
      </div>

      {/* MENSAJE */}
      {message && (
        <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </div>
      )}
    </div>
  );
}