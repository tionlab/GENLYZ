from PIL import Image
import os
from tqdm import tqdm
from multiprocessing import Pool, cpu_count

Image.MAX_IMAGE_PIXELS = None

MAX_PIXELS = 89478485
MAX_SIZE = 3000

data_paths = ["./Train", "./Test"]

def process_image(file_path):
    try:
        with Image.open(file_path) as img:
            img.load()
            width, height = img.size

            if width * height > MAX_PIXELS:
                print(f"\nLarge image found (resizing): {file_path} ({width}x{height})")

                if width > height:
                    new_width = MAX_SIZE
                    new_height = int((MAX_SIZE / width) * height)
                else:
                    new_height = MAX_SIZE
                    new_width = int((MAX_SIZE / height) * width)

                img = img.convert("RGB")
                img = img.resize((new_width, new_height), Image.LANCZOS)
                img.save(file_path)
                print(f">> Resize completed: {new_width}x{new_height}")

    except (OSError, IOError):
        print(f"\nCorrupted image found: {file_path}")
        try:
            os.remove(file_path)
            print(f">> Deletion completed: {file_path}")
        except Exception as e:
            print(f">> Failed to delete: {file_path}, Reason: {e}")

if __name__ == "__main__":
    for data_path in data_paths:
        print(f"\nChecking: {data_path}")

        all_images = []
        for folder in os.listdir(data_path):
            folder_path = os.path.join(data_path, folder)
            if not os.path.isdir(folder_path):
                continue
            all_images.extend([
                os.path.join(folder_path, f)
                for f in os.listdir(folder_path)
                if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff'))
            ])

        print(f"Total files to process: {len(all_images)}")

        with Pool(processes=cpu_count()) as pool:
            list(tqdm(pool.imap_unordered(process_image, all_images), total=len(all_images), desc=f"Processing ({data_path})", unit="img"))

    print("\n✅ Image check completed!")
