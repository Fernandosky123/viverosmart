import { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Database, ChevronRight } from 'lucide-react';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const headers = {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
};

export default function Historicos() {
  const [files, setFiles] = useState([]);
  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    axios
      .get(`${API_URL}/smart/archivos-historicos`, headers)
      .then((r) => setFiles(r.data))
      .catch(() => {});
  }, []);

  const open = async (name) => {
    setSelected(name);

    const r = await axios.get(
      `${API_URL}/smart/archivos-historicos/${name}`,
      headers
    );

    setRecords(r.data);
  };

  return (
    <div className="min-h-full bg-[#f7f8f6] p-6 lg:p-8">

      {/* HEADER */}
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Historial
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Archivos históricos
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Consulta las copias históricas de los registros de
          consumo almacenados por el sistema.
        </p>
      </div>

      {/* CONTENIDO */}
      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">

        {/* LISTA DE ARCHIVOS */}
        <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

          <div className="border-b border-slate-100 px-5 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Database size={19} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Archivos disponibles
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  {files.length} archivo
                  {files.length === 1 ? '' : 's'}
                </p>
              </div>

            </div>

          </div>

          <div className="p-3">

            {files.map((name) => {
              const active = name === selected;

              return (
                <button
                  type="button"
                  key={name}
                  onClick={() => open(name)}
                  className={`group mb-1 flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left transition ${
                    active
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >

                  <div className="flex min-w-0 items-center gap-3">

                    <FileText
                      size={17}
                      className={
                        active
                          ? 'shrink-0 text-emerald-600'
                          : 'shrink-0 text-slate-400'
                      }
                    />

                    <span className="truncate text-sm font-medium">
                      {name}
                    </span>

                  </div>

                  <ChevronRight
                    size={15}
                    className={`shrink-0 transition-transform ${
                      active
                        ? 'translate-x-0 text-emerald-600'
                        : 'text-slate-300 group-hover:translate-x-0.5 group-hover:text-slate-400'
                    }`}
                  />

                </button>
              );
            })}

            {!files.length && (
              <div className="px-3 py-10 text-center">

                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                  <Database size={19} />
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No hay archivos
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Todavía no existen archivos históricos generados.
                </p>

              </div>
            )}

          </div>
        </aside>

        {/* REGISTROS */}
        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

          {/* CABECERA TABLA */}
          <div className="border-b border-slate-100 px-5 py-5 lg:px-6">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Registro histórico
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  {selected || 'Selecciona un archivo'}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selected
                    ? 'Registros almacenados en el archivo seleccionado.'
                    : 'Selecciona un archivo para consultar sus registros.'}
                </p>
              </div>

              {selected && (
                <div className="w-fit rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  {records.length} registros
                </div>
              )}

            </div>

          </div>

          {/* TABLA */}
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

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {records.map((record, index) => (
                  <tr
                    key={index}
                    className="transition hover:bg-slate-50/70"
                  >

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                      {new Date(
                        record.timestamp
                      ).toLocaleString('es')}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">

                      <span className="text-sm font-semibold text-slate-700">
                        {record.sector?.name ||
                          record.sectorId ||
                          '—'}
                      </span>

                    </td>

                    <td className="whitespace-nowrap px-5 py-4">

                      <span
                        className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${
                          String(record.resourceType).toUpperCase() ===
                          'AGUA'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {record.resourceType}
                      </span>

                    </td>

                    <td className="whitespace-nowrap px-5 py-4">

                      <span className="text-sm font-semibold text-slate-700">
                        {record.quantity ?? '—'}
                      </span>

                    </td>

                  </tr>
                ))}

                {!records.length && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-16 text-center"
                    >

                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                        <FileText size={20} />
                      </div>

                      <p className="mt-4 text-sm font-semibold text-slate-700">
                        {selected
                          ? 'No hay registros en este archivo'
                          : 'Ningún archivo seleccionado'}
                      </p>

                      <p className="mx-auto mt-1 max-w-sm text-sm leading-5 text-slate-400">
                        {selected
                          ? 'El archivo seleccionado no contiene registros disponibles.'
                          : 'Selecciona un archivo del panel izquierdo para consultar su información.'}
                      </p>

                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </section>

      </div>
    </div>
  );
}