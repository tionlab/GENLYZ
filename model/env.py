import torch
import psutil
import cpuinfo

if torch.cuda.is_available():
    device = torch.device("cuda")
    print("CUDA is available, using GPU.")
else:
    device = torch.device("cpu")
    print("CUDA is not available, using CPU.")

def print_info():
    cpu_info = cpuinfo.get_cpu_info()
    
    if torch.cuda.is_available():
        gpu_info =  torch.cuda.get_device_name(0)
    else:
        gpu_info =  "N/A"

    mem = psutil.virtual_memory()
    total = mem.total / (1024 * 1024 * 1024)
    memory_info = f"{total:.2f} GB"

    print("-" * 30)
    print(f"CPU: {cpu_info['brand_raw']}")
    print(f"GPU: {gpu_info}")
    print(f"Memory: {memory_info}")
    print("-" * 30)

print_info()
