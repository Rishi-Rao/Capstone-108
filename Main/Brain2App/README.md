EEG-fMRI Fullstack App (React + Express with JSON users storage)

Structure:
- client/   -> React (Vite) frontend
- server/   -> Node + Express backend (stores users in JSON file)

Quick start (Linux / macOS / WSL / Windows with Node installed):
1. Open two terminals.
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

Notes:
- Signup/login is persisted in server/users.json.
- Upload endpoints are stubbed for future EEG/fMRI handling.

To Run eeg-image server:
1. Open terminal
2. run the commands
cd eeg-image
uvicorn app:app --reload 
(server runs on http://localhost:4000)