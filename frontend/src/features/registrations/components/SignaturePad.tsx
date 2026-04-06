import { useRef, useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface SignaturePadProps {
  onSignatureCaptured: (base64: string) => void;
  initialSignatureUrl?: string | null;
}

export default function SignaturePad({ onSignatureCaptured, initialSignatureUrl }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!initialSignatureUrl);
  const [isSaved, setIsSaved] = useState(!!initialSignatureUrl);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0f172a'; // slate-900
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || isSaved) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setIsEmpty(false);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isSaved) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    setIsSaved(false);
    onSignatureCaptured('');
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;

    const base64 = canvas.toDataURL('image/png');
    onSignatureCaptured(base64);
    setIsSaved(true);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <div className="w-full mb-2 flex justify-between items-end">
        <div>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-tight">Firma Digital</h3>
          <p className="text-[10px] text-slate-400">Use su dedo o un lápiz óptico sobre el recuadro</p>
        </div>
        {isSaved && (
          <span className="text-[10px] font-bold text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full border border-green-100">
            <CheckCircleIcon className="w-3 h-3" /> GUARDADA
          </span>
        )}
      </div>

      <div className={`relative w-full bg-slate-50 border-2 rounded-2xl overflow-hidden transition-all duration-300 ${isSaved ? 'border-green-500 bg-white shadow-lg' : 'border-slate-200'}`}>
        {isSaved && initialSignatureUrl && !isEmpty && (
           <img src={initialSignatureUrl} alt="Firma Guardada" className="absolute inset-0 w-full h-full object-contain p-4 pointer-events-none" />
        )}
        
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          className={`w-full h-[200px] touch-none cursor-crosshair ${isSaved ? 'opacity-0' : 'opacity-100'}`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />

        {!isSaved && isEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-300">
            <PencilIcon className="w-10 h-10 mb-2 opacity-20" />
            <span className="text-xs font-medium italic">Firme aquí</span>
          </div>
        )}

        {/* Botones de acción dentro del canvas */}
        <div className="absolute bottom-3 right-3 flex gap-2">
            {!isSaved && !isEmpty && (
              <>
                <button
                  type="button"
                  onClick={clear}
                  className="bg-white/80 backdrop-blur-md text-slate-600 p-2 rounded-full shadow-sm hover:bg-white hover:text-red-500 transition-all border border-slate-200"
                  title="Borrar"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={save}
                  className="bg-primary-600 text-white px-4 py-1.5 rounded-full shadow-md hover:bg-primary-700 transition-all text-xs font-bold"
                >
                  Confirmar Firma
                </button>
              </>
            )}
            {isSaved && (
              <button
                type="button"
                onClick={clear}
                className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full text-[10px] font-bold hover:bg-slate-200 transition-all"
              >
                CAMBIAR FIRMA
              </button>
            )}
        </div>
      </div>
      
      <div className="mt-4 w-full border-t border-slate-100 pt-3 text-center">
        <p className="text-[9px] text-slate-400 leading-relaxed uppercase">
          Al firmar, declaro que la información proporcionada es fidedigna y autorizo su tratamiento para fines de registro militar.
        </p>
      </div>
    </div>
  );
}
