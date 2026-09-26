import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  Shield,
  Plus,
  Pencil,
  Trash2,
  Mail,
  UserRound,
  BriefcaseBusiness,
  LockKeyhole,
  UserCheck,
} from 'lucide-react';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    roleId: '',
  });

  const [editingUser, setEditingUser] = useState(null);

  const currentUser = JSON.parse(
    localStorage.getItem('user') || '{}'
  );

  const isAdmin = currentUser.role === 'Administrador';

  const config = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };

  useEffect(() => {
    if (!isAdmin) return;

    axios
      .get(`${API_URL}/smart/usuarios`, config)
      .then((res) => setUsuarios(res.data))
      .catch((error) => {
        console.error('Error cargando usuarios:', error);
      });

    axios
      .get(`${API_URL}/smart/roles`, config)
      .then((res) => setRoles(res.data))
      .catch((error) => {
        console.error('Error cargando roles:', error);
      });
  }, [isAdmin]);

  const refreshUsers = async () => {
    const res = await axios.get(
      `${API_URL}/smart/usuarios`,
      config
    );

    setUsuarios(res.data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      if (editingUser) {
        await axios.put(
          `${API_URL}/smart/usuarios/${editingUser.id}`,
          newUser,
          config
        );
      } else {
        await axios.post(
          `${API_URL}/smart/usuarios`,
          newUser,
          config
        );
      }

      setShowForm(false);
      setEditingUser(null);

      setNewUser({
        name: '',
        email: '',
        password: '',
        roleId: '',
      });

      await refreshUsers();
    } catch (error) {
      console.error(error);

      alert(
        editingUser
          ? 'Error actualizando usuario'
          : 'Error creando usuario'
      );
    }
  };

  const edit = (user) => {
    setEditingUser(user);

    setNewUser({
      name: user.name,
      email: user.email,
      password: '',
      roleId: String(user.roleId),
    });

    setShowForm(true);
  };

  const remove = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;

    try {
      await axios.delete(
        `${API_URL}/smart/usuarios/${id}`,
        config
      );

      await refreshUsers();
    } catch (error) {
      console.error(error);
      alert('No se pudo eliminar el usuario.');
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingUser(null);

    setNewUser({
      name: '',
      email: '',
      password: '',
      roleId: '',
    });
  };

  const getRoleStyle = (role) => {
    switch (role) {
      case 'Administrador':
        return 'bg-purple-50 text-purple-700 border-purple-200';

      case 'Operador':
        return 'bg-blue-50 text-blue-700 border-blue-200';

      case 'Tecnico':
        return 'bg-orange-50 text-orange-700 border-orange-200';

      case 'Cliente':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';

      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-full bg-[#f7f8f6] p-6 lg:p-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-red-50 text-red-500">
            <Shield size={32} />
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-500">
            Acceso restringido
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Gestión de Personal
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Esta sección es exclusiva para el rol de Administrador.
          </p>

          <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
            <UserRound size={16} />
            <span>
              Tu rol actual: <strong>{currentUser.role}</strong>
            </span>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f7f8f6] p-6 lg:p-8">

      {/* =========================================================
          HEADER
      ========================================================= */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Administración
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Gestión de Personal
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Administra los usuarios del sistema, sus credenciales y
            los roles asignados dentro de ViveroSmart.
          </p>
        </div>

        {/* BOTÓN AÑADIR USUARIO */}

        <button
          onClick={() => {
            if (showForm) {
              cancelForm();
            } else {
              setShowForm(true);
            }
          }}
          className="inline-flex h-11 min-w-[175px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
        >
          <Plus
            size={18}
            className="shrink-0"
          />

          <span className="whitespace-nowrap">
            {showForm ? 'Cancelar' : 'Añadir usuario'}
          </span>
        </button>

      </div>

      {/* =========================================================
          RESUMEN
      ========================================================= */}

      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* USUARIOS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Usuarios
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {usuarios.length}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Registrados en el sistema
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <Users size={19} />
            </div>

          </div>

        </div>

        {/* ADMINISTRADORES */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Administradores
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {
                  usuarios.filter(
                    (u) => u.role === 'Administrador'
                  ).length
                }
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Acceso administrativo
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-600">
              <Shield size={19} />
            </div>

          </div>

        </div>

        {/* OPERADORES */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Operadores
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {
                  usuarios.filter(
                    (u) => u.role === 'Operador'
                  ).length
                }
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Personal operativo
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <BriefcaseBusiness size={19} />
            </div>

          </div>

        </div>

        {/* ACTIVOS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Activos
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {usuarios.length}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Usuarios habilitados
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck size={19} />
            </div>

          </div>

        </div>

      </div>

      {/* =========================================================
          FORMULARIO
      ========================================================= */}

      {showForm && (
        <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] lg:p-6">

          <div className="mb-6 flex items-start gap-3 border-b border-slate-100 pb-5">

            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              {editingUser ? (
                <Pencil size={19} />
              ) : (
                <UserRound size={19} />
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Administración de usuarios
              </p>

              <h3 className="mt-1 text-xl font-bold text-slate-900">
                {editingUser
                  ? 'Editar usuario'
                  : 'Nuevo usuario'}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {editingUser
                  ? 'Actualiza los datos y el rol asignado.'
                  : 'Registra una nueva cuenta para ViveroSmart.'}
              </p>
            </div>

          </div>

          <form
            onSubmit={handleCreate}
            className="grid gap-5 md:grid-cols-2"
          >

            {/* NOMBRE */}

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Nombre completo
              </label>

              <div className="relative">

                <UserRound
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  required
                  type="text"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      name: e.target.value,
                    })
                  }
                  placeholder="Ej. Juan Pérez"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />

              </div>
            </div>

            {/* EMAIL */}

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Correo electrónico
              </label>

              <div className="relative">

                <Mail
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  required
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      email: e.target.value,
                    })
                  }
                  placeholder="usuario@correo.com"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />

              </div>
            </div>

            {/* CONTRASEÑA */}

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Contraseña
              </label>

              <div className="relative">

                <LockKeyhole
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  required={!editingUser}
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      password: e.target.value,
                    })
                  }
                  placeholder={
                    editingUser
                      ? 'Dejar vacío para conservar'
                      : 'Contraseña'
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />

              </div>
            </div>

            {/* ROL */}

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Rol / Cargo
              </label>

              <div className="relative">

                <BriefcaseBusiness
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  required
                  value={newUser.roleId}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      roleId: e.target.value,
                    })
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                >

                  <option value="">
                    Selecciona un rol...
                  </option>

                  {roles.map((role) => (
                    <option
                      key={role.id}
                      value={role.id}
                    >
                      {role.name}
                    </option>
                  ))}

                </select>

              </div>
            </div>

            {/* BOTONES */}

            <div className="md:col-span-2 flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">

              <button
                type="button"
                onClick={cancelForm}
                className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="h-11 min-w-[170px] whitespace-nowrap rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
              >
                {editingUser
                  ? 'Actualizar usuario'
                  : 'Guardar usuario'}
              </button>

            </div>

          </form>
        </div>
      )}

      {/* =========================================================
          TABLA DE USUARIOS
      ========================================================= */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between lg:p-6">

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Usuarios registrados
            </p>

            <h3 className="mt-1 text-xl font-bold text-slate-900">
              Personal del sistema
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Gestiona las cuentas y sus niveles de acceso.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-3">

            <span className="block text-xs text-slate-400">
              Total
            </span>

            <span className="mt-1 block text-lg font-bold text-slate-800">
              {usuarios.length}

              <span className="ml-1 text-sm font-normal text-slate-400">
                usuarios
              </span>
            </span>

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Usuario
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Correo
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Rol / Cargo
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Estado
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Acciones
                </th>

              </tr>
            </thead>

            <tbody>

              {usuarios.map((user) => (

                <tr
                  key={user.id}
                  className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50/70"
                >

                  {/* USUARIO */}

                  <td className="px-6 py-4">

                    <div className="flex items-center gap-3">

                      <div
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold ${
                          user.role === 'Administrador'
                            ? 'bg-purple-50 text-purple-700'
                            : user.role === 'Operador'
                            ? 'bg-blue-50 text-blue-700'
                            : user.role === 'Tecnico'
                            ? 'bg-orange-50 text-orange-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {(user.name || 'U')
                          .split(/\s+/)
                          .map((x) => x[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div>

                        <p className="text-sm font-semibold text-slate-800">
                          {user.name}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          ID #{user.id}
                        </p>

                      </div>

                    </div>

                  </td>

                  {/* EMAIL */}

                  <td className="px-6 py-4">

                    <div className="flex items-center gap-2 text-sm text-slate-500">

                      <Mail
                        size={15}
                        className="shrink-0 text-slate-400"
                      />

                      <span className="whitespace-nowrap">
                        {user.email}
                      </span>

                    </div>

                  </td>

                  {/* ROL */}

                  <td className="px-6 py-4">

                    <span
                      className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-semibold ${getRoleStyle(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>

                  </td>

                  {/* ESTADO */}

                  <td className="px-6 py-4">

                    <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">

                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />

                      Activo

                    </span>

                  </td>

                  {/* ACCIONES */}

                  <td className="px-6 py-4">

                    <div className="flex justify-end gap-1">

                      <button
                        onClick={() => edit(user)}
                        title="Editar usuario"
                        className="rounded-lg p-2.5 text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
                      >
                        <Pencil
                          size={17}
                          strokeWidth={1.8}
                        />
                      </button>

                      <button
                        onClick={() => remove(user.id)}
                        title="Eliminar usuario"
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

              {usuarios.length === 0 && (

                <tr>

                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center"
                  >

                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-50 text-slate-400">
                      <Users size={22} />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No hay usuarios registrados
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Añade el primer usuario para comenzar.
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