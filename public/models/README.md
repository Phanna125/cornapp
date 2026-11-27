# How to add your MobileNetV3-Large ONNX model

1. Place your trained single-file ONNX model at:
   `public/models/mobilenetv3_corn_single.onnx` (or `public/models/mobilenetv3_corn.onnx`)

2. Expected Model Specifications (matching `mobileVnet (1).ipynb`):
   - Input Name: `'input'` (or default primary input)
   - Input Tensor Shape: `[1, 3, 224, 224]` (Float32, `Resize((256, 256)) -> CenterCrop((224, 224))`, ImageNet normalized)
   - Output Tensor Shape: `[1, 5]` (Raw logits for the 5 classes)
   - Class Mapping (alphabetical `ImageFolder` order):
     - Index 0: `Common Rust`
     - Index 1: `Corn Leaf Blight`
     - Index 2: `Gray Leaf Spot`
     - Index 3: `Healthy`
     - Index 4: `Insects damage`

3. Model Caching & Fallback:
   - When present, the app loads `/models/mobilenetv3_corn.onnx` via `onnxruntime-web` (WASM).
   - If absent, the built-in offline heuristic engine handles inference until the model file is added.
