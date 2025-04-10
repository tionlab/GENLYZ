import os
import shutil
import random

fake_dir = "./Fake"
real_dir = "./Real"
image_extensions = ['.png', '.jpg', '.jpeg']
fake_count = 0
real_count = 0

try:
    for file in os.listdir(fake_dir):
        if any(file.lower().endswith(ext) for ext in image_extensions):
            fake_count += 1
    print(f"Fake : {fake_count}")
except FileNotFoundError:
    print(f"Directory not found: {fake_dir}")

try:
    for file in os.listdir(real_dir):
        if any(file.lower().endswith(ext) for ext in image_extensions):
            real_count += 1
    print(f"Real : {real_count}")
except FileNotFoundError:
    print(f"Directory not found: {real_dir}")

total_count = fake_count + real_count
print(f"Total : {total_count}")
print("\n- Starting dataset split (80% train, 20% test)")

train_fake_dir = "./data/Train/fake"
train_real_dir = "./data/Train/real"
test_fake_dir = "./data/Test/fake"
test_real_dir = "./data/Test/real"
os.makedirs(train_fake_dir, exist_ok=True)
os.makedirs(train_real_dir, exist_ok=True)
os.makedirs(test_fake_dir, exist_ok=True)
os.makedirs(test_real_dir, exist_ok=True)

random.seed(20)

try:
    fake_files = [f for f in os.listdir(fake_dir) if any(f.lower().endswith(ext) for ext in image_extensions)]
    random.shuffle(fake_files)
    split_point = int(len(fake_files) * 0.8)
    fake_train_files = fake_files[:split_point]
    fake_test_files = fake_files[split_point:]
    for file in fake_train_files:
        src_path = os.path.join(fake_dir, file)
        dst_path = os.path.join(train_fake_dir, file)
        shutil.move(src_path, dst_path)
    for file in fake_test_files:
        src_path = os.path.join(fake_dir, file)
        dst_path = os.path.join(test_fake_dir, file)
        shutil.move(src_path, dst_path)
    print(f"Fake split completed: {len(fake_train_files)} for training, {len(fake_test_files)} for testing")
except FileNotFoundError:
    print(f"Directory not found: {fake_dir}")

try:
    real_files = [f for f in os.listdir(real_dir) if any(f.lower().endswith(ext) for ext in image_extensions)]
    random.shuffle(real_files)
    split_point = int(len(real_files) * 0.8)
    real_train_files = real_files[:split_point]
    real_test_files = real_files[split_point:]
    for file in real_train_files:
        src_path = os.path.join(real_dir, file)
        dst_path = os.path.join(train_real_dir, file)
        shutil.move(src_path, dst_path)
    for file in real_test_files:
        src_path = os.path.join(real_dir, file)
        dst_path = os.path.join(test_real_dir, file)
        shutil.move(src_path, dst_path)
    print(f"Real split completed: {len(real_train_files)} for training, {len(real_test_files)} for testing")
except FileNotFoundError:
    print(f"Directory not found: {real_dir}")

total_train = len(fake_train_files) + len(real_train_files)
total_test = len(fake_test_files) + len(real_test_files)
print(f"\nResult summary:")
print(f"- Training data: {total_train} ({len(fake_train_files)} fake, {len(real_train_files)} real)")
print(f"- Testing data: {total_test} ({len(fake_test_files)} fake, {len(real_test_files)} real)")
print(f"- Total data: {total_train + total_test}")
