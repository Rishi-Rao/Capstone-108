fMRI-to-Image Reconstruction
This project decodes fMRI brain activity into images using NSD data. It supports three main tasks:
Training a model to map fMRI → CLIP embeddings
Reconstructing images from new fMRI responses
Retrieving similar images from a dataset using CLIP similarity
All main scripts are in the src/ folder.
How to Run
Install dependencies:
pip install -r requirements.txt
Train a model:
python Train_MindEye.py --data_path <nsd_path> --model_name <name>
Reconstruct images:
python Reconstructions.py --model_name <name> --data_path <nsd_path>
Retrieve images:
python Retrievals.py --model_name <name> --data_path <nsd_path>
Evaluate outputs:
python Reconstruction_Metrics.py --recon_path <file.pt> --all_images_path all_images.pt