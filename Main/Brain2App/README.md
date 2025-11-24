EEG-fMRI Fullstack App (React + Express with JSON users storage)

Structure:
- client/   -> React (Vite) frontend
- server/   -> Node + Express backend (stores users in JSON file)
- eeg-image/ -> FastAPI backend for EEG-to-Image
- eeg-text/  -> FastAPI backend for EEG-to-Text
- fMRI-Image/ -> Python scripts for fMRI-to-Image

Quick start (Linux / macOS / WSL / Windows with Node installed):
1. Open three terminals.
2. Backend:
   cd server
   npm install
   npm run dev
   (server runs on http://localhost:4000)
3. Frontend:
   cd client
   npm install
   npm run dev
   (frontend runs on http://localhost:5173 by default)
4. EEG-to-Image Service:
   cd eeg-image
   pip install -r requirements.txt
   uvicorn app:app --host 0.0.0.0 --port 8000
5. EEG-to-Text Service:
   cd eeg-text
   pip install -r requirements.txt
   python app.py --checkpoint_path <path_to_your_checkpoint> --port 8001
6. fMRI-to-Image Scripts:
   cd fMRI-Image
   # Create conda environment from environment.yaml
   conda env create -f environment.yaml
   conda activate mindeye
   # Run reconstruction
   python Reconstructions.py --model_name <name> --data_path <nsd_path>

Notes:
- Signup/login is persisted in server/users.json.
- The EEG-to-Text service requires a model checkpoint file.
- The fMRI-to-Image scripts require model checkpoints and data paths.
- The frontend will communicate with the FastAPI services directly.
- Upload endpoints are stubbed for future EEG/fMRI handling.

To Run eeg-image server:
1. Open terminal
2. run the commands
cd eeg-image
uvicorn app:app --reload 
(server runs on http://localhost:4000)
