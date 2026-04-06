import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { loginSchema, type LoginFormData } from '../../schemas';
import { authApi } from '../../api/services';
import { useAuth } from './AuthContext';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const res = await authApi.login(data);
      login({
        token: res.token,
        username: res.username,
        fullName: res.fullName,
        role: res.role as 'Operador' | 'Supervisor',
        expiresAt: res.expiresAt,
      });
      // Redirect handled by App.tsx router logic
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Fuerza Aérea del Perú</h1>
          <p className="text-sm text-slate-500 mt-1">Plataforma de Inscripción Digital</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Usuario</label>
            <input
              type="text"
              {...register('username')}
              className={`input-field ${errors.username ? 'input-error' : ''}`}
            />
            {errors.username && <p className="text-danger text-xs mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label className="label">Contraseña</label>
            <input
              type="password"
              {...register('password')}
              className={`input-field ${errors.password ? 'input-error' : ''}`}
            />
            {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full mt-6"
          >
            {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
