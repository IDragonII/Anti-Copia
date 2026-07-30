import { useState, useCallback, useRef } from 'react';

function useTraceability() {
  const [eventos, setEventos] = useState(() => {
    const guardados = localStorage.getItem('eventosTrazabilidad');
    return guardados ? JSON.parse(guardados) : [];
  });

  const [estadisticas, setEstadisticas] = useState({
    totalEventos: 0,
    porTrabajador: {},
    porObjeto: {},
  });

  const proximidadesRef = useRef(new Map());

  const calcularProximidad = useCallback((trabajador, objeto) => {
    const trabajadorCentro = {
      x: trabajador.posicion.x,
      y: trabajador.posicion.y,
    };

    const objetoCentro = {
      x: (objeto.box.x1 + objeto.box.x2) / 2,
      y: (objeto.box.y1 + objeto.box.y2) / 2,
    };

    const escalaPixelAMetro = 0.005;
    const dx = (trabajadorCentro.x - objetoCentro.x) * escalaPixelAMetro;
    const dy = (trabajadorCentro.y - objetoCentro.y) * escalaPixelAMetro;
    const distancia = Math.sqrt(dx * dx + dy * dy);

    return {
      distancia,
      esProximo: distancia < 1.5,
      tipoInteraccion: distancia < 0.5 ? 'manipulacion' : 'proximidad',
    };
  }, []);

  const registrarEvento = useCallback((tipo, trabajador, objeto) => {
    const evento = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      tipo,
      trabajador: {
        id: trabajador.id,
        nombre: trabajador.nombre,
        departamento: trabajador.departamento,
        turno: trabajador.turno,
      },
      objeto: objeto
        ? {
            clase: objeto.class,
            score: objeto.score,
          }
        : null,
      nivelAlerta: tipo === 'manipulacion' ? 'alta' : 'baja',
    };

    setEventos((prev) => {
      const actualizados = [evento, ...prev].slice(0, 500);
      localStorage.setItem('eventosTrazabilidad', JSON.stringify(actualizados));
      return actualizados;
    });

    setEstadisticas((prev) => {
      const nuevas = { ...prev };
      nuevas.totalEventos++;

      if (trabajador.nombre) {
        nuevas.porTrabajador = {
          ...nuevas.porTrabajador,
          [trabajador.nombre]: (nuevas.porTrabajador[trabajador.nombre] || 0) + 1,
        };
      }

      if (objeto?.class) {
        nuevas.porObjeto = {
          ...nuevas.porObjeto,
          [objeto.class]: (nuevas.porObjeto[objeto.class] || 0) + 1,
        };
      }

      return nuevas;
    });

    return evento;
  }, []);

  const evaluarProximidades = useCallback((trabajadores, objetos) => {
    const ahora = Date.now();
    const nuevasInteracciones = [];

    trabajadores.forEach((trabajador) => {
      if (!trabajador.registrado) return;

      objetos.forEach((objeto) => {
        const clave = `${trabajador.id}-${objeto.class}`;
        const proximidad = calcularProximidad(trabajador, objeto);

        const anterior = proximidadesRef.current.get(clave);

        if (proximidad.esProximo) {
          if (!anterior) {
            proximidadesRef.current.set(clave, {
              inicio: ahora,
              tipo: proximidad.tipoInteraccion,
            });

            const evento = registrarEvento(
              'inicio_proximidad',
              trabajador,
              objeto
            );
            nuevasInteracciones.push(evento);
          } else if (ahora - anterior.inicio > 3000) {
            if (anterior.tipo !== proximidad.tipoInteraccion) {
              proximidadesRef.current.set(clave, {
                inicio: ahora,
                tipo: proximidad.tipoInteraccion,
              });

              const evento = registrarEvento(
                proximidad.tipoInteraccion,
                trabajador,
                objeto
              );
              nuevasInteracciones.push(evento);
            }
          }
        } else if (anterior) {
          const duracion = ahora - anterior.inicio;
          proximidadesRef.current.delete(clave);

          if (duracion > 1000) {
            const evento = registrarEvento(
              'fin_proximidad',
              trabajador,
              objeto
            );
            nuevasInteracciones.push(evento);
          }
        }
      });
    });

    return nuevasInteracciones;
  }, [calcularProximidad, registrarEvento]);

  const limpiarEventos = useCallback(() => {
    setEventos([]);
    localStorage.removeItem('eventosTrazabilidad');
    setEstadisticas({
      totalEventos: 0,
      porTrabajador: {},
      porObjeto: {},
    });
  }, []);

  const obtenerEventosPorTrabajador = useCallback((nombreTrabajador) => {
    return eventos.filter((e) => e.trabajador?.nombre === nombreTrabajador);
  }, [eventos]);

  return {
    eventos,
    estadisticas,
    evaluarProximidades,
    registrarEvento,
    limpiarEventos,
    obtenerEventosPorTrabajador,
  };
}

export default useTraceability;
