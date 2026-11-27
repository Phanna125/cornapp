// PyTorch torchvision equivalent preprocessing:
// Resize(256) (shortest edge = 256, high-quality progressive bilinear) -> CenterCrop(224x224) -> ImageNet Normalize
// Mean: [0.485, 0.456, 0.406], Std: [0.229, 0.224, 0.225]

export interface PreprocessedImageResult {
  tensor: Float32Array;        // Shape [1, 3, 224, 224]
  flippedTensor: Float32Array; // Horizontally flipped [1, 3, 224, 224] for 2-view TTA
  previewUrl: string;          // Optimized compressed preview for UI and localStorage
  width: number;
  height: number;
}

const IMAGENET_MEAN = [0.485, 0.456, 0.406];
const IMAGENET_STD = [0.229, 0.224, 0.225];

/**
 * Loads an image from a File, Blob, or URL into an HTMLImageElement
 */
export const loadImage = (source: File | Blob | string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      resolve(img);
    };

    img.onerror = (err) => {
      reject(new Error('Failed to load image for scanning: ' + err));
    };

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const url = URL.createObjectURL(source);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.src = url;
    }
  });
};

/**
 * Progressive step-down resize to match PIL/torchvision bilinear quality
 * without single-step Canvas2D aliasing on high-resolution phone photos.
 */
const resizeToShortestEdge = (
  img: HTMLImageElement,
  shortestTarget: number
): HTMLCanvasElement => {
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;
  const scale = shortestTarget / Math.min(srcW, srcH);
  const dstW = Math.max(shortestTarget, Math.round(srcW * scale));
  const dstH = Math.max(shortestTarget, Math.round(srcH * scale));

  let curCanvas = document.createElement('canvas');
  curCanvas.width = srcW;
  curCanvas.height = srcH;
  const curCtx = curCanvas.getContext('2d');
  if (!curCtx) {
    throw new Error('Canvas 2D context not supported');
  }
  curCtx.fillStyle = '#000000';
  curCtx.fillRect(0, 0, srcW, srcH);
  curCtx.drawImage(img, 0, 0, srcW, srcH);

  // Halve iteratively while source is > 2x target size to preserve fine leaf texture
  let curW = srcW;
  let curH = srcH;
  while (curW * 0.5 > dstW && curH * 0.5 > dstH) {
    const nextW = Math.max(dstW, Math.round(curW * 0.5));
    const nextH = Math.max(dstH, Math.round(curH * 0.5));
    const nextCanvas = document.createElement('canvas');
    nextCanvas.width = nextW;
    nextCanvas.height = nextH;
    const nextCtx = nextCanvas.getContext('2d');
    if (!nextCtx) break;
    nextCtx.imageSmoothingEnabled = true;
    nextCtx.imageSmoothingQuality = 'high';
    nextCtx.drawImage(curCanvas, 0, 0, curW, curH, 0, 0, nextW, nextH);
    curCanvas = nextCanvas;
    curW = nextW;
    curH = nextH;
  }

  if (curW === dstW && curH === dstH) {
    return curCanvas;
  }

  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = dstW;
  finalCanvas.height = dstH;
  const finalCtx = finalCanvas.getContext('2d');
  if (!finalCtx) {
    throw new Error('Canvas 2D context not supported');
  }
  finalCtx.imageSmoothingEnabled = true;
  finalCtx.imageSmoothingQuality = 'high';
  finalCtx.drawImage(curCanvas, 0, 0, curW, curH, 0, 0, dstW, dstH);
  return finalCanvas;
};

/**
 * Executes PyTorch-aligned pipeline:
 * Resize(256) (shortest edge) -> CenterCrop(224x224) -> ImageNet Normalize
 * Output: Planar Float32Array formatted as NCHW [1, 3, 224, 224]
 */
export const preprocessImageForMobileNet = async (
  source: File | Blob | string
): Promise<PreprocessedImageResult> => {
  const img = await loadImage(source);

  const resizeTarget = 256;
  const targetSize = 224;

  // 1. Progressive high-quality resize to shortest edge = 256
  const resizedCanvas = resizeToShortestEdge(img, resizeTarget);

  // 2. Center crop 224x224
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = targetSize;
  cropCanvas.height = targetSize;
  const cropCtx = cropCanvas.getContext('2d', { willReadFrequently: true });
  if (!cropCtx) {
    throw new Error('Canvas 2D context not supported');
  }

  const cropX = Math.floor((resizedCanvas.width - targetSize) / 2);
  const cropY = Math.floor((resizedCanvas.height - targetSize) / 2);
  cropCtx.drawImage(
    resizedCanvas,
    cropX,
    cropY,
    targetSize,
    targetSize,
    0,
    0,
    targetSize,
    targetSize
  );

  const imageData = cropCtx.getImageData(0, 0, targetSize, targetSize);
  const { data } = imageData;

  // 3. Format into planar NCHW Float32Array: [1, 3, 224, 224] + horizontal flip for TTA
  const channelSize = targetSize * targetSize;
  const float32Data = new Float32Array(3 * channelSize);
  const flippedData = new Float32Array(3 * channelSize);

  for (let y = 0; y < targetSize; y++) {
    const rowOffset = y * targetSize;
    for (let x = 0; x < targetSize; x++) {
      const i = rowOffset + x;
      const flippedI = rowOffset + (targetSize - 1 - x);

      const r = data[i * 4] / 255.0;
      const g = data[i * 4 + 1] / 255.0;
      const b = data[i * 4 + 2] / 255.0;

      const normR = (r - IMAGENET_MEAN[0]) / IMAGENET_STD[0];
      const normG = (g - IMAGENET_MEAN[1]) / IMAGENET_STD[1];
      const normB = (b - IMAGENET_MEAN[2]) / IMAGENET_STD[2];

      float32Data[i] = normR;
      float32Data[channelSize + i] = normG;
      float32Data[channelSize * 2 + i] = normB;

      flippedData[flippedI] = normR;
      flippedData[channelSize + flippedI] = normG;
      flippedData[channelSize * 2 + flippedI] = normB;
    }
  }

  // 4. Generate lightweight preview for UI display & localStorage
  const previewCanvas = document.createElement('canvas');
  const maxDim = 480;
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;
  const previewScale = Math.min(1, maxDim / Math.max(srcW, srcH));
  previewCanvas.width = Math.round(srcW * previewScale);
  previewCanvas.height = Math.round(srcH * previewScale);
  const previewCtx = previewCanvas.getContext('2d');
  if (previewCtx) {
    previewCtx.imageSmoothingEnabled = true;
    previewCtx.imageSmoothingQuality = 'high';
    previewCtx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);
  }
  const previewUrl = previewCanvas.toDataURL('image/jpeg', 0.85);

  return {
    tensor: float32Data,
    flippedTensor: flippedData,
    previewUrl,
    width: srcW,
    height: srcH,
  };
};

/**
 * Numerically stable Softmax calculation
 */
export const softmax = (logits: number[] | Float32Array): number[] => {
  const maxLogit = Math.max(...Array.from(logits));
  const exponentials = Array.from(logits).map((x) => Math.exp(x - maxLogit));
  const sumExponentials = exponentials.reduce((acc, val) => acc + val, 0);
  return exponentials.map((exp) => exp / sumExponentials);
};
