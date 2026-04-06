import { useState, useEffect, useRef, useCallback } from 'react';
import { CameraIcon, CheckCircleIcon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Webcam from 'react-webcam';

interface PhotoCaptureProps {
  onPhotoCaptured: (photoBase64: string) => void;
  initialPhotoUrl?: string | null;
  label?: string;
  subtitle?: string;
  variant?: 'frontal' | 'profile';
  autoCapture?: boolean;
}

export default function PhotoCapture({ 
  onPhotoCaptured, 
  initialPhotoUrl,
  label = "Capturar Foto",
  subtitle = "Mire fijamente a la cámara",
  variant = 'frontal',
  autoCapture = true
}: PhotoCaptureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(initialPhotoUrl || null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isDetected, setIsDetected] = useState(false);
  const [isAligned, setIsAligned] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImgSrc(imageSrc);
      onPhotoCaptured(imageSrc);
      setIsOpen(false);
      setCountdown(null);
      setIsAligned(false);
      setIsDetected(false);
      setIsValidating(false);
    }
  }, [webcamRef, onPhotoCaptured]);

  // Simulated Detection Logic: Face appears after 1.5s
  useEffect(() => {
    let timer: any;
    if (isOpen && !imgSrc && !isDetected) {
      timer = setTimeout(() => {
        setIsDetected(true);
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [isOpen, imgSrc, isDetected]);

  // Simulated Auto-Capture Logic
  useEffect(() => {
    let timer: any;
    if (isOpen && autoCapture && !imgSrc && isAligned && countdown === null) {
      setCountdown(3);
    }
    return () => clearTimeout(timer);
  }, [isOpen, autoCapture, imgSrc, isAligned, countdown]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      capture();
    }
  }, [countdown, capture]);

  const handleStartCapture = () => {
    if (!isDetected) return;
    setIsValidating(true);
    // Simulate a brief validation check before starting countdown
    setTimeout(() => {
      setIsValidating(false);
      setIsAligned(true);
    }, 800);
  };

  const retake = () => {
    setImgSrc(null);
    onPhotoCaptured('');
    setIsOpen(true);
    setCountdown(null);
    setIsAligned(false);
    setIsDetected(false);
  };

  const closeCamera = () => {
    setIsOpen(false);
    setCountdown(null);
    setIsAligned(false);
    setIsDetected(false);
  };

  return (
    <div className="flex flex-col items-center">
      {imgSrc ? (
        <div className="relative group">
          <img 
            src={imgSrc} 
            alt="Foto capturada" 
            className="w-56 h-72 object-cover rounded-2xl border-4 border-white shadow-xl bg-slate-100"
          />
          <button
            type="button"
            onClick={retake}
            className="absolute -top-3 -right-3 bg-slate-800 text-white rounded-full p-2 shadow-lg hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-20"
            title="Volver a tomar foto"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          <div className="absolute -bottom-3 -right-3 bg-green-500 text-white rounded-full p-1.5 shadow-lg border-2 border-white z-20">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <p className="mt-3 text-[10px] font-black text-green-600 uppercase tracking-[0.2em]">{label} Guardada</p>
        </div>
      ) : isOpen ? (
        <div className="relative border-4 border-slate-900 rounded-3xl overflow-hidden shadow-2xl bg-black w-56 h-72">
          
          {/* Status Badge */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[9px] text-white font-bold uppercase border border-white/20 flex items-center gap-1.5 whitespace-nowrap min-w-[140px] justify-center">
            <div className={`w-1.5 h-1.5 rounded-full ${countdown !== null ? 'bg-red-500 animate-pulse' : isDetected ? 'bg-green-500' : 'bg-slate-500'}`}></div>
            <span>
              {countdown !== null ? `Capturando en ${countdown}...` : 
               isValidating ? 'Validando encuadre...' :
               isDetected ? (variant === 'frontal' ? 'Rostro Detectado' : 'Perfil Detectado') : 
               'Buscando Rostro...'}
            </span>
          </div>

          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "user", width: 480, height: 600 }}
            className="w-full h-full object-cover"
          />

          {/* Overlay Guía */}
          <div className={`absolute inset-0 pointer-events-none flex items-center justify-center transition-colors duration-500 ${isDetected ? 'bg-green-500/5' : 'bg-transparent'}`}>
            {variant === 'frontal' ? (
              <div className={`w-36 h-48 border-2 border-dashed rounded-[70px] relative transition-colors duration-300 ${isDetected ? 'border-green-400/60 shadow-[0_0_15px_rgba(74,222,128,0.2)]' : 'border-white/40'}`}>
                 <div className={`absolute top-1/2 left-0 right-0 h-0.5 -translate-y-4 transition-colors ${isDetected ? 'bg-green-400/20' : 'bg-white/10'}`}></div>
              </div>
            ) : (
              <div className={`w-36 h-48 border-2 border-dashed rounded-[70px] relative origin-center transition-colors duration-300 ${isDetected ? 'border-green-400/60 shadow-[0_0_15px_rgba(74,222,128,0.2)]' : 'border-white/40'}`}>
                 {/* Perfil side guide */}
                 <div className={`absolute inset-0 border-r-4 rounded-[70px] transition-colors ${isDetected ? 'border-primary-400/50' : 'border-primary-400/30'}`}></div>
                 <div className={`absolute top-1/4 right-0 w-8 h-8 border-t-2 border-r-2 rounded-tr-3xl transition-colors ${isDetected ? 'border-green-400/40' : 'border-white/30'}`}></div>
              </div>
            )}
            
            {/* Flash Effect on Countdown 0 */}
            {countdown === 0 && <div className="absolute inset-0 bg-white animate-flash z-50"></div>}
          </div>

          {/* Bloque de Countdown Visual Gigante */}
          {countdown !== null && countdown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/20 backdrop-blur-[2px]">
               <span className="text-8xl font-black text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] animate-ping-once">
                 {countdown}
               </span>
            </div>
          )}

          <div className="absolute bottom-4 left-0 right-0 flex justify-center z-30 gap-4 px-4">
            {!isAligned && (
               <button
                 type="button"
                 disabled={!isDetected || isValidating}
                 onClick={handleStartCapture}
                 className={`rounded-full px-6 py-3 shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 border-2 ${
                   isValidating ? 'bg-amber-500 text-white border-amber-400' :
                   isDetected ? 'bg-primary-600 text-white border-white/20 hover:bg-primary-700' : 
                   'bg-slate-700 text-slate-400 border-slate-600 cursor-not-allowed'
                 }`}
               >
                 {isValidating ? (
                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                 ) : (
                   <SparklesIcon className="w-5 h-5" />
                 )}
                 <span className="text-xs font-bold uppercase tracking-wider">
                   {isValidating ? 'Procesando...' : 'Alinear y Capturar'}
                 </span>
               </button>
            )}
            
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); capture(); }}
              className="bg-white/90 text-primary-900 rounded-full p-3 shadow-xl hover:bg-white active:scale-95 transition-all flex items-center justify-center border-2 border-white"
              title="Forzar Captura Manual"
            >
              <CameraIcon className="w-5 h-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={closeCamera}
            className="absolute top-3 right-3 bg-black/40 text-white rounded-full p-1 hover:bg-black/60 z-30"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-56 h-72 border-4 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 hover:text-primary-600 hover:border-primary-300 hover:bg-slate-50 transition-all group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mb-3 group-hover:bg-white group-hover:text-primary-500 transition-all rotate-3 group-hover:rotate-0 shadow-sm border border-slate-100">
            <CameraIcon className="w-7 h-7" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">{label}</span>
          <span className="text-[9px] text-slate-400 mt-1.5 px-6 text-center leading-tight">
            {countdown === null ? subtitle : 'Preparando cámara...'}
          </span>
          {variant === 'frontal' ? (
             <div className="mt-4 flex items-center gap-1.5 py-1 px-2.5 bg-indigo-50 text-indigo-600 rounded-full">
               <SparklesIcon className="w-3 h-3" />
               <span className="text-[8px] font-bold uppercase tracking-wider italic">Auto-Captura IA</span>
             </div>
          ) : (
             <div className="mt-4 flex items-center gap-1.5 py-1 px-2.5 bg-amber-50 text-amber-600 rounded-full">
               <CameraIcon className="w-3 h-3" />
               <span className="text-[8px] font-bold uppercase tracking-wider italic">Guía de Perfil</span>
             </div>
          )}
        </button>
      )}
    </div>
  );
}
