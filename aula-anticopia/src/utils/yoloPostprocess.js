// Nombres de las 80 clases de COCO, en el orden que usa YOLOv8
export const COCO_CLASSES = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck',
  'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench',
  'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra',
  'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
  'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove',
  'skateboard', 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup',
  'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
  'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
  'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse',
  'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
  'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear',
  'hair drier', 'toothbrush',
];

// Calcula el Intersection over Union entre dos cajas [x1,y1,x2,y2]
function iou(boxA, boxB) {
  const xA = Math.max(boxA[0], boxB[0]);
  const yA = Math.max(boxA[1], boxB[1]);
  const xB = Math.min(boxA[2], boxB[2]);
  const yB = Math.min(boxA[3], boxB[3]);

  const interWidth = Math.max(0, xB - xA);
  const interHeight = Math.max(0, yB - yA);
  const interArea = interWidth * interHeight;

  const areaA = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1]);
  const areaB = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1]);

  return interArea / (areaA + areaB - interArea);
}

// Non-Maximum Suppression: elimina cajas duplicadas del mismo objeto
function nms(detecciones, iouThreshold = 0.45) {
  detecciones.sort((a, b) => b.score - a.score);
  const seleccionadas = [];

  while (detecciones.length > 0) {
    const actual = detecciones.shift();
    seleccionadas.push(actual);

    detecciones = detecciones.filter((det) => {
      if (det.class !== actual.class) return true; // NMS por clase
      return iou(actual.box, det.box) < iouThreshold;
    });
  }

  return seleccionadas;
}

// Convierte la salida cruda del modelo (1, 84, 8400) en detecciones limpias
export function postprocesarYolo(outputData, dims, scoreThreshold = 0.3) {
  const [, numAtributos, numCajas] = dims; // [1, 84, 8400]
  const numClases = numAtributos - 4;
  const detecciones = [];

  for (let i = 0; i < numCajas; i++) {
    // Los datos vienen "transpuestos": cada atributo es una fila de 8400 valores
    const cx = outputData[0 * numCajas + i];
    const cy = outputData[1 * numCajas + i];
    const w = outputData[2 * numCajas + i];
    const h = outputData[3 * numCajas + i];

    let mejorClase = -1;
    let mejorScore = 0;

    for (let c = 0; c < numClases; c++) {
      const score = outputData[(4 + c) * numCajas + i];
      if (score > mejorScore) {
        mejorScore = score;
        mejorClase = c;
      }
    }

    if (mejorScore >= scoreThreshold) {
      detecciones.push({
        box: [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], // [x1,y1,x2,y2]
        score: mejorScore,
        class: COCO_CLASSES[mejorClase],
      });
    }
  }

  return nms(detecciones);
}