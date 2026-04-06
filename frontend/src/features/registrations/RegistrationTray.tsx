import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  CheckCircleIcon,
  XCircleIcon,
  IdentificationIcon,
  ArrowDownTrayIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { registrationApi, exportApi } from '../../api/services';
import type { RegistrationListItem, RegistrationFilter, PagedResponse } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { isSupervisorRole } from '../../utils/roles';

export default function RegistrationTray() {
  const [data, setData] = useState<PagedResponse<RegistrationListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filters, setFilters] = useState<RegistrationFilter>({
    page: 1,
    pageSize: 10,
    searchTerm: '',
    registrationStatus: '',
    registrationMode: '',
  });
  const [isExporting, setIsExporting] = useState(false);
  const [notifyingRows, setNotifyingRows] = useState<Record<string, boolean>>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const { user } = useAuth();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await registrationApi.getAll(filters);
      setData(res);
    } catch (err) {
      toast.error('Error al cargar la bandeja de registros');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotify = async (id: number, method: 'email' | 'whatsapp') => {
    const key = `${id}-${method}`;
    setNotifyingRows(prev => ({ ...prev, [key]: true }));
    try {
      const res = await registrationApi.notify(id, method);
      toast.success(res.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al enviar notificación');
    } finally {
      setNotifyingRows(prev => ({ ...prev, [key]: false }));
    }
  };

  const requiredConfirmation = 'ELIMINAR TODOS';
  const isSupervisor = isSupervisorRole(user?.role);
  const canDeleteAll = isSupervisor && !!data && data.totalCount > 0;

  const handleDeleteAll = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== requiredConfirmation) {
      toast.error('Debe escribir ELIMINAR TODOS para confirmar');
      return;
    }

    try {
      setIsDeletingAll(true);
      const res = await registrationApi.deleteAll();
      toast.success(res.message);
      setFilters(prev => ({ ...prev, page: 1 }));
      setIsDeleteModalOpen(false);
      setDeleteConfirmText('');
      await loadData();
    } catch (err: any) {
      if (err.response?.status === 403) {
        toast.error('Solo Supervisor puede eliminar todos los registros');
      } else {
        toast.error(err.response?.data?.message || 'Error al eliminar registros');
      }
    } finally {
      setIsDeletingAll(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters.page, filters.registrationStatus, filters.registrationMode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, page: 1 }));
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bandeja de Registros</h1>
          <p className="text-slate-500 text-sm mt-1">
            Administración de inscritos y validación de datos
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {isSupervisor && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={!canDeleteAll}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title={canDeleteAll ? 'Eliminar todos los registros (permanente)' : 'No hay registros para eliminar'}
            >
              <TrashIcon className="w-5 h-5" />
              <span>Eliminar Todos</span>
            </button>
          )}

          <button 
            onClick={async () => {
              try {
                setIsExporting(true);
                await exportApi.downloadCsv(filters);
                toast.success('Lista exportada exitosamente');
              } catch (err) {
                toast.error('Error al exportar CSV');
              } finally {
                setIsExporting(false);
              }
            }}
            disabled={isExporting}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>{isExporting ? 'Exportando...' : 'Exportar CSV'}</span>
          </button>
          <Link to="/kiosko" target="_blank" className="btn-accent flex items-center justify-center gap-2" title="Abrir kiosko en nueva pestaña">
            <DevicePhoneMobileIcon className="w-5 h-5" />
            <span>Abrir Autoservicio</span>
          </Link>
          <Link to="/registrations/new" className="btn-primary flex items-center justify-center gap-2">
            <span>Nuevo Registro (Operador)</span>
          </Link>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-red-100 text-red-600">
                <ExclamationTriangleIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Confirmar eliminación masiva</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Esta acción eliminará permanentemente todos los registros de la bandeja y no se puede deshacer.
                </p>
                <p className="text-sm text-slate-700 font-semibold mt-2">
                  Registros actuales: {data?.totalCount ?? 0}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Escriba ELIMINAR TODOS para confirmar
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="input-field"
                placeholder="ELIMINAR TODOS"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (isDeletingAll) return;
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmText('');
                }}
                className="btn-secondary"
                disabled={isDeletingAll}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteAll}
                disabled={isDeletingAll || deleteConfirmText.trim().toUpperCase() !== requiredConfirmation}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <TrashIcon className="w-4 h-4" />
                <span>{isDeletingAll ? 'Eliminando...' : 'Eliminar todos'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por DNI o Nombres..."
                value={filters.searchTerm || ''}
                onChange={e => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="input-field pl-10"
              />
            </div>
            <button type="submit" className="btn-secondary px-4">
              Buscar
            </button>
          </form>

          <div className="flex gap-2">
            <select
              value={filters.registrationStatus || ''}
              onChange={e => setFilters(prev => ({ ...prev, registrationStatus: e.target.value, page: 1 }))}
              className="input-field max-w-[150px]"
            >
              <option value="">Todos (Estado)</option>
              <option value="Pendiente de Medición">Pendiente de Medición</option>
              <option value="Completado">Completado</option>
              <option value="Observado">Observado</option>
              <option value="Anulado">Anulado</option>
            </select>

            <select
              value={filters.registrationMode || ''}
              onChange={e => setFilters(prev => ({ ...prev, registrationMode: e.target.value, page: 1 }))}
              className="input-field max-w-[150px]"
            >
              <option value="">Todos (Modo)</option>
              <option value="Operador">Operador (Asistido)</option>
              <option value="Autoservicio">Autoservicio (Kiosko)</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  DNI / Nombres
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Fecha Registro
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Modo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Biometría
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    <div className="flex justify-center mb-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    </div>
                    Cargando datos...
                  </td>
                </tr>
              ) : !data || data.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    No se encontraron registros activos.
                  </td>
                </tr>
              ) : (
                data.items.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center border border-primary-100">
                          <IdentificationIcon className="w-5 h-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{row.dni}</div>
                          <div className="text-sm text-slate-500">{row.fullName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(row.createdAt).toLocaleDateString('es-PE')}
                      <span className="block text-xs text-slate-400">
                        {new Date(row.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                        row.registrationStatus === 'Completado' ? 'bg-green-100 text-green-800 border-green-200' : 
                        row.registrationStatus === 'Pendiente de Medición' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        row.registrationStatus === 'Observado' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                        'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {row.registrationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {row.registrationMode === 'Autoservicio' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                          Autoservicio / Kiosko
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                          Operador
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          {row.hasPhoto ? <CheckCircleIcon className="w-4 h-4 text-green-500" /> : <XCircleIcon className="w-4 h-4 text-slate-300" />}
                          <span>Foto</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          {row.fingerprintStatus === 'Capturada' ? <CheckCircleIcon className="w-4 h-4 text-green-500" /> : <XCircleIcon className="w-4 h-4 text-slate-300" />}
                          <span>Huella</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleNotify(row.id, 'email')}
                          disabled={notifyingRows[`${row.id}-email`] || row.registrationStatus !== 'Completado' || !row.email}
                          className={`p-2 rounded-lg transition-colors disabled:opacity-30 ${
                            row.registrationStatus === 'Completado' && row.email 
                            ? 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100' 
                            : 'text-slate-300 cursor-not-allowed'
                          }`}
                          title={row.registrationStatus !== 'Completado' ? "Requiere estado Completado" : !row.email ? "Sin correo registrado" : "Enviar por Correo"}
                        >
                          {notifyingRows[`${row.id}-email`] ? (
                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <EnvelopeIcon className="w-5 h-5" />
                          )}
                        </button>

                        <button 
                          onClick={() => handleNotify(row.id, 'whatsapp')}
                          disabled={notifyingRows[`${row.id}-whatsapp`] || row.registrationStatus !== 'Completado' || !row.phone}
                          className={`p-2 rounded-lg transition-colors disabled:opacity-30 ${
                            row.registrationStatus === 'Completado' && row.phone 
                            ? 'text-slate-500 hover:text-green-600 hover:bg-slate-100' 
                            : 'text-slate-300 cursor-not-allowed'
                          }`}
                          title={row.registrationStatus !== 'Completado' ? "Requiere estado Completado" : !row.phone ? "Sin teléfono móvil" : "Enviar por WhatsApp"}
                        >
                          {notifyingRows[`${row.id}-whatsapp`] ? (
                            <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <ChatBubbleLeftRightIcon className="w-5 h-5" />
                          )}
                        </button>

                        <div className="w-px h-6 bg-slate-200 mx-1"></div>

                        <Link 
                          to={`/registrations/${row.id}`}
                          className="text-primary-600 hover:text-primary-900 inline-flex items-center justify-center p-2 hover:bg-primary-50 rounded-lg transition-colors px-3 font-bold uppercase text-[10px]"
                          title="Ver detalle completo"
                        >
                          Ver FICHA
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-b-xl -mx-6 -mb-6">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-700">
                  Mostrando página <span className="font-medium">{data.page}</span> de <span className="font-medium">{data.totalPages}</span> 
                  {' '}— Total: <span className="font-medium">{data.totalCount}</span> registros
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                    disabled={data.page <= 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Anterior</span>
                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {[...Array(data.totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setFilters(prev => ({ ...prev, page: i + 1 }))}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
                        data.page === i + 1
                          ? 'z-10 bg-primary-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                          : 'text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: Math.min(data.totalPages, (prev.page || 1) + 1) }))}
                    disabled={data.page >= data.totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Siguiente</span>
                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
