import { useEffect, useRef, useState, useCallback } from 'react';

const ESCALA_PIXELS_A_METROS = 0.002;
const MIN_FEATURES = 10;
const MAX_FEATURES = 150;
const QUALITY = 0.01;
const MIN_DISTANCE = 10;
const VO_FRAME_SKIP = 8;
const VO_MIN_INTERVAL_MS = 250;

function useVisualOdometry(videoRef) {
  const [opencvCargado, setOpencvCargado] = useState(false);
  const [posicionGlobal, setPosicionGlobal] = useState({ x: 0, y: 0 });
  const [velocidad, setVelocidad] = useState({ x: 0, y: 0 });
  const [anguloBarrido, setAnguloBarrido] = useState(0);
  const activo = true;

  const prevFrameRef = useRef(null);
  const prevFeaturesRef = useRef(null);
  const posicionAcumRef = useRef({ x: 0, y: 0 });
  const cvRef = useRef(null);
  const canvasAuxRef = useRef(document.createElement('canvas'));
  const frameCountRef = useRef(0);
  const lastRunRef = useRef(0);

  useEffect(() => {
    let mounted = true;

    async function cargarOpenCV() {
      if (window.cv && window.cv.Mat) {
        cvRef.current = window.cv;
        if (mounted) setOpencvCargado(true);
        return;
      }

      if (document.querySelector('script[src="/opencv.js"]')) {
        const checkOpenCV = setInterval(() => {
          if (window.cv && window.cv.Mat) {
            cvRef.current = window.cv;
            if (mounted) setOpencvCargado(true);
            clearInterval(checkOpenCV);
          }
        }, 100);
        return () => clearInterval(checkOpenCV);
      }

      const script = document.createElement('script');
      script.src = '/opencv.js';
      script.async = true;
      script.onload = () => {
        const checkOpenCV = setInterval(() => {
          if (window.cv && window.cv.Mat) {
            cvRef.current = window.cv;
            if (mounted) setOpencvCargado(true);
            clearInterval(checkOpenCV);
            console.log('OpenCV.js cargado');
          }
        }, 100);
      };
      document.head.appendChild(script);
    }

    cargarOpenCV();

    return () => {
      mounted = false;
    };
  }, []);

  const procesarFrame = useCallback((video) => {
    if (!cvRef.current || !video || video.readyState !== 4) return null;

    const cv = cvRef.current;
    const canvas = canvasAuxRef.current;
    const vw = video.videoWidth || 480;
    const vh = video.videoHeight || 640;
    const maxDim = 320;
    const scale = Math.min(maxDim / vw, maxDim / vh);
    canvas.width = Math.round(vw * scale);
    canvas.height = Math.round(vh * scale);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const src = cv.imread(canvas);
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    src.delete();

    return gray;
  }, []);

  const detectarFeatures = useCallback((gray) => {
    if (!cvRef.current || !gray) return null;

    const cv = cvRef.current;
    const corners = new cv.Mat();

    cv.goodFeaturesToTrack(gray, corners, MAX_FEATURES, QUALITY, MIN_DISTANCE);

    if (corners.rows < MIN_FEATURES) {
      corners.delete();
      return null;
    }

    const features = [];
    for (let i = 0; i < corners.rows; i++) {
      features.push({
        x: corners.floatAt(i, 0),
        y: corners.floatAt(i, 1),
      });
    }

    corners.delete();
    return features;
  }, []);

  const calcularFlujoOptico = useCallback((prevGray, currGray, prevFeatures) => {
    if (!cvRef.current || !prevGray || !currGray || !prevFeatures || prevFeatures.length === 0) {
      return null;
    }

    const cv = cvRef.current;

    const prevPts = new cv.Mat(prevFeatures.length, 1, cv.CV_32FC2);
    for (let i = 0; i < prevFeatures.length; i++) {
      const ptr = prevPts.floatPtr(i, 0);
      ptr[0] = prevFeatures[i].x;
      ptr[1] = prevFeatures[i].y;
    }

    const nextPts = new cv.Mat();
    const status = new cv.Mat();
    const err = new cv.Mat();

    cv.calcOpticalFlowPyrLK(prevGray, currGray, prevPts, nextPts, status, err);

    const puntosActuales = [];
    const desplazamientos = [];

    for (let i = 0; i < status.rows; i++) {
      if (status.ucharAt(i, 0) === 1) {
        const prevX = prevPts.floatAt(i, 0);
        const prevY = prevPts.floatAt(i, 1);
        const currX = nextPts.floatAt(i, 0);
        const currY = nextPts.floatAt(i, 1);

        puntosActuales.push({ x: currX, y: currY });
        desplazamientos.push({
          dx: currX - prevX,
          dy: currY - prevY,
        });
      }
    }

    prevPts.delete();
    nextPts.delete();
    status.delete();
    err.delete();

    if (desplazamientos.length < MIN_FEATURES) return null;

    desplazamientos.sort((a, b) => {
      const magA = Math.sqrt(a.dx * a.dx + a.dy * a.dy);
      const magB = Math.sqrt(b.dx * b.dx + b.dy * b.dy);
      return magA - magB;
    });

    const inicio = Math.floor(desplazamientos.length * 0.1);
    const fin = Math.floor(desplazamientos.length * 0.9);
    const recortados = desplazamientos.slice(inicio, fin);

    let sumaDx = 0;
    let sumaDy = 0;
    recortados.forEach((d) => {
      sumaDx += d.dx;
      sumaDy += d.dy;
    });

    const promedioDx = sumaDx / recortados.length;
    const promedioDy = sumaDy / recortados.length;

    return {
      desplazamiento: {
        x: promedioDx * ESCALA_PIXELS_A_METROS,
        y: promedioDy * ESCALA_PIXELS_A_METROS,
      },
      puntosActuales,
    };
  }, []);

  const estimarBarrido = useCallback((desplazamiento) => {
    const umbral = 0.001;
    if (Math.abs(desplazamiento.x) > umbral) {
      setAnguloBarrido((prev) => {
        const nuevo = prev + desplazamiento.x * 50;
        return Math.max(-90, Math.min(90, nuevo));
      });
    }
  }, []);

  useEffect(() => {
    if (!opencvCargado || !videoRef.current || !activo) return;

    let animationFrameId;

    function cicloOdometria() {
      const video = videoRef.current;
      if (!video || video.readyState !== 4) {
        animationFrameId = requestAnimationFrame(cicloOdometria);
        return;
      }

      frameCountRef.current++;
      const ahora = Date.now();
      if (frameCountRef.current % VO_FRAME_SKIP !== 0 || ahora - lastRunRef.current < VO_MIN_INTERVAL_MS) {
        animationFrameId = requestAnimationFrame(cicloOdometria);
        return;
      }
      lastRunRef.current = ahora;

      const currGray = procesarFrame(video);
      if (!currGray) {
        animationFrameId = requestAnimationFrame(cicloOdometria);
        return;
      }

      if (prevFrameRef.current && prevFeaturesRef.current) {
        const resultado = calcularFlujoOptico(prevFrameRef.current, currGray, prevFeaturesRef.current);

        if (resultado) {
          const { desplazamiento, puntosActuales } = resultado;

          posicionAcumRef.current = {
            x: posicionAcumRef.current.x + desplazamiento.x,
            y: posicionAcumRef.current.y + desplazamiento.y,
          };

          setPosicionGlobal({ ...posicionAcumRef.current });
          setVelocidad(desplazamiento);
          estimarBarrido(desplazamiento);

          prevFeaturesRef.current = puntosActuales;
        }
      }

      const features = detectarFeatures(currGray);
      if (features) {
        prevFeaturesRef.current = features;
      }

      if (prevFrameRef.current) {
        prevFrameRef.current.delete();
      }
      prevFrameRef.current = currGray;

      animationFrameId = requestAnimationFrame(cicloOdometria);
    }

    cicloOdometria();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (prevFrameRef.current) {
        prevFrameRef.current.delete();
        prevFrameRef.current = null;
      }
    };
  }, [opencvCargado, videoRef, activo, procesarFrame, detectarFeatures, calcularFlujoOptico, estimarBarrido]);

  const reiniciarPosicion = useCallback(() => {
    posicionAcumRef.current = { x: 0, y: 0 };
    setPosicionGlobal({ x: 0, y: 0 });
    setVelocidad({ x: 0, y: 0 });
    setAnguloBarrido(0);
  }, []);

  return {
    opencvCargado,
    posicionGlobal,
    velocidad,
    anguloBarrido,
    reiniciarPosicion,
  };
}

export default useVisualOdometry;
