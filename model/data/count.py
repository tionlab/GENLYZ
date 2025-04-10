import os

def count_images(directory):
    """Count image files in the specified directory."""
    image_extensions = ['.jpg', '.jpeg', '.png']
    count = 0
    
    if not os.path.exists(directory):
        print(f"Directory not found: {directory}")
        return 0
        
    for file in os.listdir(directory):
        file_path = os.path.join(directory, file)
        if os.path.isfile(file_path):
            ext = os.path.splitext(file)[1].lower()
            if ext in image_extensions:
                count += 1
    
    return count

directories = [
    "./Train/real",
    "./Train/fake",
    "./Test/real",
    "./Test/fake"
]

print("Image Count")
print("-----------------")

for directory in directories:
    image_count = count_images(directory)
    print(f"Number of images in {directory}: {image_count}")

print("-----------------")
print("Count completed.")


# Image Count
# -----------------
# Number of images in ./Train/real: 55974
# Number of images in ./Train/fake: 55974
# Number of images in ./Test/real: 13991
# Number of images in ./Test/fake: 13991
# -----------------
# Count completed.