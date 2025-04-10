from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights
from torchvision import transforms
from PIL import Image
import io
import warnings

warnings.filterwarnings("ignore", category=UserWarning, module="PIL.Image")

app = FastAPI(title="Image Classification API", 
            description="Fake/Real 판별 모델 API", 
            version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"]
)

def resize_large_image(image, max_size=(3000, 3000)):
    if image.size[0] * image.size[1] > 89478485:
        image.thumbnail(max_size)
    return image

def convert_to_rgb(img):
    return img.convert('RGB')

transform = transforms.Compose([
    transforms.Lambda(resize_large_image),
    transforms.Lambda(convert_to_rgb),
    transforms.Resize((300, 300)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = efficientnet_b0(weights=EfficientNet_B0_Weights.DEFAULT)
num_ftrs = model.classifier[1].in_features
model.classifier[1] = nn.Linear(num_ftrs, 2)
model.load_state_dict(torch.load("model.pth", map_location=device, weights_only=True))
model.to(device)
model.eval()

@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    contents = await file.read()
    if len(contents) > 6 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File size exceeds limit.")

    image = Image.open(io.BytesIO(contents))
    image_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(image_tensor)
        probs = F.softmax(outputs, dim=1).squeeze().cpu().numpy()

    pred_idx = int(probs.argmax())
    confidence_val = round(float(probs[pred_idx]) * 100, 3)
    is_ai_generated = True if pred_idx == 0 else False

    return JSONResponse(content={
        "isAiGenerated": is_ai_generated,
        "confidence": confidence_val
    })
