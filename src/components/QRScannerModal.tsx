'use client';

import { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { Button } from '@/components/Button';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export function QRScannerModal({ isOpen, onClose, onScanSuccess }: QRScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError('');
    setIsScanning(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play().then(() => {
          requestAnimationFrame(scanFrame);
        }).catch((err) => {
          console.error('Video play error:', err);
        });
      }
    } catch (err: any) {
      console.error('Kamera error:', err);
      setCameraError('Gagal mengakses kamera: ' + (err.message || 'Izin kamera ditolak atau tidak didukung pada perangkat ini.'));
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const scanFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          console.log('QR Code Terdeteksi:', code.data);
          stopCamera();
          onScanSuccess(code.data);
          return;
        }
      }
    }

    if (videoRef.current) {
      animFrameIdRef.current = requestAnimationFrame(scanFrame);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            stopCamera();
            onScanSuccess(code.data);
          } else {
            alert('Tidak dapat membaca QR Code dari foto ini. Silakan coba foto yang lebih jelas.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
        <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-base">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Scan QR Code E-Ticket
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-indigo-100 hover:bg-indigo-700 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 flex flex-col items-center">
          {cameraError ? (
            <div className="text-center py-6 px-4 bg-red-50 text-red-700 rounded-xl border border-red-200 mb-4 w-full">
              <p className="text-sm font-semibold mb-2">{cameraError}</p>
              <p className="text-xs text-red-600">Gunakan opsi &quot;Unggah Foto QR&quot; di bawah jika tidak memiliki akses kamera.</p>
            </div>
          ) : (
            <div className="relative w-full aspect-square max-w-[280px] bg-black rounded-xl overflow-hidden shadow-inner border-2 border-indigo-500 mb-4">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning Box Target */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-dashed border-emerald-400 rounded-xl animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.5)]"></div>
              </div>

              {isScanning && (
                <div className="absolute bottom-2 left-2 right-2 text-center bg-black/60 backdrop-blur-md text-emerald-400 text-xs py-1 rounded-lg font-mono">
                  Arahkan QR Code E-Ticket ke dalam kotak
                </div>
              )}
            </div>
          )}

          <div className="w-full flex flex-col gap-2">
            <label className="w-full cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-slate-300 transition text-center">
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Unggah File Gambar QR Code
              </div>
            </label>

            <Button variant="outline" onClick={onClose} className="w-full mt-1">
              Batal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
