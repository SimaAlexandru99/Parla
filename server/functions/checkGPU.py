import torch
import subprocess
import os

def check_cuda_installation():
    try:
        result = subprocess.run(["nvcc", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print("nvcc (CUDA Compiler) is installed:")
            print(result.stdout)
        else:
            print("nvcc (CUDA Compiler) is not found.")
    except FileNotFoundError:
        print("nvcc (CUDA Compiler) is not installed or not in PATH.")

def check_nvidia_smi():
    try:
        result = subprocess.run(["nvidia-smi"], capture_output=True, text=True)
        if result.returncode == 0:
            print("nvidia-smi (NVIDIA System Management Interface) output:")
            print(result.stdout)
        else:
            print("nvidia-smi command failed.")
    except FileNotFoundError:
        print("nvidia-smi is not installed or not in PATH.")

def check_environment_variables():
    cuda_path = os.getenv("CUDA_PATH")
    if cuda_path:
        print(f"CUDA_PATH environment variable: {cuda_path}")
    else:
        print("CUDA_PATH environment variable is not set.")

    ld_library_path = os.getenv("LD_LIBRARY_PATH")
    if ld_library_path:
        print(f"LD_LIBRARY_PATH environment variable: {ld_library_path}")
    else:
        print("LD_LIBRARY_PATH environment variable is not set.")

def check_torch_cuda():
    print("Torch CUDA available: ", torch.cuda.is_available())
    print("Torch CUDA version: ", torch.version.cuda)
    print("Torch version: ", torch.__version__)

def check_cuda():
    if torch.cuda.is_available():
        print("CUDA is available.")
        print(f"CUDA version: {torch.version.cuda}")
        print(f"Number of GPUs: {torch.cuda.device_count()}")
        gpu_info = get_gpu_info()
        for i, info in enumerate(gpu_info):
            print(f"\nGPU {i} details:")
            for key, value in info.items():
                print(f"  {key}: {value}")
    else:
        print("CUDA is not available.")
        print("Checking for common issues...")

        check_cuda_installation()
        check_nvidia_smi()
        check_environment_variables()
        check_torch_cuda()
        print("Please ensure that your CUDA toolkit and drivers are properly installed and configured.")

def get_gpu_info():
    gpu_info = []
    for i in range(torch.cuda.device_count()):
        properties = torch.cuda.get_device_properties(i)
        gpu_info.append({
            "GPU Name": torch.cuda.get_device_name(i),
            "CUDA Capability": f"{properties.major}.{properties.minor}",
            "Total Memory (GB)": properties.total_memory / 1e9,
            "Multi Processor Count": properties.multi_processor_count,
            "Clock Rate (GHz)": properties.clock_rate / 1e6,
            "Memory Clock Rate (GHz)": properties.memory_clock_rate / 1e6,
            "Memory Bus Width (bits)": properties.memory_bus_width,
            "L2 Cache Size (KB)": properties.l2_cache_size / 1024,
            "Max Threads per SM": properties.max_threads_per_multi_processor,
            "Max Threads per Block": properties.max_threads_per_block,
            "Warp Size": properties.warp_size,
            "Registers per Block": properties.regs_per_block,
            "Max Shared Memory per Block (KB)": properties.shared_memory_per_block / 1024,
            "Max Shared Memory per SM (KB)": properties.shared_memory_per_multiprocessor / 1024
        })
    return gpu_info

if __name__ == "__main__":
    check_cuda()
