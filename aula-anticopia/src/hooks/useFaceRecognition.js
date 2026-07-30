import { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import * as tf from '@tensorflow/tfjs';

const MODELS_URL = '/models';
const DURACION_CAPTURA = 5000;
const INTERVALO_CAPTURA = 300;

function useFaceRecognition(videoRef) {
  const [modelosCargados, setModelosCargados] = useState(false);
  const [trabajadoresDetectados, setTrabajadoresDetectados] = useState([]);
  const [baseTrabajadores, setBaseTrabajadores] = useState(() => {
    const guardada = localStorage.getItem('trabajadoresRegistrados');
    if (!guardada) return [];
    const datos = JSON.parse(guardada);
    return datos.map((r) => ({
      ...r,
      descriptores: r.descriptores || (r.descriptor ? [r.descriptor] : []),
    }));
  });
  const [capturando, setCapturando] = useState(false);
  const [progresoCaptura, setProgresoCaptura] = useState(0);
  const [muestrasCapturadas, setMuestrasCapturadas] = useState(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    async function cargarModelos() {
      try {
        await tf.setBackend('webgl');
        await tf.ready();
        console.log('TensorFlow.js backend:', tf.getBackend());

        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODELS_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_URL),
        ]);
        setModelosCargados(true);
        console.log('Modelos face-api.js cargados (SSD MobileNet + WebGL)');
      } catch (error) {
        console.error('Error cargando modelos face-api.js:', error);
      }
    }

    cargarModelos();
  }, []);

  const detectarRostros = useCallback(async () => {
    if (!modelosCargados || !videoRef.current || videoRef.current.readyState !== 4) {
      return [];
    }

    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options({ 
          minConfidence: 0.5 
        }))
        .withFaceLandmarks(false)
        .withFaceDescriptors();

      const resultados = detections.map((det) => {
        let mejorMatch = null;
        let mejorSimilitud = 0;

        for (const registrado of baseTrabajadores) {
          const descriptores = registrado.descriptores || [];
          let sumaDistancia = 0;

          for (const descriptorGuardado of descriptores) {
            const distancia = faceapi.euclideanDistance(det.descriptor, new Float32Array(descriptorGuardado));
            sumaDistancia += distancia;
          }

          const distanciaPromedio = sumaDistancia / descriptores.length;
          const similitud = 1 - distanciaPromedio;

          if (similitud > mejorSimilitud && similitud > 0.6) {
            mejorSimilitud = similitud;
            mejorMatch = registrado;
          }
        }

        return {
          box: det.detection.box,
          descriptor: Array.from(det.descriptor),
          nombre: mejorMatch ? mejorMatch.nombre : 'Desconocido',
          id: mejorMatch ? mejorMatch.id : null,
          departamento: mejorMatch ? mejorMatch.departamento : null,
          turno: mejorMatch ? mejorMatch.turno : null,
          registrado: mejorMatch !== null,
          similitud: mejorMatch ? mejorSimilitud : 0,
        };
      });

      setTrabajadoresDetectados(resultados);
      return resultados;
    } catch (error) {
      console.error('Error detectando rostros:', error);
      return [];
    }
  }, [modelosCargados, videoRef, baseTrabajadores]);

  const registrarTrabajador = useCallback(async (datosTrabajador) => {
    if (!modelosCargados || !videoRef.current || videoRef.current.readyState !== 4) {
      return false;
    }

    setCapturando(true);
    setProgresoCaptura(0);
    setMuestrasCapturadas(0);

    const descriptores = [];
    const inicio = Date.now();

    return new Promise((resolve) => {
      const intervalo = setInterval(async () => {
        const transcurrido = Date.now() - inicio;
        const progreso = Math.min((transcurrido / DURACION_CAPTURA) * 100, 100);
        setProgresoCaptura(progreso);

        if (transcurrido >= DURACION_CAPTURA) {
          clearInterval(intervalo);

          if (descriptores.length > 0) {
            const nuevoTrabajador = {
              ...datosTrabajador,
              descriptores: descriptores,
              fechaRegistro: new Date().toISOString(),
              totalMuestras: descriptores.length,
            };

            const nuevaBase = [...baseTrabajadores, nuevoTrabajador];
            setBaseTrabajadores(nuevaBase);
            localStorage.setItem('trabajadoresRegistrados', JSON.stringify(nuevaBase));
            console.log(`Trabajador registrado: ${datosTrabajador.nombre} (${descriptores.length} muestras)`);
          }

          setCapturando(false);
          setProgresoCaptura(0);
          setMuestrasCapturadas(0);
          resolve(descriptores.length > 0);
          return;
        }

        try {
          const detection = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.SsdMobilenetv1Options({ 
              minConfidence: 0.5 
            }))
            .withFaceLandmarks(false)
            .withFaceDescriptor();

          if (detection) {
            descriptores.push(Array.from(detection.descriptor));
            setMuestrasCapturadas(descriptores.length);
          }
        } catch {
          // Ignorar frames con error
        }
      }, INTERVALO_CAPTURA);
    });
  }, [modelosCargados, videoRef, baseTrabajadores]);

  const eliminarTrabajador = useCallback((nombre) => {
    const nuevaBase = baseTrabajadores.filter((r) => r.nombre !== nombre);
    setBaseTrabajadores(nuevaBase);
    localStorage.setItem('trabajadoresRegistrados', JSON.stringify(nuevaBase));
  }, [baseTrabajadores]);

  return {
    modelosCargados,
    trabajadoresDetectados,
    baseTrabajadores,
    detectarRostros,
    registrarTrabajador,
    eliminarTrabajador,
    canvasRef,
    capturando,
    progresoCaptura,
    muestrasCapturadas,
  };
}

export default useFaceRecognition;
