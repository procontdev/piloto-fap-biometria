import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const registrationSchema = z.object({
  dni: z.string()
    .min(8, 'DNI debe tener 8 dígitos')
    .max(8, 'DNI debe tener 8 dígitos')
    .regex(/^\d{8}$/, 'DNI debe contener solo dígitos'),
  firstNames: z.string().min(2, 'Nombres es obligatorio').max(150),
  paternalSurname: z.string().min(2, 'Apellido paterno es obligatorio').max(100),
  maternalSurname: z.string().min(2, 'Apellido materno es obligatorio').max(100),
  birthDate: z.string().min(1, 'Fecha de nacimiento es obligatoria')
    .refine((val) => {
      const year = new Date(val).getFullYear();
      const age = currentYear - year;
      return age >= 16 && age <= 19;
    }, 'La edad debe estar entre 16 y 19 años'),
  gender: z.enum(['M', 'F'], { message: 'Seleccione el sexo' }),
  phone: z.string().nullish().refine(
    (val) => !val || /^[\d+ ]{7,15}$/.test(val),
    'Formato de teléfono no válido'
  ),
  email: z.string().nullish().refine(
    (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    'Formato de correo no válido'
  ),
  address: z.string().min(3, 'Dirección es obligatoria').max(300),
  department: z.string().min(2, 'Departamento es obligatorio').max(100),
  province: z.string().min(2, 'Provincia es obligatoria').max(100),
  district: z.string().min(2, 'Distrito es obligatorio').max(100),

  // Ubicación Actual
  currentAddress: z.string().nullish().transform(val => val === '' ? null : val),
  currentDepartment: z.string().nullish().transform(val => val === '' ? null : val),
  currentProvince: z.string().nullish().transform(val => val === '' ? null : val),
  currentDistrict: z.string().nullish().transform(val => val === '' ? null : val),

  // Datos Físicos
  hairColor: z.string().nullish().transform(val => val === '' ? null : val),
  eyeColor: z.string().nullish().transform(val => val === '' ? null : val),
  complexion: z.string().nullish().transform(val => val === '' ? null : val),
  bloodType: z.string().nullish().transform(val => val === '' ? null : val),
  shoeSize: z.preprocess((val) => (val === '' ? undefined : Number(val)), z.number().min(20).max(60).optional()),

  educationLevel: z.string().min(1, 'Grado de instrucción es obligatorio').default('Secundaria Completa'),
  militaryServiceInterest: z.boolean().default(false),
  weight: z.preprocess((val) => (val === '' || val === 0 ? undefined : Number(val)), z.number().min(30).max(200).optional()),
  height: z.preprocess((val) => (val === '' || val === 0 ? undefined : Number(val)), z.number().min(1.2).max(2.5).optional()),
  
  // Evidencias
  photoPath: z.string().nullish(),
  profilePhotoPath: z.string().nullish(),
  signaturePath: z.string().nullish(),
  fingerprintStatus: z.string().default('Pendiente'),
  leftIndexFingerprintStatus: z.string().default('Pendiente'),
  rightIndexFingerprintStatus: z.string().default('Pendiente'),
  
  registrationMode: z.string().default('Operador'),
  registrationStatus: z.string().nullish(),
  observations: z.string().max(500).nullish(),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

export const loginSchema = z.object({
  username: z.string().min(1, 'Usuario es obligatorio'),
  password: z.string().min(1, 'Contraseña es obligatoria'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
