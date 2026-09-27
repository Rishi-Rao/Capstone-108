from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse, JSONResponse
import torch
import numpy as np
from io import BytesIO
from PIL import Image
import tempfile

from models.transformer_autoencoder import TransformerAutoencoder
from models.eeg_generator import EEGGenerator
from utils.preprocessing import preprocess_csv
from utils.inference import denoise_eeg, generate_image

app = FastAPI(title="EEG-to-Image API", version="1.0")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ✅ allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



denoiser_path = r'C:\Engineering\Brain2app\eeg-image\models\eeg_denoising_autoencoder.pth'
generator_path = r'C:\Engineering\Brain2app\eeg-image\models\EEG_GAN_GP_Generator_loss_502.pth' 



# --------------------------
# 🔧 Model Initialization
# --------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load denoising autoencoder
denoiser = TransformerAutoencoder(
    seq_len=360, num_channels=5, d_model=64, num_heads=4,
    num_layers=3, dim_feedforward=128, dropout=0.1
).to(device)
denoiser.load_state_dict(torch.load(denoiser_path, map_location=device))
denoiser.eval()

# Load generator
generator = EEGGenerator(eeg_seq_len=360, eeg_channels=5).to(device)
generator.load_state_dict(torch.load(generator_path, map_location=device))
generator.eval()

# --------------------------
# 🧠 Endpoints
# --------------------------

@app.get("/")
def root():
    return {"message": "EEG-to-Image FastAPI Server is running 🚀"}

# 🧩 1️⃣ Upload a CSV EEG file → get denoised data
@app.post("/denoise")
async def denoise(file: UploadFile = File(...)):
    try:
        content = await file.read()
        eeg_np = preprocess_csv(BytesIO(content))  # (360, num_channels)
        denoised = denoise_eeg(denoiser, eeg_np, device)
        return JSONResponse({"denoised_eeg": denoised.tolist()})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate_image")
async def generate_image_from_file(file: UploadFile = File(...)):
    try:
        content = await file.read()
        filename = file.filename.lower()

        if filename.endswith(".csv"):
            # Process CSV
            eeg_np = preprocess_csv(BytesIO(content))
            denoised = denoise_eeg(denoiser, eeg_np, device)
            input_tensor = denoised
        elif filename.endswith(".pth"):
            # Load torch tensor directly
            input_tensor = torch.load(BytesIO(content), map_location=device)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type. Use CSV or PTH.")

        # Generate image
        img = generate_image(generator, input_tensor, device)

        # Save temporarily and return
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            img.save(tmp.name)
            return FileResponse(tmp.name, media_type="image/png", filename="generated.png")

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
