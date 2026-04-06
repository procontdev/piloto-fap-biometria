import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { registrationSchema, type RegistrationFormData } from '../../schemas';
import { dniApi, registrationApi } from '../../api/services';
import { useAuth } from '../auth/AuthContext';
import PhotoCapture from './components/PhotoCapture';
import FingerprintScanner from './components/FingerprintScanner';

export default function RegistrationForm({ 
  isEditing = false, 
  initialData = null,
  registrationId = null,
  mode = 'Operador',
  onSuccess
}: { 
  isEditing?: boolean; 
  initialData?: RegistrationFormData | null;
  registrationId?: number | null;
  mode?: 'Operador' | 'Kiosko';
  onSuccess?: () => void;
}) {
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isLookingUpDni, setIsLookingUpDni] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema) as any,
    defaultValues: initialData || {
      militaryServiceInterest: false,
      fingerprintStatus: 'Pendiente',
      registrationMode: mode === 'Kiosko' ? 'Autoservicio' : 'Operador'
    },
  });

  const dni = watch('dni');

  const handleDniLookup = async () => {
    const isDniValid = await trigger('dni');
    if (!isDniValid) return;

    try {
      setIsLookingUpDni(true);
      // Validate duplicates in backend
      if (!isEditing) {
        const { exists } = await registrationApi.checkDni(dni);
        if (exists) {
          toast.error('Ya existe un registro con este DNI en el sistema.');
          return;
        }
      }

      const res = await dniApi.lookup(dni);
      setValue('firstNames', res.firstNames, { shouldValidate: true });
      setValue('paternalSurname', res.paternalSurname, { shouldValidate: true });
      setValue('maternalSurname', res.maternalSurname, { shouldValidate: true });
      setValue('birthDate', res.birthDate, { shouldValidate: true });
      setValue('gender', res.gender as 'M' | 'F', { shouldValidate: true });
      setValue('address', res.address, { shouldValidate: true });
      setValue('department', res.department, { shouldValidate: true });
      setValue('province', res.province, { shouldValidate: true });
      setValue('district', res.district, { shouldValidate: true });
      
      toast.success('Datos consultados correctamente.');
    } catch (err: any) {
      if (err.response?.status === 404) {
        toast.error('DNI no encontrado. Ingrese los datos manualmente si considera que es un error.');
      } else {
        toast.error('Error al consultar el DNI.');
      }
    } finally {
      setIsLookingUpDni(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      let finalPhotoPath = data.photoPath;
      
      // Upload photo if new capture exists
      if (photoDataUrl && photoDataUrl.startsWith('data:image')) {
        const arr = photoDataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const file = new File([u8arr], 'photo.jpg', { type: mime });
        
        try {
          const uploadRes = await registrationApi.uploadPhoto(file);
          finalPhotoPath = uploadRes.url;
        } catch (uploadErr) {
          toast.error('La foto no se pudo subir. El registro continuará.');
        }
      }

      // Standardize data for backend
      const cleanData = {
        ...data,
        photoPath: finalPhotoPath,
        weight: (data.weight && Number(data.weight) > 0) ? Number(data.weight) : undefined,
        height: (data.height && Number(data.height) > 0) ? Number(data.height) : undefined,
      };

      if (isEditing && registrationId) {
        await registrationApi.update(registrationId, {
          ...cleanData,
          // Server handles auto-status, but we can pass it if modified manually
          registrationStatus: data.registrationStatus || (cleanData.weight && cleanData.height ? 'Completado' : undefined)
        });
        toast.success('Registro actualizado exitosamente.');
        navigate(`/registrations/${registrationId}`);
        return;
      }

      const res = await registrationApi.create(cleanData);

      toast.success('Registro guardado exitosamente.');
      if (onSuccess) {
        onSuccess();
      } else {
        if (mode === 'Kiosko') {
          navigate(`/registrations/${res.id}`, { state: { justCreated: true } });
        } else {
          navigate('/registrations');
        }
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      const apiErrs = err.response?.data?.errors;
      if (apiErrs) {
        Object.keys(apiErrs).forEach(key => {
          toast.error(`${key}: ${apiErrs[key].join(' ')}`);
        });
      } else {
        toast.error(err.response?.data?.message || 'Ocurrió un error al guardar.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onValidationError = (errors: any) => {
    console.error('Validation errors:', errors);
    toast.error('Por favor, corrija los errores en el formulario antes de guardar.');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onValidationError)} className="space-y-8">
      {/* Sección: Identificación Institucional */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-primary-900 border-b border-slate-200 pb-2 mb-4">
          Identificación (Consulta DNI)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">DNI *</label>
            <div className="flex gap-2">
              <input
                type="text"
                {...register('dni')}
                disabled={isEditing}
                maxLength={8}
                className={`input-field ${errors.dni ? 'input-error' : ''} ${isEditing ? 'bg-slate-50' : ''}`}
                placeholder="Ej. 70000001"
              />
              {!isEditing && (
                <button
                  type="button"
                  onClick={handleDniLookup}
                  disabled={isLookingUpDni || !dni || dni.length !== 8}
                  className="btn-accent whitespace-nowrap px-3 py-2 text-sm"
                >
                  {isLookingUpDni ? 'Buscando...' : 'Consultar'}
                </button>
              )}
            </div>
            {errors.dni && <p className="text-danger text-xs mt-1">{errors.dni.message}</p>}
          </div>
          <div>
            <label className="label">Nombres *</label>
            <input 
              type="text" 
              {...register('firstNames')} 
              disabled={isEditing && user?.role !== 'Supervisor'}
              className={`input-field ${errors.firstNames ? 'input-error' : ''} ${isEditing && user?.role !== 'Supervisor' ? 'bg-slate-50' : ''}`} 
            />
            {errors.firstNames && <p className="text-danger text-xs mt-1">{errors.firstNames.message}</p>}
          </div>
          <div>
            <label className="label">Apellido Paterno *</label>
            <input 
              type="text" 
              {...register('paternalSurname')} 
              disabled={isEditing && user?.role !== 'Supervisor'}
              className={`input-field ${errors.paternalSurname ? 'input-error' : ''} ${isEditing && user?.role !== 'Supervisor' ? 'bg-slate-50' : ''}`} 
            />
            {errors.paternalSurname && <p className="text-danger text-xs mt-1">{errors.paternalSurname.message}</p>}
          </div>
          <div>
            <label className="label">Apellido Materno *</label>
            <input 
              type="text" 
              {...register('maternalSurname')} 
              disabled={isEditing && user?.role !== 'Supervisor'}
              className={`input-field ${errors.maternalSurname ? 'input-error' : ''} ${isEditing && user?.role !== 'Supervisor' ? 'bg-slate-50' : ''}`} 
            />
            {errors.maternalSurname && <p className="text-danger text-xs mt-1">{errors.maternalSurname.message}</p>}
          </div>
          <div>
            <label className="label">Fecha de Nacimiento *</label>
            <input type="date" {...register('birthDate')} className={`input-field ${errors.birthDate ? 'input-error' : ''}`} />
            {errors.birthDate && <p className="text-danger text-xs mt-1">{errors.birthDate.message}</p>}
          </div>
          <div>
            <label className="label">Sexo *</label>
            <select {...register('gender')} className={`input-field ${errors.gender ? 'input-error' : ''}`}>
              <option value="">-- Seleccionar --</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
            {errors.gender && <p className="text-danger text-xs mt-1">{errors.gender.message}</p>}
          </div>
        </div>
      </div>

      {/* Sección: Información de Contacto y Ubicación */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-primary-900 border-b border-slate-200 pb-2 mb-4">
          Contacto y Ubicación
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="label">Teléfono</label>
            <input type="text" {...register('phone')} className={`input-field ${errors.phone ? 'input-error' : ''}`} />
            {errors.phone && <p className="text-danger text-xs mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="label">Correo Electrónico</label>
            <input type="email" {...register('email')} className={`input-field ${errors.email ? 'input-error' : ''}`} />
            {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="label">Dirección *</label>
            <input type="text" {...register('address')} className={`input-field ${errors.address ? 'input-error' : ''}`} />
            {errors.address && <p className="text-danger text-xs mt-1">{errors.address.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Departamento *</label>
            <input type="text" {...register('department')} className={`input-field ${errors.department ? 'input-error' : ''}`} />
            {errors.department && <p className="text-danger text-xs mt-1">{errors.department.message}</p>}
          </div>
          <div>
            <label className="label">Provincia *</label>
            <input type="text" {...register('province')} className={`input-field ${errors.province ? 'input-error' : ''}`} />
            {errors.province && <p className="text-danger text-xs mt-1">{errors.province.message}</p>}
          </div>
          <div>
            <label className="label">Distrito *</label>
            <input type="text" {...register('district')} className={`input-field ${errors.district ? 'input-error' : ''}`} />
            {errors.district && <p className="text-danger text-xs mt-1">{errors.district.message}</p>}
          </div>
        </div>

        {watch('currentAddress') && (
           <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
             <h3 className="text-xs font-bold text-amber-800 uppercase mb-2 tracking-widest">Residencia Actual (Declarada en Kiosko)</h3>
             <p className="text-sm text-amber-900">{watch('currentAddress')}, {watch('currentDistrict')}, {watch('currentProvince')}, {watch('currentDepartment')}</p>
           </div>
        )}
      </div>

      {/* Sección: Biometría y Datos Físicos */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-primary-900 border-b border-slate-200 pb-2 mb-4">
          Datos Físicos y Biométricos
        </h2>
        
        {/* Fotos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="flex flex-col items-center p-4 border rounded-xl bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Fotografía Frontal</h3>
            <PhotoCapture 
              label="Frontal"
              onPhotoCaptured={(url) => setPhotoDataUrl(url)} 
              initialPhotoUrl={watch('photoPath')} 
            />
          </div>
          <div className="flex flex-col items-center p-4 border rounded-xl bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Fotografía Perfil</h3>
            {watch('profilePhotoPath') ? (
              <img src={watch('profilePhotoPath')!} className="w-full max-w-[200px] h-auto rounded-lg shadow-md border-2 border-white" alt="Perfil" />
            ) : (
              <div className="w-full max-w-[200px] aspect-[3/4] bg-slate-200 rounded-lg flex items-center justify-center text-slate-400">Sin foto perfil</div>
            )}
          </div>
        </div>

        {/* Huellas y Firma */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="flex flex-col items-center p-4 border rounded-xl bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider tracking-wider">Índice Izquierdo</h3>
            <FingerprintScanner 
              label="Izquierdo"
              status={watch('leftIndexFingerprintStatus')} 
              onStatusChange={(status) => setValue('leftIndexFingerprintStatus', status)}
            />
          </div>
          <div className="flex flex-col items-center p-4 border rounded-xl bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Índice Derecho</h3>
            <FingerprintScanner 
              label="Derecho"
              status={watch('rightIndexFingerprintStatus')} 
              onStatusChange={(status) => setValue('rightIndexFingerprintStatus', status)}
            />
          </div>
          <div className="flex flex-col items-center p-4 border rounded-xl bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Firma Digital</h3>
            {watch('signaturePath') ? (
              <div className="bg-white p-2 border rounded-lg w-full h-[120px] flex items-center justify-center">
                <img src={watch('signaturePath')!} className="max-h-full" alt="Firma" />
              </div>
            ) : (
              <div className="w-full h-[120px] bg-slate-200 rounded-lg flex items-center justify-center text-slate-400">Sin firma registrada</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 bg-primary-50/30 p-4 rounded-xl border border-primary-50">
          <div>
            <label className="label">Cabello</label>
            <select {...register('hairColor')} className="input-field" disabled={!isEditing}>
              <option value="">-- Seleccionar --</option>
              <option value="Negro">Negro</option>
              <option value="Castaño">Castaño</option>
              <option value="Rubio">Rubio</option>
              <option value="Entrecano">Entrecano</option>
            </select>
          </div>
          <div>
            <label className="label">Ojos</label>
            <select {...register('eyeColor')} className="input-field" disabled={!isEditing}>
              <option value="">-- Seleccionar --</option>
              <option value="Café">Café</option>
              <option value="Negro">Negro</option>
              <option value="Azul">Azul</option>
              <option value="Verde">Verde</option>
            </select>
          </div>
          <div>
            <label className="label">Tez</label>
            <select {...register('complexion')} className="input-field" disabled={!isEditing}>
              <option value="">-- Seleccionar --</option>
              <option value="Blanca">Blanca</option>
              <option value="Trigueña">Trigueña</option>
              <option value="Mestiza">Mestiza</option>
              <option value="Morena">Morena</option>
            </select>
          </div>
          <div>
            <label className="label">Sangre</label>
            <select {...register('bloodType')} className="input-field" disabled={!isEditing}>
              <option value="">-- Seleccionar --</option>
              {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Talla Calzado</label>
            <select {...register('shoeSize')} className="input-field" disabled={!isEditing}>
              <option value="">-- Seleccionar --</option>
              {Array.from({ length: 41 }, (_, i) => 30 + i * 0.5).map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div>
            <label className="label">Peso (kg)</label>
            <input 
              type="number" 
              step="0.1"
              {...register('weight')} 
              className={`input-field ${errors.weight ? 'input-error' : ''}`} 
              placeholder="Ej. 65.5"
            />
            {errors.weight && <p className="text-danger text-xs mt-1">{errors.weight.message}</p>}
          </div>
          <div>
            <label className="label">Talla (m)</label>
            <input 
              type="number" 
              step="0.01"
              {...register('height')} 
              className={`input-field ${errors.height ? 'input-error' : ''}`} 
              placeholder="Ej. 1.75"
            />
            {errors.height && <p className="text-danger text-xs mt-1">{errors.height.message}</p>}
          </div>
        </div>
      </div>

      {/* Sección: Estado y Observaciones */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-primary-900 border-b border-slate-200 pb-2 mb-4">
          Estado y Observaciones
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isEditing && (
            <div>
              <label className="label">Estado del Registro</label>
              <select {...register('registrationStatus')} className="input-field">
                <option value="Pendiente de Medición">Pendiente de Medición</option>
                <option value="Completado">Completado</option>
                <option value="Anulado">Anulado</option>
                <option value="Observado">Observado</option>
              </select>
            </div>
          )}

          <div>
            <label className="label">Grado de Instrucción *</label>
            <select {...register('educationLevel')} className={`input-field ${errors.educationLevel ? 'input-error' : ''}`}>
              <option value="">-- Seleccionar --</option>
              <option value="Ninguna">Ninguna</option>
              <option value="Primaria Incompleta">Primaria Incompleta</option>
              <option value="Primaria Completa">Primaria Completa</option>
              <option value="Secundaria Incompleta">Secundaria Incompleta</option>
              <option value="Secundaria Completa">Secundaria Completa</option>
              <option value="Superior Técnica">Superior Técnica</option>
              <option value="Superior Universitaria">Superior Universitaria</option>
            </select>
            {errors.educationLevel && <p className="text-danger text-xs mt-1">{errors.educationLevel.message}</p>}
          </div>
          
          <div className="flex items-center h-full pt-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('militaryServiceInterest')}
                className="w-5 h-5 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
              />
              <span className="text-slate-700 font-medium">Interés en Servicio Militar Voluntario</span>
            </label>
          </div>
        </div>

        <div>
          <label className="label">Observaciones</label>
          <textarea
            {...register('observations')}
            rows={3}
            className={`input-field ${errors.observations ? 'input-error' : ''}`}
            placeholder="Anotaciones adicionales..."
          ></textarea>
          {errors.observations && <p className="text-danger text-xs mt-1">{errors.observations.message}</p>}
        </div>
      </div>

      {/* Resumen de Errores Críticos */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-bold text-sm mb-2 px-1">Se encontraron los siguientes campos con errores:</p>
          <ul className="list-disc list-inside text-xs text-red-700 space-y-1">
            {Object.entries(errors).map(([key, value]) => (
              <li key={key} className="capitalize">
                <span className="font-semibold">{key}:</span> {value?.message as string}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => {
            if (mode === 'Kiosko') {
              window.location.reload();
            } else {
              navigate('/registrations');
            }
          }}
          className="btn-secondary"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isLookingUpDni}
          className="btn-primary"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Registro'}
        </button>
      </div>
    </form>
  );
}
