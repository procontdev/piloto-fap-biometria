import { useState } from 'react';
import RegistrationForm from './RegistrationForm';

export default function KioskRegistration() {
  const [isSuccess, setIsSuccess] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      
      {/* Kiosk Header */}
      <div className="w-full max-w-4xl text-center mb-10">
        <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-sm border border-slate-100 mb-6">
          <img 
            src="/fap-logo.png" 
            alt="Logo FAP" 
            className="w-20 h-20 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Escudo_de_la_Fuerza_A%C3%A9rea_del_Per%C3%BA.svg';
            }}
          />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-primary-900 mb-2">
          Registro Militar Digital
        </h1>
        <p className="text-lg text-slate-600">
          Módulo de Autoservicio
        </p>
      </div>

      {/* Main Form Container */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12">
        <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-4">
          <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-xl shrink-0">
            ℹ️
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Bienvenido al piloto de inscripción en Autoservicio</h3>
            <p className="text-slate-600 mt-1">
              Por favor completa este formulario con tus datos fidedignos. Tu registro incluye captura de foto usando la cámara web y una simulación de huella digital para validar tu identidad.
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="text-center py-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full mb-6">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">¡Registro Exitoso!</h2>
            <p className="text-slate-600 text-lg max-w-lg mx-auto mb-8">
              Tu preinscripción ha sido guardada en la plataforma digital. Puedes acercarte a la mesa de control o regresar al inicio para registrar a otra persona.
            </p>
            <button 
              onClick={() => {
                setIsSuccess(false);
                window.scrollTo(0, 0);
              }} 
              className="btn-primary"
            >
              Registrar otra persona
            </button>
          </div>
        ) : (
          <RegistrationForm mode="Kiosko" onSuccess={() => setIsSuccess(true)} />
        )}
      </div>

      {/* Footer */}
      <div className="w-full max-w-4xl text-center mt-12 text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} Fuerza Aérea del Perú. Piloto de Transformación Digital.</p>
      </div>

    </div>
  );
}
