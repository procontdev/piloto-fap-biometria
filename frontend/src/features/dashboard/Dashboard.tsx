import { useEffect, useState } from 'react';
import { 
  UsersIcon, 
  DocumentCheckIcon, 
  CameraIcon,
  FingerPrintIcon,
  DevicePhoneMobileIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { dashboardApi } from '../../api/services';
import type { DashboardResponse } from '../../types';

export default function Dashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await dashboardApi.get();
        setData(res);
      } catch (err) {
        console.error('Failed to fetch dashboard', err);
        setError('No se pudieron cargar los indicadores operativos.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
        Cargando indicadores operativos...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card p-10 text-center text-red-500 border-red-100 bg-red-50">
        <p className="font-medium">{error || 'No hay datos disponibles'}</p>
        <button 
          onClick={() => window.location.reload()}
          className="btn-secondary mt-4"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Fallbacks
  const opereradorCount = data.byMode?.['Operador'] || 0;
  const kioskoCount = data.byMode?.['Autoservicio'] || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Panel de Control (Supervisión)</h1>
        <p className="text-slate-500 text-sm mt-1">
          Indicadores en tiempo real del Piloto de Inscripción Digital
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Total de Inscritos" 
          value={data.totalRegistrations} 
          icon={<UsersIcon className="w-8 h-8 text-blue-600" />}
          bgColor="bg-blue-50"
        />
        <KpiCard 
          title="Inscritos Hoy" 
          value={data.todayRegistrations} 
          icon={<DocumentCheckIcon className="w-8 h-8 text-green-600" />}
          bgColor="bg-green-50"
        />
        <KpiCard 
          title="Interés Servicio Militar" 
          value={data.militaryInterestCount} 
          icon={<UserGroupIcon className="w-8 h-8 text-amber-600" />}
          bgColor="bg-amber-50"
        />
        <KpiCard 
          title="Cumplimiento Biométrico" 
          value={`${data.totalRegistrations > 0 ? Math.round((data.withPhotoCount / data.totalRegistrations) * 100) : 0}%`}
          subtitle={`${data.withPhotoCount} fotos capturadas`}
          icon={<CameraIcon className="w-8 h-8 text-purple-600" />}
          bgColor="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Modalidad Card */}
        <div className="card lg:col-span-1 border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Registros por Modalidad</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-md">
                  <DevicePhoneMobileIcon className="w-5 h-5" />
                </div>
                <span className="font-medium text-slate-700">Autoservicio (Kiosko)</span>
              </div>
              <span className="text-xl font-bold text-slate-900">{kioskoCount}</span>
            </div>
            
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-200 text-slate-700 rounded-md">
                  <UsersIcon className="w-5 h-5" />
                </div>
                <span className="font-medium text-slate-700">Asistido (Operador)</span>
              </div>
              <span className="text-xl font-bold text-slate-900">{opereradorCount}</span>
            </div>
            
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 text-teal-700 rounded-md">
                  <FingerPrintIcon className="w-5 h-5" />
                </div>
                <span className="font-medium text-slate-700">Huellas Simuladas</span>
              </div>
              <span className="text-xl font-bold text-slate-900">{data.withFingerprintCount}</span>
            </div>
          </div>
        </div>

        {/* Recent Registrations Table */}
        <div className="card lg:col-span-2 border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Últimos Registros</h2>
          {data.recentRegistrations.length === 0 ? (
            <p className="text-slate-500 py-4 text-center">No hay registros recientes.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase">DNI</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nombres</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Modalidad</th>
                    <th scope="col" className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recentRegistrations.map((r) => (
                    <tr key={r.id}>
                      <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-slate-900">{r.dni}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-slate-500 truncate max-w-[200px]">{r.fullName}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-slate-500">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          r.registrationMode === 'Autoservicio' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {r.registrationMode}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-slate-400 text-right">
                        {new Date(r.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, subtitle, icon, bgColor }: { title: string, value: string | number, subtitle?: string, icon: React.ReactNode, bgColor: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
      <div className={`p-4 rounded-full ${bgColor} mb-4`}>
        {icon}
      </div>
      <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wide">{title}</h3>
      <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}
