import { useState } from 'react';
import { FingerPrintIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface FingerprintScannerProps {
  status: string;
  onStatusChange: (status: 'Pendiente' | 'Capturada') => void;
  label?: string;
}

export default function FingerprintScanner({ 
  status, 
  onStatusChange,
  label = "Huella Dactilar"
}: FingerprintScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const startScan = () => {
    setIsScanning(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          onStatusChange('Capturada');
          toast.success(`${label} capturada correctamente`);
          return 100;
        }
        return prev + 20;
      });
    }, 400);
  };

  const isCaptured = status === 'Capturada';

  return (
    <div className="flex flex-col items-center group">
      <div 
        className={`w-32 h-40 border-4 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 ${
          isCaptured 
            ? 'border-green-500 bg-green-50 text-green-600 shadow-lg shadow-green-100' 
            : isScanning 
              ? 'border-primary-500 text-primary-500 bg-primary-50 shadow-lg shadow-primary-100' 
              : 'border-slate-200 text-slate-300 bg-slate-50'
        }`}
      >
        {/* Glow effect when scanning */}
        {isScanning && (
          <div className="absolute inset-0 bg-primary-400/10 animate-pulse"></div>
        )}

        <FingerPrintIcon className={`w-20 h-20 transition-all duration-700 ${isCaptured ? 'scale-110' : isScanning ? 'scale-105 animate-pulse' : 'opacity-40 grayscale'}`} />
        
        {/* Scanner Line */}
        {isScanning && (
          <div 
            className="absolute left-0 right-0 h-1 bg-primary-500 shadow-[0_0_15px_rgba(37,99,235,0.8)] z-20 animate-scan-line"
            style={{ top: `${progress}%` }}
          />
        )}

        {isCaptured && (
          <div className="absolute top-3 right-3 text-green-500 animate-in zoom-in-50 duration-300">
            <CheckCircleIcon className="w-6 h-6 fill-white" />
          </div>
        )}

        {/* Progress Fill */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-primary-500/10 transition-all duration-300 pointer-events-none"
          style={{ height: `${progress}%` }}
        />
      </div>

      <div className="text-center mt-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <button
          type="button"
          onClick={startScan}
          disabled={isScanning || isCaptured}
          className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
            isCaptured 
              ? 'bg-green-100 text-green-700'
              : isScanning 
                ? 'bg-primary-50 text-primary-400 cursor-not-allowed'
                : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-primary-500 hover:text-primary-600 shadow-sm'
          }`}
        >
          {isCaptured 
            ? 'Listo' 
            : isScanning 
              ? 'Procesando...' 
              : 'Iniciar Captura'}
        </button>
      </div>

      {isCaptured && (
        <button
          type="button"
          onClick={() => onStatusChange('Pendiente')}
          className="text-[10px] text-slate-400 mt-2 hover:text-red-500 transition-colors uppercase tracking-tighter"
        >
          Reiniciar
        </button>
      )}
    </div>
  );
}
