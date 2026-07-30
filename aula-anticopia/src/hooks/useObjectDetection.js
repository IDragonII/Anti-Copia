import { useEffect, useRef, useState } from 'react';
import * as ort from 'onnxruntime-web';
import { postprocesarYolo } from '../utils/yoloPostprocess';

const INPUT_SIZE = 640;
const FRAME_SKIP = 10;
const MIN_INTERVAL_MS = 300;

function useObjectDetection(videoRef) {
  const [objetos, setObjetos] = useState([]);
  const sesionRef = useRef(null);
  const canvasAuxRef = useRef(document.createElement('canvas'));
  const frameCountRef = useRef(0);
  const lastRunRef = useRef(0);

  useEffect(() => {
    let animationFrameId;
    let activo = true;

    async function cargarModelo() {
      try {
        sesionRef.current = await ort.InferenceSession.create(
          '/models/yolov8n.onnx',
          {
            executionProviders: ['webgpu', 'webgl', 'wasm'],
            graphOptimizationLevel: 'all',
          }
        );
        console.log('YOLO cargado, inputs:', sesionRef.current.inputNames, 'outputs:', sesionRef.current.outputNames);
        detectarFrame();
      } catch (e) {
        console.error('Error cargando YOLO:', e);
      }
    }

    function preprocesarFrame(video) {
      const canvas = canvasAuxRef.current;
      canvas.width = INPUT_SIZE;
      canvas.height = INPUT_SIZE;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, INPUT_SIZE, INPUT_SIZE);

      const imageData = ctx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);
      const { data } = imageData;

      const float32Data = new Float32Array(3 * INPUT_SIZE * INPUT_SIZE);
      const pixelCount = INPUT_SIZE * INPUT_SIZE;

      for (let i = 0; i < pixelCount; i++) {
        const idx = i * 4;
        float32Data[i] = data[idx] / 255;
        float32Data[pixelCount + i] = data[idx + 1] / 255;
        float32Data[2 * pixelCount + i] = data[idx + 2] / 255;
      }

      return new ort.Tensor('float32', float32Data, [1, 3, INPUT_SIZE, INPUT_SIZE]);
    }

    function detectarFrame() {
      if (!activo) return;

      frameCountRef.current++;

      const ahora = Date.now();
      if (frameCountRef.current % FRAME_SKIP !== 0 || ahora - lastRunRef.current < MIN_INTERVAL_MS) {
        animationFrameId = requestAnimationFrame(detectarFrame);
        return;
      }

      lastRunRef.current = ahora;

      if (
        videoRef.current &&
        videoRef.current.readyState === 4 &&
        sesionRef.current
      ) {
        const inputTensor = preprocesarFrame(videoRef.current);
        sesionRef.current.run({ images: inputTensor }).then((resultados) => {
          if (!activo) return;
          const outputName = sesionRef.current.outputNames[0];
          const output = resultados[outputName];
          const detecciones = postprocesarYolo(output.data, output.dims);
          if (detecciones.length > 0) {
            console.log('Objetos detectados:', detecciones.length, detecciones.map((d) => `${d.class} ${(d.score * 100).toFixed(0)}%`));
          }
          setObjetos(detecciones);
        }).catch((e) => console.error('YOLO inference error:', e));
      }

      animationFrameId = requestAnimationFrame(detectarFrame);
    }

    cargarModelo();

    return () => {
      activo = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [videoRef]);

  return { objetos };
}

export default useObjectDetection;
