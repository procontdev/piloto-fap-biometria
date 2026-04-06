import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registrationSchema, type RegistrationFormData } from '../../schemas';
import { dniApi, registrationApi } from '../../api/services';
import PhotoCapture from './components/PhotoCapture';
import FingerprintScanner from './components/FingerprintScanner';
import { CheckCircleIcon, ArrowRightIcon, XMarkIcon, SparklesIcon, MapPinIcon, UserIcon, CameraIcon, PencilSquareIcon, FingerPrintIcon } from '@heroicons/react/24/outline';
import SignaturePad from './components/SignaturePad';

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export default function KioskWizard() {
  const [step, setStep] = useState<WizardStep>(1);
  const [isLookingUpDni, setIsLookingUpDni] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [frontPhotoUrl, setFrontPhotoUrl] = useState<string | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema) as any,
    defaultValues: {
      militaryServiceInterest: false,
      fingerprintStatus: 'Pendiente',
      leftIndexFingerprintStatus: 'Pendiente',
      rightIndexFingerprintStatus: 'Pendiente',
      registrationMode: 'Autoservicio',
      // We do not require weight/height in Kiosk
    },
  });

  const dni = watch('dni');
  const watchAll = watch();

  const handleNext = async () => {
    let isValid = false;
    
    if (step === 2) {
      isValid = await trigger(['dni']);
      if (!isValid) toast.error('Ingrese un DNI válido');
      else return handleDniLookup(); 
    } else if (step === 3) {
      isValid = await trigger(['firstNames', 'paternalSurname', 'maternalSurname', 'birthDate', 'gender', 'address', 'department', 'province', 'district']);
      if (!isValid) toast.error('Los datos de identidad tienen errores de formato.');
    } else if (step === 4) {
      isValid = await trigger(['currentAddress', 'currentDepartment', 'currentProvince', 'currentDistrict', 'phone', 'email']);
      if (!isValid) toast.error('Complete los datos de ubicación y contacto');
    } else if (step === 5) {
      if (!frontPhotoUrl) {
         toast.error('Debe capturar su foto de frente');
         return;
      }
      isValid = true;
      simulateAISuggestion();
    } else if (step === 6) {
      if (!profilePhotoUrl) {
         toast.error('Debe capturar su foto de perfil');
         return;
      }
      isValid = true;
    } else if (step === 7) {
      isValid = await trigger(['hairColor', 'eyeColor', 'complexion', 'bloodType', 'shoeSize', 'educationLevel']);
      if (!isValid) toast.error('Complete su filiación física y grado de instrucción');
    } else if (step === 8) {
      const left = watch('leftIndexFingerprintStatus');
      const right = watch('rightIndexFingerprintStatus');
      if (left !== 'Capturada' || right !== 'Capturada') {
        toast.error('Debe capturar ambas huellas');
        return;
      }
      isValid = true;
    } else if (step === 9) {
      if (!signatureUrl) {
        toast.error('Debe registrar su firma');
        return;
      }
      isValid = true;
    } else {
      isValid = true;
    }

    if (isValid) {
      setStep((prev) => (prev + 1) as WizardStep);
      window.scrollTo(0, 0);
    }
  };

  // Error handler for handleSubmit
  const onInvalid = (errors: any) => {
    console.error('Validation Errors:', errors);
    const errorFields = Object.keys(errors).join(', ');
    toast.error(`Errores en campos: ${errorFields}`);
  };

  const simulateAISuggestion = () => {
    setIsProcessingAI(true);
    setTimeout(() => {
      // Mock AI detection
      setValue('hairColor', 'Negro', { shouldDirty: true });
      setValue('eyeColor', 'Café', { shouldDirty: true });
      setValue('complexion', 'Trigueña', { shouldDirty: true });
      setIsProcessingAI(false);
      toast.success('AI: Características físicas sugeridas basadas en la foto.');
    }, 1500);
  };

  const handleBack = () => {
    setStep((prev) => (prev - 1) as WizardStep);
    window.scrollTo(0, 0);
  };

  const handleDniLookup = async () => {
    const isDniValid = await trigger('dni');
    if (!isDniValid) return;

    try {
      setIsLookingUpDni(true);
      // Validate duplicates in backend
      const { exists } = await registrationApi.checkDni(dni);
      if (exists) {
        toast.error('Ya existe un registro con este DNI en el sistema.');
        return;
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
      
      // Pre-fill current residence with DNI data (user can modify later)
      setValue('currentAddress', res.address, { shouldValidate: true });
      setValue('currentDepartment', res.department, { shouldValidate: true });
      setValue('currentProvince', res.province, { shouldValidate: true });
      setValue('currentDistrict', res.district, { shouldValidate: true });
      
      toast.success('Datos validados. DNI correcto.');
      setStep(3);
      window.scrollTo(0, 0);
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
      
      const uploadFile = async (dataUrl: string, name: string) => {
        if (!dataUrl || !dataUrl.startsWith('data:image')) return null;
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        const file = new File([u8arr], name, { type: mime });
        const res = await registrationApi.uploadPhoto(file);
        return res.url;
      };

      const [frontUrl, profUrl, signUrl] = await Promise.all([
        uploadFile(frontPhotoUrl!, 'front.jpg'),
        uploadFile(profilePhotoUrl!, 'profile.jpg'),
        uploadFile(signatureUrl!, 'signature.png')
      ]);

      await registrationApi.create({
        ...data,
        photoPath: frontUrl,
        profilePhotoPath: profUrl,
        signaturePath: signUrl,
        weight: undefined,
        height: undefined,
        fingerprintStatus: (data.leftIndexFingerprintStatus === 'Capturada' && data.rightIndexFingerprintStatus === 'Capturada') ? 'Capturada' : 'Pendiente',
        registrationStatus: 'Pendiente de Medición',
        registrationMode: 'Autoservicio'
      });
      
      setStep(10); // Success Step
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ocurrió un error al guardar el preregistro.';
      const detail = err.response?.data?.errors ? Object.entries(err.response.data.errors).map(([k, v]: any) => `${k}: ${v.join(', ')}`).join(' | ') : '';
      toast.error(`${errorMessage} ${detail ? `(${detail})` : ''}`, { duration: 6000 });
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-reset timer for Kiosk
  useEffect(() => {
    let timer: any;
    if (step === 10 && !isSubmitting && frontPhotoUrl) {
      timer = setTimeout(() => {
        reset();
        setStep(1);
        setFrontPhotoUrl(null);
        setProfilePhotoUrl(null);
        setSignatureUrl(null);
      }, 15000); // 15 seconds
    }
    return () => clearTimeout(timer);
  }, [step, isSubmitting, frontPhotoUrl, reset]);

  const progressPercentage = ((step - 1) / 9) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative pb-20">
      
      {/* Botón Flotante para Operador (Salir) */}
      <div className="absolute top-4 right-4 z-50">
        <Link 
          to="/registrations" 
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full text-xs font-semibold shadow-sm transition-colors border border-slate-200"
          title="Solo Operador"
        >
          <XMarkIcon className="w-4 h-4" />
          <span>Salir Kiosko</span>
        </Link>
      </div>

      {step < 10 && (
        <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-primary-900 font-bold uppercase tracking-wider text-sm">
                Fuerza Aérea del Perú
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                Paso {step} de 10
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-600 transition-all duration-700 ease-in-out" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          
          <form onSubmit={handleSubmit(onSubmit as any, onInvalid)} className="p-8 md:p-10">
            
            {/* STEP 1: Bienvenida */}
            {step === 1 && (
              <div className="text-center space-y-6 py-8">
                <div className="w-24 h-24 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircleIcon className="w-14 h-14" />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900">Bienvenido al Registro Militar Digital</h1>
                <p className="text-base text-slate-600 max-w-md mx-auto">
                  Este es el módulo de autoservicio institucional. El proceso es rápido y guiado paso a paso.
                </p>
                <div className="bg-blue-50 text-blue-800 p-5 rounded-2xl text-sm max-w-md mx-auto flex flex-col gap-2 border border-blue-100 text-left">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <SparklesIcon className="w-4 h-4" /> REQUERIMIENTOS:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>DNI físico a la mano.</li>
                    <li>Rostro despejado para toma de evidencias.</li>
                    <li>Firma digital al finalizar el proceso.</li>
                  </ul>
                </div>
                <div className="pt-8">
                  <button type="button" onClick={handleNext} className="btn-primary text-lg px-10 py-4 shadow-lg hover:shadow-primary-200 w-full sm:w-auto">
                    Iniciar Mi Registro
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Identificación */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-800">Identificación</h2>
                  <p className="text-slate-500">Ingresa tu número de DNI para validar tus datos oficiales.</p>
                </div>
                
                <div className="max-w-xs mx-auto space-y-4">
                  <div>
                    <label className="label text-center block text-sm font-semibold">Número de DNI</label>
                    <input
                      type="text"
                      {...register('dni')}
                      maxLength={8}
                      className={`input-field text-center text-3xl font-mono tracking-[0.2em] py-4 shadow-inner ${errors.dni ? 'border-red-500' : 'border-slate-200'}`}
                      placeholder="00000000"
                      autoFocus
                    />
                    {errors.dni && <p className="text-red-500 text-xs mt-2 text-center font-medium">{errors.dni.message}</p>}
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={isLookingUpDni || !dni || dni.length !== 8}
                    className="btn-primary w-full py-4 text-base font-bold shadow-lg flex justify-center items-center gap-2"
                  >
                    <span>{isLookingUpDni ? 'Validando DNI...' : 'Verificar e Iniciar'}</span>
                    {!isLookingUpDni && <ArrowRightIcon className="w-5 h-5" />}
                  </button>
                  <div className="text-center">
                    <button type="button" onClick={handleBack} className="text-sm text-slate-400 hover:text-slate-600 font-medium mt-4">
                      Volver al inicio
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Datos RENIEC */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary-50 text-primary-600 rounded-lg"><UserIcon className="w-6 h-6"/></div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Tus Datos Oficiales</h2>
                    <p className="text-slate-500 text-sm">Información recuperada de RENIEC.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <input type="hidden" {...register('firstNames')} />
                  <input type="hidden" {...register('paternalSurname')} />
                  <input type="hidden" {...register('maternalSurname')} />
                  <input type="hidden" {...register('birthDate')} />
                  <input type="hidden" {...register('gender')} />
                  <input type="hidden" {...register('address')} />
                  <input type="hidden" {...register('department')} />
                  <input type="hidden" {...register('province')} />
                  <input type="hidden" {...register('district')} />

                  <div className="sm:col-span-2 border-b border-slate-200 pb-3 mb-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nombres Completos</label>
                    <div className="text-lg text-slate-700 font-bold">{watchAll.firstNames} {watchAll.paternalSurname} {watchAll.maternalSurname}</div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha Nacimiento</label>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 font-semibold">{watchAll.birthDate || '—'}</div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sexo</label>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 font-semibold">{watchAll.gender === 'M' ? 'MASCULINO' : 'FEMENINO'}</div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-xs flex gap-3">
                  <MapPinIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
                  <p>Si tu dirección actual es DISTINTA a la registrada en tu DNI, podrás actualizarla en el siguiente paso.</p>
                </div>

                <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-100">
                  <button type="button" onClick={handleBack} className="btn-secondary px-6">Atrás</button>
                  <button type="button" onClick={handleNext} className="btn-primary px-8">Confirmar Datos</button>
                </div>
              </div>
            )}

            {/* STEP 4: Ubicación y Contacto */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary-50 text-primary-600 rounded-lg"><MapPinIcon className="w-6 h-6"/></div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Ubicación y Contacto</h2>
                    <p className="text-slate-500 text-sm">¿Dónde resides actualmente?</p>
                  </div>
                </div>

                <div className="space-y-4 border-b border-slate-100 pb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="label">Dirección de Residencia Actual *</label>
                      <input type="text" {...register('currentAddress')} className="input-field" placeholder="Av. Los Pioneros 123..." />
                      {errors.currentAddress && <p className="text-danger text-xs mt-1">{errors.currentAddress.message}</p>}
                    </div>
                    <div>
                      <label className="label">Departamento *</label>
                      <input type="text" {...register('currentDepartment')} className="input-field" placeholder="Lima" />
                    </div>
                    <div>
                      <label className="label">Distrito *</label>
                      <input type="text" {...register('currentDistrict')} className="input-field" placeholder="Miraflores" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="label">Teléfono Móvil (Opcional)</label>
                    <input type="tel" {...register('phone')} className="input-field" placeholder="999888777" />
                  </div>
                  <div>
                    <label className="label">Correo Electrónico (Opcional)</label>
                    <input type="email" {...register('email')} className="input-field" placeholder="nombre@ejemplo.com" />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-100">
                  <button type="button" onClick={handleBack} className="btn-secondary px-6">Atrás</button>
                  <button type="button" onClick={handleNext} className="btn-primary px-8">Siguiente</button>
                </div>
              </div>
            )}

            {/* STEP 5: Foto Frente */}
            {step === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 bg-primary-50 text-primary-600 rounded-full mb-3"><CameraIcon className="w-8 h-8"/></div>
                  <h2 className="text-2xl font-bold text-slate-800">Fotografía Frontal</h2>
                  <p className="text-slate-500 text-sm">Ubícate frente a la cámara sin gorras ni lentes.</p>
                </div>
                
                <PhotoCapture 
                  variant="frontal"
                  label="Foto Frontal" 
                  subtitle="Mire directamente al lente" 
                  onPhotoCaptured={setFrontPhotoUrl} 
                  initialPhotoUrl={frontPhotoUrl}
                />

                <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-100">
                  <button type="button" onClick={handleBack} className="btn-secondary px-6">Atrás</button>
                  <button type="button" onClick={handleNext} className="btn-primary px-10">Capturar y Continuar</button>
                </div>
              </div>
            )}

            {/* STEP 6: Foto Perfil */}
            {step === 6 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 bg-primary-50 text-primary-600 rounded-full mb-3"><CameraIcon className="w-8 h-8"/></div>
                  <h2 className="text-2xl font-bold text-slate-800">Fotografía de Perfil</h2>
                  <p className="text-slate-500 text-sm">Gira tu cabeza 90 grados hacia tu derecha.</p>
                </div>
                
                <PhotoCapture 
                  variant="profile"
                  label="Foto Perfil" 
                  subtitle="Gira tu rostro a la derecha" 
                  onPhotoCaptured={setProfilePhotoUrl} 
                  initialPhotoUrl={profilePhotoUrl}
                />

                <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-100">
                  <button type="button" onClick={handleBack} className="btn-secondary px-6">Atrás</button>
                  <button type="button" onClick={handleNext} className="btn-primary px-10">Guardar y Siguiente</button>
                </div>
              </div>
            )}

            {/* STEP 7: Filiación Física */}
            {step === 7 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary-50 text-primary-600 rounded-lg"><UserIcon className="w-6 h-6"/></div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Filiación Física</h2>
                    <p className="text-slate-500 text-sm">Valida tus rasgos (Sugeridos por IA según tu foto).</p>
                  </div>
                </div>

                {isProcessingAI && (
                  <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                    <SparklesIcon className="w-5 h-5 text-indigo-500" />
                    <span className="text-sm text-indigo-700 font-medium italic">Analizando rasgos faciales con IA...</span>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Color de Cabello *</label>
                    <select {...register('hairColor')} className="input-field">
                      <option value="">-- Seleccionar --</option>
                      <option value="Negro">Negro</option>
                      <option value="Castaño">Castaño</option>
                      <option value="Rubio">Rubio</option>
                      <option value="Entrecano">Entrecano</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Color de Ojos *</label>
                    <select {...register('eyeColor')} className="input-field">
                      <option value="">-- Seleccionar --</option>
                      <option value="Café">Café</option>
                      <option value="Negro">Negro</option>
                      <option value="Azul">Azul</option>
                      <option value="Verde">Verde</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Tez (Complexión) *</label>
                    <select {...register('complexion')} className="input-field">
                      <option value="">-- Seleccionar --</option>
                      <option value="Blanca">Blanca</option>
                      <option value="Trigueña">Trigueña</option>
                      <option value="Mestiza">Mestiza</option>
                      <option value="Morena">Morena</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Tipo de Sangre *</label>
                    <select {...register('bloodType')} className="input-field">
                      <option value="">-- Seleccionar --</option>
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Talla Calzado *</label>
                    <select {...register('shoeSize')} className="input-field">
                      <option value="">-- Seleccionar --</option>
                      {Array.from({ length: 41 }, (_, i) => 30 + i * 0.5).map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Grado de Instrucción *</label>
                    <select {...register('educationLevel')} className="input-field">
                      <option value="">-- Seleccionar --</option>
                      <option value="Ninguna">Ninguna</option>
                      <option value="Primaria Incompleta">Primaria Incompleta</option>
                      <option value="Primaria Completa">Primaria Completa</option>
                      <option value="Secundaria Incompleta">Secundaria Incompleta</option>
                      <option value="Secundaria Completa">Secundaria Completa</option>
                      <option value="Superior Técnica">Superior Técnica</option>
                      <option value="Superior Universitaria">Superior Universitaria</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center h-full">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('militaryServiceInterest')}
                      className="w-5 h-5 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-slate-700 font-bold">Interés en Servicio Militar Voluntario</span>
                  </label>
                </div>

                <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-100">
                  <button type="button" onClick={handleBack} className="btn-secondary px-6">Atrás</button>
                  <button type="button" onClick={handleNext} className="btn-primary px-8">Confirmar Rasgos</button>
                </div>
              </div>
            )}

            {/* STEP 8: Huellas */}
            {step === 8 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 bg-primary-50 text-primary-600 rounded-full mb-3"><FingerPrintIcon className="w-8 h-8"/></div>
                  <h2 className="text-2xl font-bold text-slate-800">Captura Biométrica</h2>
                  <p className="text-slate-500 text-sm">Escanea tus dedos índices para validación institucional.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center gap-12 py-4">
                  <FingerprintScanner 
                    label="Índice Izquierdo" 
                    status={watch('leftIndexFingerprintStatus')} 
                    onStatusChange={(s) => setValue('leftIndexFingerprintStatus', s)} 
                  />
                  <FingerprintScanner 
                    label="Índice Derecho" 
                    status={watch('rightIndexFingerprintStatus')} 
                    onStatusChange={(s) => setValue('rightIndexFingerprintStatus', s)} 
                  />
                </div>

                <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-100">
                  <button type="button" onClick={handleBack} className="btn-secondary px-6">Atrás</button>
                  <button type="button" onClick={handleNext} className="btn-primary px-10">Siguiente</button>
                </div>
              </div>
            )}

            {/* STEP 9: Firma */}
            {step === 9 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 bg-primary-50 text-primary-600 rounded-full mb-3"><PencilSquareIcon className="w-8 h-8"/></div>
                  <h2 className="text-2xl font-bold text-slate-800">Firma del Inscrito</h2>
                  <p className="text-slate-500 text-sm">Tu firma voluntaria es necesaria para el preregistro militar.</p>
                </div>
                
                <SignaturePad onSignatureCaptured={setSignatureUrl} initialSignatureUrl={signatureUrl} />

                <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-100">
                  <button type="button" onClick={handleBack} className="btn-secondary px-6">Atrás</button>
                  <button type="button" onClick={handleNext} className="btn-primary px-10">Revisar Mi Ficha</button>
                </div>
              </div>
            )}

            {/* STEP 10: Confirmación y Éxito */}
            {step === 10 && (
              <>
                {!isSubmitting ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-6 text-center">
                      <h2 className="text-3xl font-extrabold text-slate-900">Validación de Datos</h2>
                      <p className="text-slate-500 text-sm">Revisa por última vez. Los biometros ya fueron procesados.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Resumen Personal</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-slate-500">DNI:</span> <span className="font-bold">{watchAll.dni}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Nombres:</span> <span className="font-bold">{watchAll.firstNames}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Ubicación:</span> <span className="font-bold truncate max-w-[150px]">{watchAll.currentDistrict}</span></div>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Evidencias</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-green-600 font-medium"><CheckCircleIcon className="w-4 h-4"/> 2 Fotos Capturadas</div>
                          <div className="flex items-center gap-2 text-green-600 font-medium"><CheckCircleIcon className="w-4 h-4"/> Huellas Duales OK</div>
                          <div className="flex items-center gap-2 text-green-600 font-medium"><CheckCircleIcon className="w-4 h-4"/> Firma Registrada</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-primary-900 text-white p-5 rounded-2xl flex items-start gap-4">
                      <SparklesIcon className="w-6 h-6 text-primary-300 mt-1" />
                      <div className="text-xs leading-relaxed">
                        <strong>MODO KIOSKO:</strong> Tu expediente será guardado como "Pendiente de Medición". El Operador FAP completará tu ficha con el peso y talla oficial en mesa.
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-100">
                      <button type="button" onClick={handleBack} className="btn-secondary px-8">Atrás</button>
                      <button type="submit" className="btn-primary px-12 text-lg py-4 shadow-xl hover:shadow-primary-200">
                        Confirmar y Finalizar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-6">
                    <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
                    <h2 className="text-2xl font-bold text-slate-800">Guardando Expediente...</h2>
                    <p className="text-slate-500">Estamos subiendo tus biometrías al servidor de la FAP.</p>
                  </div>
                )}
              </>
            )}

            {/* ÉXITO (Finalizado) */}
            {step === 10 && !isSubmitting && frontPhotoUrl && (
               <div className="text-center space-y-6 py-8 animate-in zoom-in-95 duration-500">
                 <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-100">
                   <CheckCircleIcon className="w-14 h-14" />
                 </div>
                 <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">¡Misión Cumplida!</h2>
                 <div className="max-w-md mx-auto space-y-4">
                   <p className="text-slate-600 text-lg leading-relaxed">
                     Tu preregistro militar digital ha sido procesado con éxito.
                   </p>
                   <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 text-left">
                     <p className="text-xs font-bold text-primary-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                       <ArrowRightIcon className="w-4 h-4"/> Proceso a Seguir:
                     </p>
                     <ul className="text-xs text-slate-600 space-y-3">
                        <li className="flex gap-2">
                          <span className="w-5 h-5 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">1</span>
                          <span>Acércate a la mesa técnica de atención.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="w-5 h-5 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">2</span>
                          <span>Menciona tu DNI para que el operador recupere tu expediente.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="w-5 h-5 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">3</span>
                          <span>Pasa por el tallado y pesaje instrumental.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="w-5 h-5 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">4</span>
                          <span>Recibe tu Constancia de Inscripción Militar (CIM).</span>
                        </li>
                     </ul>
                   </div>
                 </div>
                 <div className="pt-8 w-full border-t border-slate-100 mt-8">
                   <button 
                     type="button" 
                     onClick={() => { reset(); setStep(1); setFrontPhotoUrl(null); setProfilePhotoUrl(null); setSignatureUrl(null); }} 
                     className="btn-primary w-full sm:w-auto px-12 py-4 shadow-xl hover:shadow-primary-100 font-bold uppercase tracking-wide"
                   >
                     Capturar Nuevo Registro
                   </button>
                 </div>
               </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
