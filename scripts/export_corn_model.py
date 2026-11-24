#!/usr/bin/env python3
"""
Corn Leaf Doctor - PyTorch to ONNX Exporter
Converts a trained MobileNetV3-Large 5-class checkpoint to mobilenetv3_corn.onnx
"""

import sys
import os

try:
    import torch
    import torchvision.models as models
except ImportError:
    print("PyTorch not installed. Run: pip install torch torchvision onnx")
    sys.exit(0)

def export_model(checkpoint_path=None, output_path="public/models/mobilenetv3_corn.onnx"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    print("Loading MobileNetV3-Large architecture (5 classes)...")

    model = models.mobilenet_v3_large(weights=None)
    num_ftrs = model.classifier[3].in_features
    model.classifier[3] = torch.nn.Linear(num_ftrs, 5)

    if checkpoint_path and os.path.exists(checkpoint_path):
        print(f"Loading weights from {checkpoint_path}...")
        state_dict = torch.load(checkpoint_path, map_location="cpu")
        model.load_state_dict(state_dict)
    else:
        print("Exporting base MobileNetV3-Large structure...")

    model.eval()
    dummy_input = torch.randn(1, 3, 224, 224, dtype=torch.float32)

    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=["input"],
        output_names=["logits"],
        dynamic_axes={"input": {0: "batch_size"}, "logits": {0: "batch_size"}},
    )

    print(f"Successfully exported ONNX model to: {output_path}")

if __name__ == "__main__":
    ckpt = sys.argv[1] if len(sys.argv) > 1 else None
    export_model(ckpt)
