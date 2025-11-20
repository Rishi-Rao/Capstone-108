import torch
from PIL import Image
import torchvision.transforms as transforms

def denoise_eeg(model, eeg_np, device):
    eeg_tensor = torch.tensor(eeg_np).unsqueeze(0).to(device)
    with torch.no_grad():
        denoised = model(eeg_tensor).cpu().squeeze(0).numpy()
    return denoised

def generate_image(model, eeg_np, device):
    print(eeg_np.shape)
    eeg_tensor = torch.tensor(eeg_np).unsqueeze(0).to(device)
    with torch.no_grad():
        img = model(eeg_tensor)
        img = (img + 1) / 2  # normalize to [0,1]
    img_pil = transforms.ToPILImage()(img.squeeze(0).cpu())
    return img_pil
