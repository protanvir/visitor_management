"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  isActive?: boolean;
}

export default function QRScanner({
  onScan,
  onError,
  isActive = true,
}: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const animationRef = useRef<number>();

  const startScanning = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      setScanning(true);
      setError(null);
    } catch (err) {
      const errorMessage = "Unable to access camera for QR scanning";
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [onError]);

  const stopScanning = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setScanning(false);
  }, []);

  // Simple QR code detection using canvas
  // In production, use a library like jsQR or html5-qrcode
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

    // Get image data for analysis
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Note: Actual QR code detection would require a library like jsQR
    // This is a placeholder that simulates detection
    // In production, install jsQR: npm install jsqr

    animationRef.current = requestAnimationFrame(detectQRCode);
  }, [scanning]);

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

  // Manual input for testing
  const handleManualInput = () => {
    const data = prompt("Enter QR code data manually:");
    if (data) {
      onScan(data);
    }
  };

  return (
    <div className="relative">
      {/* Video Preview */}
      <div className="relative overflow-hidden rounded-corporate-lg bg-neutral-900 aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Scanner overlay */}
        {scanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Scanner frame */}
            <div className="w-64 h-64 relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-accent-500" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-accent-500" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-accent-500" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-accent-500" />
              
              {/* Scanning line animation */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-accent-500 animate-scan" />
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-white text-sm bg-black/50 px-4 py-2 rounded-full inline-block">
                Position QR code within the frame
              </p>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/75">
            <div className="text-center text-white p-4">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-danger-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="mb-4">{error}</p>
              <button onClick={startScanning} className="btn-accent">
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for QR processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      <div className="mt-4 flex gap-2">
        {scanning ? (
          <button onClick={stopScanning} className="btn-ghost flex-1">
            Stop Scanner
          </button>
        ) : (
          <button onClick={startScanning} className="btn-accent flex-1">
            Start Scanner
          </button>
        )}
        <button onClick={handleManualInput} className="btn-ghost">
          Manual Input
        </button>
      </div>
    </div>
  );
}
