"use client";

import { useRef, useState, useCallback } from "react";

interface PhotoCaptureProps {
  onCapture: (photoData: string) => void;
  onError?: (error: string) => void;
  width?: number;
  height?: number;
}

export default function PhotoCapture({
  onCapture,
  onError,
  width = 400,
  height = 300,
}: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: width },
          height: { ideal: height },
          facingMode: "user",
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setStream(mediaStream);
      setIsActive(true);
      setError(null);
    } catch (err) {
      const errorMessage = "Unable to access camera. Please ensure camera permissions are granted.";
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [width, height, onError]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsActive(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror the image horizontally for selfie view
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Convert to base64
    const photoData = canvas.toDataURL("image/jpeg", 0.8);
    onCapture(photoData);
    stopCamera();
  }, [onCapture, stopCamera]);

  return (
    <div className="relative">
      {/* Video Preview */}
      <div
        className="relative overflow-hidden rounded-corporate-lg bg-neutral-100"
        style={{ width, height }}
      >
        {isActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            {/* Capture button overlay */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <button
                onClick={capturePhoto}
                className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-neutral-100 transition-colors"
              >
                <div className="w-12 h-12 bg-danger-500 rounded-full border-4 border-white" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <svg
              className="w-16 h-16 text-neutral-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-neutral-500 text-sm">No photo captured</p>
          </div>
        )}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      <div className="mt-4 flex gap-2">
        {!isActive ? (
          <button onClick={startCamera} className="btn-accent flex-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Start Camera
          </button>
        ) : (
          <>
            <button onClick={stopCamera} className="btn-ghost flex-1">
              Cancel
            </button>
            <button onClick={capturePhoto} className="btn-success flex-1">
              Capture
            </button>
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 p-2 bg-danger-50 border border-danger-200 rounded-corporate text-danger-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
