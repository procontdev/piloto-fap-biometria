import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  DocumentArrowDownIcon, 
  UserIcon, 
  MapPinIcon, 
  ScaleIcon, 
  InformationCircleIcon,
  PencilSquareIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { registrationApi, pdfApi } from '../../api/services';
import { useAuth } from '../auth/AuthContext';
import type { RegistrationResponse } from '../../types';
import { resolveMediaUrl } from '../../utils/mediaUrl';

export default function RegistrationDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<RegistrationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        if (id) {
          const res = await registrationApi.getById(Number(id));
          setData(res);
        }
      } catch (err) {
        toast.error('Error al cargar datos del registro');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!data) return;
    try {
      setIsDownloading(true);
      await pdfApi.downloadConstancia(data.id);
      toast.success('Constancia generada exitosamente');
    } catch (err) {
      toast.error('Error al generar la constancia');
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado': return 'bg-green-100 text-green-700 border-green-200';
      case 'Pendiente de Medición': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Observado': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Anulado': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (isLoading) return <div className="p-10 text-center text-slate-500 font-medium">Cargando expediente...</div>;
  if (!data) return <div className="p-10 text-center text-red-500 font-medium whitespace-pre-wrap">No se encontró el registro indicado.</div>;

  const isMeasurementPending = data.registrationStatus === 'Pendiente de Medición' || ((!data.weight || data.weight === 0) && (!data.height || data.height === 0));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/registrations" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-primary-900 leading-tight">Expediente de Inscripción</h1>
            <p className="text-slate-500 text-sm mt-0.5">DNI: {data.dni} • Modalidad: {data.registrationMode}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {data.registrationStatus !== 'Completado' && user?.role === 'Operador' && (
            <Link 
              to={`/registrations/edit/${data.id}`}
              className="btn-primary flex items-center gap-2 shadow-sm whitespace-nowrap"
            >
              <PencilSquareIcon className="w-5 h-5" />
              <span>Completar Medición</span>
            </Link>
          )}

          {user?.role === 'Supervisor' && (
            <Link 
              to={`/registrations/edit/${data.id}`}
              className="btn-secondary flex items-center gap-2 shadow-sm whitespace-nowrap"
            >
              <PencilSquareIcon className="w-5 h-5" />
              <span>Editar Registro</span>
            </Link>
          )}

          <button 
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="btn-accent flex items-center gap-2 shadow-sm whitespace-nowrap"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            <span>{isDownloading ? 'Generando PDF...' : 'Descargar Constancia'}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card text-center p-8 bg-white border border-slate-200">
            <div className="relative inline-block mx-auto mb-6">
              <div className="w-40 h-40 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-inner flex items-center justify-center">
                {data.photoPath ? (
                  <img src={resolveMediaUrl(data.photoPath)} alt="Foto del inscrito" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-20 h-20 text-slate-300" />
                )}
              </div>
              <div className="mt-4 text-center">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStatusColor(data.registrationStatus)}`}>
                  {data.registrationStatus}
                </span>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight leading-tight">
              {data.paternalSurname} {data.maternalSurname}<br/>
              <span className="text-primary-800 font-extrabold">{data.firstNames}</span>
            </h2>
            <p className="text-slate-500 font-medium mt-1">DNI: {data.dni}</p>
          </div>

          <div className="card space-y-4 border border-slate-200 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <InformationCircleIcon className="w-4 h-4" />
              Trazabilidad
            </h3>
            <div className="space-y-3">
              <div className="text-sm">
                <span className="text-slate-500 block">Registrado por:</span>
                <span className="font-semibold text-slate-700">{data.createdByName}</span>
              </div>
              <div className="text-sm">
                <span className="text-slate-500 block">Fecha de registro:</span>
                <span className="font-semibold text-slate-700">{new Date(data.createdAt).toLocaleString('es-PE')}</span>
              </div>
               {data.updatedAt && (
                <div className="text-sm border-t border-slate-200 pt-3">
                  <span className="text-slate-500 block">Última actualización:</span>
                  <span className="font-semibold text-slate-700">{new Date(data.updatedAt).toLocaleString('es-PE')}</span>
                  <span className="text-slate-400 text-xs block">Por: {data.updatedByName}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          {isMeasurementPending && (data.registrationStatus === 'Pendiente de Medición') && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-start gap-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-amber-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-amber-900">Medición Física Pendiente</h4>
                <p className="text-amber-800 text-sm">
                  Este registro fue realizado en modo autoservicio. Se requiere la validación presencial del peso y la talla para completar el proceso institucional.
                </p>
              </div>
            </div>
          )}

          <div className="card space-y-8 bg-white border border-slate-200">
            {/* Personal Details */}
            <Section title="Información Personal" icon={<UserIcon className="w-5 h-5 text-primary-700" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                <DetailItem label="Sexo" value={data.gender === 'M' ? 'Masculino' : 'Femenino'} />
                <DetailItem label="Fecha de Nacimiento" value={new Date(data.birthDate).toLocaleDateString('es-PE')} />
                <DetailItem label="Grado de Instrucción" value={data.educationLevel} />
                <DetailItem label="Interés S. Militar" value={data.militaryServiceInterest ? 'SÍ' : 'NO'} />
              </div>
            </Section>

            {/* Contact Details */}
            <Section title="Contacto y Ubicación" icon={<MapPinIcon className="w-5 h-5 text-primary-700" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                <DetailItem label="Teléfono" value={data.phone || '-'} />
                <DetailItem label="Correo" value={data.email || '-'} />
                <DetailItem label="Dirección" value={data.address} className="sm:col-span-2" />
                <DetailItem label="Ubigeo" value={`${data.district}, ${data.province}, ${data.department}`} className="sm:col-span-2" />
              </div>
            </Section>

            {/* Physical Details */}
            <Section title="Datos Físicos y Biometría" icon={<ScaleIcon className="w-5 h-5 text-primary-700" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                <DetailItem 
                  label="Peso (kg)" 
                  value={data.weight && data.weight > 0 ? `${data.weight} kg` : 'PENDIENTE'} 
                  highlight={!data.weight || data.weight === 0}
                />
                <DetailItem 
                  label="Talla (m)" 
                  value={data.height && data.height > 0 ? `${data.height} m` : 'PENDIENTE'} 
                  highlight={!data.height || data.height === 0}
                />
                <DetailItem label="Huella Dactilar" value={data.fingerprintStatus} />
                <DetailItem label="Sincronización SICERM" value={data.syncStatus} />
              </div>
            </Section>

            {/* Observations */}
            <Section title="Observaciones" icon={<InformationCircleIcon className="w-5 h-5 text-primary-700" />}>
              <p className="text-slate-600 text-sm italic bg-slate-50 p-4 rounded-lg border border-slate-100">
                {data.observations || 'Sin observaciones adicionales.'}
              </p>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function DetailItem({ label, value, className = "", highlight = false }: { label: string, value: string, className?: string, highlight?: boolean }) {
  return (
    <div className={className}>
      <span className="text-xs text-slate-400 uppercase font-bold block mb-0.5">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded' : 'text-slate-700'}`}>
        {value}
      </span>
    </div>
  );
}
