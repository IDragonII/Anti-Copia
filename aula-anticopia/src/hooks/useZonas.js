import { useState, useCallback } from 'react';

const ZONAS_PREDEFINIDAS = [
  {
    id: 1,
    nombre: 'Almacén Principal',
    tipo: 'general',
    capacidad: 20,
    coordenadas: { x: 0, y: 0, radio: 5 },
  },
  {
    id: 2,
    nombre: 'Zona de Carga',
    tipo: 'transito',
    capacidad: 10,
    coordenadas: { x: 8, y: 0, radio: 3 },
  },
  {
    id: 3,
    nombre: 'Área Restringida',
    tipo: 'restringida',
    capacidad: 5,
    coordenadas: { x: 0, y: 8, radio: 2 },
  },
  {
    id: 4,
    nombre: 'Zona de Empaque',
    tipo: 'general',
    capacidad: 15,
    coordenadas: { x: -6, y: 0, radio: 4 },
  },
];

function useZonas() {
  const [zonas, setZonas] = useState(() => {
    const guardadas = localStorage.getItem('zonasAlmacen');
    return guardadas ? JSON.parse(guardadas) : ZONAS_PREDEFINIDAS;
  });

  const [zonaActual, setZonaActual] = useState(null);

  const determinarZona = useCallback((posicion) => {
    for (const zona of zonas) {
      const dx = posicion.x - zona.coordenadas.x;
      const dy = posicion.y - zona.coordenadas.y;
      const distancia = Math.sqrt(dx * dx + dy * dy);

      if (distancia <= zona.coordenadas.radio) {
        setZonaActual(zona);
        return zona;
      }
    }
    setZonaActual(null);
    return null;
  }, [zonas]);

  const agregarZona = useCallback((nuevaZona) => {
    const zonaConId = {
      ...nuevaZona,
      id: Date.now(),
    };
    setZonas((prev) => {
      const actualizadas = [...prev, zonaConId];
      localStorage.setItem('zonasAlmacen', JSON.stringify(actualizadas));
      return actualizadas;
    });
  }, []);

  const eliminarZona = useCallback((zonaId) => {
    setZonas((prev) => {
      const filtradas = prev.filter((z) => z.id !== zonaId);
      localStorage.setItem('zonasAlmacen', JSON.stringify(filtradas));
      return filtradas;
    });
  }, []);

  const actualizarZona = useCallback((zonaId, cambios) => {
    setZonas((prev) => {
      const actualizadas = prev.map((z) =>
        z.id === zonaId ? { ...z, ...cambios } : z
      );
      localStorage.setItem('zonasAlmacen', JSON.stringify(actualizadas));
      return actualizadas;
    });
  }, []);

  const resetZonas = useCallback(() => {
    setZonas(ZONAS_PREDEFINIDAS);
    localStorage.setItem('zonasAlmacen', JSON.stringify(ZONAS_PREDEFINIDAS));
  }, []);

  return {
    zonas,
    zonaActual,
    determinarZona,
    agregarZona,
    eliminarZona,
    actualizarZona,
    resetZonas,
  };
}

export default useZonas;
