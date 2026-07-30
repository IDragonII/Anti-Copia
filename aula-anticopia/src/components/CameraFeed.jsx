import { useEffect, useState, useRef } from 'react';
import useIsMobile from '../hooks/useIsMobile';

function CameraFeed({ videoRef, onStreamReady }) {
  const isMobile = useIsMobile();
  const [hasCamera, setHasCamera] = useState(() => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  });
  const [facingMode, setFacingMode] = useState('user');
  const streamRef = useRef(null);

  useEffect(() => {
    if (!hasCamera) return;
    const videoElement = videoRef.current;
    if (!videoElement) return;

    let cancelled = false;

    (async () => {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: isMobile ? 480 : 640 },
            height: { ideal: isMobile ? 640 : 480 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        videoElement.srcObject = stream;
        if (onStreamReady) onStreamReady(stream);
      } catch {
        if (!cancelled) setHasCamera(false);
      }
    })();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facingMode, videoRef, hasCamera, onStreamReady, isMobile]);

  const toggleCamera = () => {
    setFacingMode((prev) => prev === 'user' ? 'environment' : 'user');
  };

  if (!hasCamera) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#F1F5F9', color: '#94A3B8',
      }}>
        <CameraIcon />
        <p style={{ fontSize: '14px', fontWeight: 500, margin: '12px 0 0' }}>Camara no disponible</p>
        <p style={{ fontSize: '12px', margin: '4px 0 0', opacity: 0.7 }}>Verifica los permisos del navegador</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: '100%', height: '100%', objectFit: isMobile ? 'cover' : 'contain', display: 'block', background: '#000' }}
      />
      <button
        onClick={toggleCamera}
        style={{
          position: 'absolute', bottom: '12px', right: '12px',
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'rgba(0,0,0,0.5)', border: 'none',
          cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)',
        }}
      >
        <SwapIcon />
      </button>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg style={{ width: '48px', height: '48px', opacity: 0.5 }}
      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <line x1="2" y1="2" x2="22" y2="22"/>
    </svg>
  );
}

function SwapIcon() {
  return (
    <svg style={{ width: '20px', height: '20px', color: '#FFFFFF' }}
      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/>
      <path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5"/>
      <path d="m16 3-4 4 4 4"/>
      <path d="m8 21 4-4-4-4"/>
    </svg>
  );
}

export default CameraFeed;
