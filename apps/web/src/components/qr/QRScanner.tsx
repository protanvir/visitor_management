"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import jsQR from "jsqr";

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  isActive?: boolean;
}

export default function QRScanner({ onScan, onError, isActive = true }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const animationRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);

  const stopScanning = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
    setScanning(false);
  }, []);

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setScanning(true);
    } catch (err: any) {
      const msg = err?.name === "NotAllowedError"
        ? "Camera access denied. Please allow camera permissions."
        : err?.name === "NotFoundError"
        ? "No camera found on this device."
        : "Unable to access camera for QR scanning";
      setError(msg);
      onError?.(msg);
    }
  }, [onError]);

  // QR detection loop
  const detectQRCode = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !scanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationRef.current = requestAnimationFrame(detectQRCode);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code) {
      // QR code found — stop scanning and return data
      stopScanning();
      onScan(code.data);
      return;
    }

    animationRef.current = requestAnimationFrame(detectQRCode);
  }, [scanning, onScan, stopScanning]);

  useEffect(() => {
    if (isActive && scanning) {
      animationRef.current = requestAnimationFrame(detectQRCode);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, scanning, detectQRCode]);

  useEffect(() => {
    if (isActive) {
      startScanning();
    } else {
      stopScanning();
    }
    return () => stopScanning();
  }, [isActive, startScanning, stopScanning]);

  const handleManualInput = () => {
    const data = prompt("Enter QR code data manually:");
    if (data) onScan(data);
  };

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-lg bg-neutral-900 aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {scanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 relative">
              <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-green-500 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-green-500 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-green-500 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-green-500 rounded-br-lg" />
              <div className="absolute top-0 left-0 right-0 h-1 bg-green-500 animate-scan" />
            </div>
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-white text-sm bg-black/60 px-4 py-2 rounded-full inline-block">
                Point camera at QR code
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/75">
            <div className="text-center text-white p-4">
              <svg className="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="mb-4">{error}</p>
              <button onClick={startScanning} className="px-4 py-2 bg-green-600 text-white rounded-lg">
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="mt-3 flex gap-2">
        {scanning ? (
          <button onClick={stopScanning} className="btn btn-ghost flex-1">Stop Scanner</button>
        ) : (
          <button onClick={startScanning} className="btn btn-primary flex-1">Start Scanner</button>
        )}
        <button onClick={handleManualInput} className="btn btn-ghost">Manual Input</button>
      </div>
    </div>
  );
}
