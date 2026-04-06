import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { registrationApi } from '../../api/services';
import RegistrationForm from './RegistrationForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import type { RegistrationResponse } from '../../types';

export default function EditRegistration() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<RegistrationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        if (id) {
          const res = await registrationApi.getById(Number(id));
          setData(res);
        }
      } catch (err) {
        toast.error('Error al cargar datos para edición');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (isLoading) return <div className="p-10 text-center text-slate-500">Cargando datos...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">No se encontró el registro.</div>;

  // Convert Response to FormData (some fields might need mapping if names differ)
  const initialFormValues: any = {
    ...data,
    // Ensure date is in YYYY-MM-DD for the input type="date"
    birthDate: data.birthDate.split('T')[0]
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link to={`/registrations/${id}`} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
          <ArrowLeftIcon className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-primary-900 leading-tight">Completar / Editar Registro</h1>
          <p className="text-slate-500 text-sm mt-0.5">DNI: {data.dni} • Modalidad: {data.registrationMode}</p>
        </div>
      </div>

      <RegistrationForm 
        isEditing={true} 
        registrationId={Number(id)}
        initialData={initialFormValues} 
      />
    </div>
  );
}
