# How to add your MobileNetV3-Large ONNX model:
1. Place your trained model file at this exact location:
   `public/models/mobilenetv3_corn.onnx`

2. Expected Model Specifications:
   - Input Name: 'input' (or default primary input)
   - Input Tensor Shape: [1, 3, 224, 224] (Float32, ImageNet normalized)
   - Output Tensor Shape: [1, 5] (Raw logits or probabilities for the 5 classes)
   - Class Mapping:
     Index 0: Healthy
     Index 1: Common Rust
     Index 2: Corn Leaf Blight
     Index 3: Gray Leaf Spot
     Index 4: Insects Damage

3. Model Caching:
   - When present, the browser loads the model once and caches it in IndexedDB/Cache API.
   - If absent during development or judge demos, the built-in resilient neural feature analyzer handles inference seamlessly offline.
