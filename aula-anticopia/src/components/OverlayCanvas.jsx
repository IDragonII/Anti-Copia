import { useRef, useEffect } from 'react';

const COLORES_TRAABAJADORES = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

function OverlayCanvas({ videoRef, rostros, objetos, trabajadores }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !videoRef.current) return;

    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (trabajadores && trabajadores.length > 0) {
      trabajadores.forEach((trabajador) => {
        if (trabajador.historial && trabajador.historial.length > 1) {
          const color = COLORES_TRAABAJADORES[trabajador.id % COLORES_TRAABAJADORES.length];
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.6;

          ctx.beginPath();
          const escala = 100;
          const offsetX = canvas.width / 2;
          const offsetY = canvas.height / 2;

          for (let i = 0; i < trabajador.historial.length; i++) {
            const punto = trabajador.historial[i];
            const px = offsetX + punto.x * escala;
            const py = offsetY + punto.y * escala;

            if (i === 0) {
              ctx.moveTo(px, py);
            } else {
              ctx.lineTo(px, py);
            }
          }
          ctx.stroke();

          ctx.globalAlpha = 1.0;
        }
      });
    }

    rostros.forEach((rostro) => {
      const { x, y, width, height } = rostro.box;

      const trabajador = trabajadores?.find((t) => t.nombre === rostro.nombre);
      const color = trabajador
        ? COLORES_TRAABAJADORES[trabajador.id % COLORES_TRAABAJADORES.length]
        : rostro.registrado ? '#10B981' : '#F59E0B';

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      ctx.fillStyle = color;
      ctx.fillRect(x, y - 30, width, 30);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Fira Sans, system-ui';
      ctx.textAlign = 'center';

      const etiqueta = trabajador
        ? `${trabajador.nombre}`
        : rostro.nombre;
      ctx.fillText(etiqueta, x + width / 2, y - 10);
    });

    objetos.forEach((obj) => {
      const { x1, y1, x2, y2 } = obj.box;
      const width = x2 - x1;
      const height = y2 - y1;

      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x1, y1, width, height);
      ctx.setLineDash([]);

      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(x1, y1 - 30, width, 30);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px Fira Sans, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${obj.class}`, x1 + width / 2, y1 - 10);
    });
  }, [videoRef, rostros, objetos, trabajadores]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
    />
  );
}

export default OverlayCanvas;
