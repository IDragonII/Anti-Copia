import { useState, useCallback, useRef } from 'react';
import * as faceapi from 'face-api.js';

const UMBRAL_SIMILITUD = 0.6;
const MAX_FRAMES_PERDIDO = 30;
const MAX_HISTORIAL = 100;

function useTracking(baseTrabajadores) {
  const [trabajadores, setTrabajadores] = useState([]);
  const [contadorIds, setContadorIds] = useState(0);

  const trabajadoresRef = useRef([]);
  const contadorRef = useRef(0);
  const historialRef = useRef({});

  const calcularPosicionGlobal = useCallback((rostro, posicionCamara) => {
    const centroFrame = { x: 320, y: 240 };
    const centroRostro = {
      x: rostro.box.x + rostro.box.width / 2,
      y: rostro.box.y + rostro.box.height / 2,
    };

    const offsetXPixels = (centroRostro.x - centroFrame.x) * 0.002;
    const offsetYPixels = (centroRostro.y - centroFrame.y) * 0.002;

    return {
      x: posicionCamara.x + offsetXPixels,
      y: posicionCamara.y + offsetYPixels,
    };
  }, []);

  const calcularSimilitudMultiDescriptor = useCallback((descriptorNuevo, descriptoresGuardados) => {
    if (!descriptoresGuardados || descriptoresGuardados.length === 0) return 0;

    let sumaDistancia = 0;
    for (const descriptorGuardado of descriptoresGuardados) {
      const distancia = faceapi.euclideanDistance(
        new Float32Array(descriptorNuevo),
        new Float32Array(descriptorGuardado)
      );
      sumaDistancia += distancia;
    }

    const distanciaPromedio = sumaDistancia / descriptoresGuardados.length;
    return 1 - distanciaPromedio;
  }, []);

  const buscarMatch = useCallback((rostro) => {
    let mejorMatch = null;
    let mejorSimilitud = 0;

    for (const trabajador of trabajadoresRef.current) {
      if (!trabajador.ultimoDescriptor) continue;

      const similitud = calcularSimilitudMultiDescriptor(
        rostro.descriptor,
        [trabajador.ultimoDescriptor]
      );

      if (similitud > UMBRAL_SIMILITUD && similitud > mejorSimilitud) {
        mejorSimilitud = similitud;
        mejorMatch = trabajador;
      }
    }

    if (mejorMatch) {
      return { id: mejorMatch.id, nombre: mejorMatch.nombre, similitud: mejorSimilitud };
    }

    if (rostro.registrado) {
      for (const registrado of baseTrabajadores) {
        const descriptores = registrado.descriptores || [];
        if (descriptores.length === 0) continue;

        const similitud = calcularSimilitudMultiDescriptor(
          rostro.descriptor,
          descriptores
        );

        if (similitud > UMBRAL_SIMILITUD && similitud > mejorSimilitud) {
          mejorSimilitud = similitud;
          mejorMatch = registrado;
        }
      }

      if (mejorMatch) {
        return { id: null, nombre: mejorMatch.nombre, similitud: mejorSimilitud, nuevo: true };
      }
    }

    return null;
  }, [baseTrabajadores, calcularSimilitudMultiDescriptor]);

  const actualizarTracking = useCallback((rostrosDetectados, posicionCamara) => {
    const trabajadoresActivos = [...trabajadoresRef.current];

    for (const trabajador of trabajadoresActivos) {
      trabajador.framesPerdido = (trabajador.framesPerdido || 0) + 1;
      trabajador.activo = trabajador.framesPerdido < MAX_FRAMES_PERDIDO;
    }

    for (const rostro of rostrosDetectados) {
      const match = buscarMatch(rostro);

      if (match) {
        let trabajador;

        if (match.nuevo) {
          const nuevoId = contadorRef.current;
          contadorRef.current++;
          const registrado = baseTrabajadores.find((r) => r.nombre === match.nombre);
          trabajador = {
            id: nuevoId,
            nombre: match.nombre,
            empleadoId: registrado?.id || null,
            departamento: registrado?.departamento || null,
            turno: registrado?.turno || null,
            registrado: true,
            ultimoDescriptor: rostro.descriptor,
            posicion: calcularPosicionGlobal(rostro, posicionCamara),
            framesPerdido: 0,
            activo: true,
            primeraVez: new Date().toISOString(),
          };
          trabajadoresActivos.push(trabajador);
        } else {
          trabajador = trabajadoresActivos.find((t) => t.id === match.id);
          if (trabajador) {
            trabajador.ultimoDescriptor = rostro.descriptor;
            trabajador.posicion = calcularPosicionGlobal(rostro, posicionCamara);
            trabajador.framesPerdido = 0;
            trabajador.activo = true;
          }
        }

        if (trabajador) {
          if (!historialRef.current[trabajador.id]) {
            historialRef.current[trabajador.id] = [];
          }
          historialRef.current[trabajador.id].push({
            ...trabajador.posicion,
            timestamp: Date.now(),
          });
          if (historialRef.current[trabajador.id].length > MAX_HISTORIAL) {
            historialRef.current[trabajador.id].shift();
          }
        }
      }
    }

    const resultado = trabajadoresActivos
      .filter((t) => t.activo)
      .map((trabajador) => ({
        ...trabajador,
        historial: historialRef.current[trabajador.id] || [],
      }));

    trabajadoresRef.current = trabajadoresActivos;
    setTrabajadores(resultado);
    setContadorIds(contadorRef.current);

    return resultado;
  }, [buscarMatch, calcularPosicionGlobal, baseTrabajadores]);

  const eliminarTrabajador = useCallback((id) => {
    trabajadoresRef.current = trabajadoresRef.current.filter((t) => t.id !== id);
    delete historialRef.current[id];
    setTrabajadores(trabajadoresRef.current.filter((t) => t.activo));
  }, []);

  const reiniciarTracking = useCallback(() => {
    trabajadoresRef.current = [];
    contadorRef.current = 0;
    historialRef.current = {};
    setTrabajadores([]);
    setContadorIds(0);
  }, []);

  return {
    trabajadores,
    totalRastreados: contadorIds,
    actualizarTracking,
    eliminarTrabajador,
    reiniciarTracking,
  };
}

export default useTracking;
