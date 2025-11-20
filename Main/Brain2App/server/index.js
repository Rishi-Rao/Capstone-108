const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const USERS_PATH = path.join(__dirname, 'users.json');

// ensure users file exists
if (!fs.existsSync(USERS_PATH)) {
  fs.writeFileSync(USERS_PATH, JSON.stringify({ admin: '1234', rishi: 'rishi123' }, null, 2));
}

function readUsers() {
  const raw = fs.readFileSync(USERS_PATH);
  return JSON.parse(raw);
}

function writeUsers(obj) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(obj, null, 2));
}

// Signup
app.get('/', (req, res) => {
  return res.json({ok:"welcome to the app "})
});

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'username & password required' });
  const users = readUsers();
  if (users[username]) return res.status(400).json({ message: 'username exists' });
  users[username] = password;
  writeUsers(users);
  return res.json({ ok: true });
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'username & password required' });
  const users = readUsers();
  if (users[username] && users[username] === password) {
    return res.json({ ok: true });
  }
  return res.status(401).json({ message: 'invalid credentials' });
});

// Simple upload stub (not saving files yet)
app.post('/upload', (req, res) => {
  // In future: handle multipart/form-data, save files, process them
  res.json({ message: 'upload endpoint - not implemented' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Server running on', PORT));
