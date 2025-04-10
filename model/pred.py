import torch
import torch.nn as nn
from torchvision import datasets, transforms
from torch.utils.data import DataLoader
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt
from tqdm import tqdm
import warnings

warnings.filterwarnings("ignore", category=UserWarning, module="PIL.Image")

def resize_large_image(image, max_size=(3000, 3000)): 
    if image.size[0] * image.size[1] > 89478485:
        print(f'Too big image : {image.size}, Resizing...')
        image.thumbnail(max_size)
    return image

def convert_to_rgb(img):
    return img.convert('RGB')

if __name__ == "__main__":
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f'Device: {device}')

    seed = 20
    torch.manual_seed(seed)

    model = efficientnet_b0(weights=EfficientNet_B0_Weights.DEFAULT)
    num_ftrs = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(num_ftrs, 2)

    for param in model.parameters():
        param.requires_grad = False
    for param in model.features[-3:].parameters():
        param.requires_grad = True
    for param in model.classifier.parameters():
        param.requires_grad = True

    model.load_state_dict(torch.load('best_model.pth', map_location=device, weights_only=True))
    model.to(device)
    model.eval()

    test_transform = transforms.Compose([
        transforms.Lambda(resize_large_image),
        transforms.Lambda(convert_to_rgb),
        transforms.Resize((300, 300)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    test_dataset = datasets.ImageFolder(root='./data/Test', transform=test_transform)
    test_loader = DataLoader(
        test_dataset,
        batch_size=320,
        shuffle=False,
        num_workers=8,
        pin_memory=True,
        persistent_workers=True
    )

    all_preds = []
    all_labels = []
    all_images = []

    with torch.no_grad():
        for images, labels in tqdm(test_loader, desc="Testing", ncols=80):
            images = images.to(device)
            labels = labels.to(device)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
            all_images.extend(images.cpu())

    print("=== Classification Report ===")
    print(classification_report(all_labels, all_preds, target_names=test_dataset.classes))

    cm = confusion_matrix(all_labels, all_preds)
    print("=== Confusion Matrix ===")
    print(cm)

    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=test_dataset.classes,
                yticklabels=test_dataset.classes)
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.title('Confusion Matrix')
    plt.tight_layout()
    plt.show()

    wrong_real = []
    wrong_fake = []

    for img, pred, label in zip(all_images, all_preds, all_labels):
        if pred != label:
            if test_dataset.classes[pred] == 'real' and len(wrong_real) < 5:
                wrong_real.append((img, pred, label))
            elif test_dataset.classes[pred] == 'fake' and len(wrong_fake) < 5:
                wrong_fake.append((img, pred, label))
        if len(wrong_real) >= 5 and len(wrong_fake) >= 5:
            break

    wrong_samples = wrong_real + wrong_fake
    plt.figure(figsize=(15, 6))
    for idx, (img, pred, label) in enumerate(wrong_samples):
        img = img.permute(1, 2, 0) * torch.tensor([0.229, 0.224, 0.225]) + torch.tensor([0.485, 0.456, 0.406])
        img = img.clamp(0, 1)
        plt.subplot(2, 5, idx + 1)
        plt.imshow(img)
        plt.title(f'Pred: {test_dataset.classes[pred]}\nLabel: {test_dataset.classes[label]}')
        plt.axis('off')
    plt.tight_layout()
    plt.show()