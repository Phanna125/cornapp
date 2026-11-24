// PyTorch torchvision equivalent preprocessing:
// Resize(256) -> CenterCrop(224x224) -> ImageNet Normalize:
// Mean: [0.485, 0.456, 0.406], Std: [0.229, 0.224, 0.225]

export interface PreprocessedImageResult {
  tensor: Float32Array; // Shape [1, 3, 224, 224] (flattened 150528 floats)
  previewUrl: string;   // Optimized compressed preview for UI and localStorage
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
 * Executes the exact PyTorch pipeline:
 * Resize(256x256) -> CenterCrop(224x224) -> ImageNet Normalize
 * Output: Planar Float32Array formatted as NCHW [1, 3, 224, 224]
 */
export const preprocessImageForMobileNet = async (
  source: File | Blob | string
): Promise<PreprocessedImageResult> => {
  const img = await loadImage(source);

  // 1. Invisible Offscreen Canvas for Center Crop & Preprocessing
  const targetSize = 224;
  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Canvas 2D context not supported');
  }

  // Calculate PyTorch style Resize(256) then CenterCrop(224)
  // Determine scale to resize shortest edge to 256
  const scale = 256 / Math.min(img.width, img.height);
  const resizedWidth = img.width * scale;
  const resizedHeight = img.height * scale;

  // Center crop 224x224 coordinates relative to resized image
  const cropX = (resizedWidth - targetSize) / 2;
  const cropY = (resizedHeight - targetSize) / 2;

  // Draw directly onto 224x224 canvas
  ctx.drawImage(
    img,
    cropX / scale,
    cropY / scale,
    targetSize / scale,
    targetSize / scale,
    0,
    0,
    targetSize,
    targetSize
  );

  const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
  const { data } = imageData; // RGBA uint8 array (length: 224 * 224 * 4)

  // 2. Format into planar NCHW Float32Array: [1, 3, 224, 224]
  const channelSize = targetSize * targetSize;
  const float32Data = new Float32Array(3 * channelSize);

  for (let i = 0; i < channelSize; i++) {
    const r = data[i * 4] / 255.0;
    const g = data[i * 4 + 1] / 255.0;
    const b = data[i * 4 + 2] / 255.0;

    // ImageNet normalization: (x - mean) / std
    float32Data[i] = (r - IMAGENET_MEAN[0]) / IMAGENET_STD[0];                 // R channel
    float32Data[channelSize + i] = (g - IMAGENET_MEAN[1]) / IMAGENET_STD[1];   // G channel
    float32Data[channelSize * 2 + i] = (b - IMAGENET_MEAN[2]) / IMAGENET_STD[2]; // B channel
  }

  // 3. Generate high quality lightweight preview for UI display & localStorage
  const previewCanvas = document.createElement('canvas');
  const maxDim = 480;
  const previewScale = Math.min(1, maxDim / Math.max(img.width, img.height));
  previewCanvas.width = Math.round(img.width * previewScale);
  previewCanvas.height = Math.round(img.height * previewScale);
  const previewCtx = previewCanvas.getContext('2d');
  if (previewCtx) {
    previewCtx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);
  }
  const previewUrl = previewCanvas.toDataURL('image/jpeg', 0.85);

  return {
    tensor: float32Data,
    previewUrl,
    width: img.width,
    height: img.height,
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
