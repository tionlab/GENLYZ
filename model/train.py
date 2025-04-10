import torch
import torch.nn as nn
import torch.optim as optim
import torchvision.transforms as transforms
import torchvision.datasets as datasets
from torch.utils.data import DataLoader
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights
from tqdm import tqdm
import time
from datetime import datetime, timedelta
from torch.amp import autocast, GradScaler

# * Optional
import warnings
warnings.filterwarnings("ignore", category=UserWarning, module="PIL.Image")  # UserWarning: Palette images with Transparency expressed in bytes should be converted to RGBA images

def resize_large_image(image, max_size=(3000, 3000)): 
    if image.size[0] * image.size[1] > 89478485:  # If image size exceeds 89MP
        print(f'Too big image : {image.size}, Resizing...')
        image.thumbnail(max_size)
    return image

def convert_to_rgb(img):
    return img.convert('RGB')

if __name__ == "__main__":
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f'Device: {device}')
    scaler = GradScaler(device='cuda')
    seed = 20

    # * Fix random seed for reproducibility
    torch.manual_seed(seed)
    torch.cuda.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.benchmark = True
    torch.backends.cudnn.deterministic = False 
    
    # * Data preprocessing and augmentation
    train_transform = transforms.Compose([
        transforms.Lambda(resize_large_image),  # DecompressionBombWarning: Image size (143040000 pixels) exceeds limit of 89478485 pixels, could be decompression bomb DOS attack.
        transforms.Lambda(convert_to_rgb), # UserWarning: Palette images with Transparency expressed in bytes should be converted to RGBA images
        transforms.Resize((300, 300)),
        transforms.RandomHorizontalFlip(), 
        transforms.RandomRotation(10),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    train_dataset = datasets.ImageFolder(root='./data/Train', transform=train_transform)
    train_loader = DataLoader(
        train_dataset,
        batch_size=320, 
        shuffle=True,
        num_workers=8,
        pin_memory=True,
        persistent_workers=True
    )

    print(f'Training samples: {len(train_dataset)}')

    # * Model definition
    model = efficientnet_b0(weights=EfficientNet_B0_Weights.DEFAULT)
    num_ftrs = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(num_ftrs, 2)

    # * Transfer learning
    # 1. Freeze all layers (keep existing weights)
    for param in model.parameters():
        param.requires_grad = False
    # 2. Only the last three feature blocks are set to be trainable
    for param in model.features[-3:].parameters():
        param.requires_grad = True
    # 3. Set all FC layers (classifier) to be trainable
    for param in model.classifier.parameters():
        param.requires_grad = True

    model = model.to(device)

    # * Loss function, optimizer, and learning rate scheduler
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=0.001, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=5, gamma=0.1)

    # ! Training
    num_epochs = 100
    patience = 3
    best_val_acc = 0
    counter = 0
    
    start_time = time.time()

    for epoch in range(num_epochs):
        model.train()
        running_loss = 0.0
        correct_train = 0
        total_train = 0
        
        progress_bar = tqdm(train_loader, desc=f'Epoch {epoch+1}/{num_epochs}')
                
        for images, labels in progress_bar:
            images = images.to(device, non_blocking=True)
            labels = labels.to(device, non_blocking=True)
            optimizer.zero_grad()

            with autocast(device_type='cuda'):
                outputs = model(images)
                loss = criterion(outputs, labels)

            scaler.scale(loss).backward() 
            scaler.step(optimizer)
            scaler.update()

            running_loss += loss.item()
            _, predicted = torch.max(outputs, 1)
            correct_train += (predicted == labels).sum().item()
            total_train += labels.size(0)

            progress_bar.set_postfix(loss=loss.item(), acc=100. * correct_train/total_train)

        train_accuracy = 100 * correct_train / total_train
        avg_loss = running_loss / len(train_loader)
        
        elapsed_time = time.time() - start_time
        est_total_time = elapsed_time / (epoch + 1) * num_epochs
        est_remaining_time = est_total_time - elapsed_time
        est_end_time = datetime.now() + timedelta(seconds=est_remaining_time)
        
        print(f'Epoch {epoch+1}/{num_epochs} | Loss: {avg_loss:.4f} | Acc: {train_accuracy:.2f}% | LR: {scheduler.get_last_lr()[0]} | ' 
              f'Progress: {(epoch+1)/num_epochs*100:.1f}% | ETA: {est_end_time.strftime("%H:%M:%S")} ({timedelta(seconds=int(est_remaining_time))})')
        
        scheduler.step()
        
        if train_accuracy > best_val_acc:
            best_val_acc = train_accuracy
            counter = 0
            torch.save(model.state_dict(), 'best_model.pth')
            print('>> Model saved!')
        else:
            counter += 1
            if counter >= patience:
                print('>> Early stopping!')
                break
