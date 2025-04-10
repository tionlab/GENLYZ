import torch
import torch.nn as nn
from torchvision import transforms
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights
from PIL import Image

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model_path = "best_model.pth" 
img_path = "test3.jpg"    

def preprocess_image(img_path):
    image = Image.open(img_path).convert('RGB')
    transform = transforms.Compose([
        transforms.Resize((300, 300)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225])
    ])
    return transform(image).unsqueeze(0)

model = efficientnet_b0(weights=EfficientNet_B0_Weights.DEFAULT)
model.classifier[1] = nn.Linear(model.classifier[1].in_features, 2)
model.load_state_dict(torch.load(model_path, map_location=device, weights_only=True))
model.to(device)
model.eval()

img_tensor = preprocess_image(img_path).to(device)
with torch.no_grad():
    output = model(img_tensor)
    pred_class = output.argmax(dim=1).item()

class_names = ['fake', 'real']
print(f"Predicted class: {class_names[pred_class]}")
