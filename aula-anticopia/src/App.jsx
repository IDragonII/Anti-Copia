import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from './components/Navigation';
import TrabajadoresPage from './pages/TrabajadoresPage';
import MonitoreoPage from './pages/MonitoreoPage';
import TrazabilidadPage from './pages/TrazabilidadPage';
import useObjectDetection from './hooks/useObjectDetection';
import useFaceRecognition from './hooks/useFaceRecognition';
import useVisualOdometry from './hooks/useVisualOdometry';
import useTracking from './hooks/useTracking';
import useTraceability from './hooks/useTraceability';
import useIsMobile from './hooks/useIsMobile';

const FACE_FRAME_SKIP = 4;

function App() {
  const isMobile = useIsMobile(1024);
  const [tabActiva, setTabActiva] = useState('registro');
  const videoRef = useRef(null);

  const { objetos } = useObjectDetection(videoRef);
  const {
    modelosCargados,
    trabajadoresDetectados,
    baseTrabajadores,
    detectarRostros,
    registrarTrabajador,
    eliminarTrabajador,
    capturando,
    progresoCaptura,
    muestrasCapturadas,
  } = useFaceRecognition(videoRef);

  const {
    opencvCargado,
    posicionGlobal,
    velocidad,
    anguloBarrido,
    reiniciarPosicion,
  } = useVisualOdometry(videoRef);

  const {
    trabajadores,
    actualizarTracking,
  } = useTracking(baseTrabajadores);

  const {
    eventos,
    estadisticas,
    evaluarProximidades,
  } = useTraceability();

  useEffect(() => {
    if (!modelosCargados) return;

    let animationFrameId;
    let faceFrameCount = 0;

    async function cicloDeteccion() {
      faceFrameCount++;
      if (faceFrameCount % FACE_FRAME_SKIP !== 0) {
        animationFrameId = requestAnimationFrame(cicloDeteccion);
        return;
      }

      const rostros = await detectarRostros();
      if (rostros && rostros.length > 0) {
        actualizarTracking(rostros, posicionGlobal);
      }
      animationFrameId = requestAnimationFrame(cicloDeteccion);
    }

    cicloDeteccion();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [modelosCargados, detectarRostros, actualizarTracking, posicionGlobal]);

  useEffect(() => {
    if (trabajadores.length > 0 && objetos.length > 0) {
      evaluarProximidades(trabajadores, objetos);
    }
  }, [trabajadores, objetos, evaluarProximidades]);

  const objetosDetectados = objetos;

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const rootStyle = isMobile
    ? { minHeight: '100vh', backgroundColor: '#FFFFFF', color: '#0F172A' }
    : { display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#FFFFFF', color: '#0F172A' };

  return (
    <div style={rootStyle}>
      <Navigation
        tabActiva={tabActiva}
        setTabActiva={setTabActiva}
        sidebar={!isMobile}
      />
      <main style={{
        flex: 1,
        overflow: isMobile ? undefined : 'auto',
      }}>
        <AnimatePresence mode="wait">
          {tabActiva === 'registro' && (
            <motion.div
              key="registro"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <TrabajadoresPage
                videoRef={videoRef}
                registrarTrabajador={registrarTrabajador}
                eliminarTrabajador={eliminarTrabajador}
                baseTrabajadores={baseTrabajadores}
                modelosCargados={modelosCargados}
                capturando={capturando}
                progresoCaptura={progresoCaptura}
                muestrasCapturadas={muestrasCapturadas}
              />
            </motion.div>
          )}

          {tabActiva === 'monitoreo' && (
            <motion.div
              key="monitoreo"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <MonitoreoPage
                videoRef={videoRef}
                modelosCargados={modelosCargados}
                opencvCargado={opencvCargado}
                trabajadoresDetectados={trabajadoresDetectados}
                objetosDetectados={objetosDetectados}
                trabajadores={trabajadores}
                posicionGlobal={posicionGlobal}
                velocidad={velocidad}
                anguloBarrido={anguloBarrido}
                reiniciarPosicion={reiniciarPosicion}
              />
            </motion.div>
          )}

          {tabActiva === 'reporte' && (
            <motion.div
              key="reporte"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <TrazabilidadPage
                trabajadores={trabajadores}
                objetosDetectados={objetosDetectados}
                posicionGlobal={posicionGlobal}
                anguloBarrido={anguloBarrido}
                baseTrabajadores={baseTrabajadores}
                eventos={eventos}
                estadisticas={estadisticas}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
