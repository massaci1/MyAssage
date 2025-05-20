require('dotenv').config();
const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const USERS_FILE = path.join(__dirname, 'users.json');
const ENTRIES_FILE = path.join(__dirname, 'entries.json');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultsecret',
  resave: false,
  saveUninitialized: false
}));

function loadJSON(file) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : [];
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const users = loadJSON(USERS_FILE);
  if (users.find(u => u.username === username)) return res.json({ error: 'Username exists' });
  const hash = await bcrypt.hash(password, 10);
  users.push({ username, password: hash });
  saveJSON(USERS_FILE, users);
  req.session.username = username;
  res.json({ success: true });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const users = loadJSON(USERS_FILE);
  const user = users.find(u => u.username === username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.json({ error: 'Invalid credentials' });
  }
  req.session.username = username;
  res.json({ success: true });
});

app.post('/entries', (req, res) => {
  if (!req.session.username) return res.json({ error: 'Login required' });
  const { entry, emotion } = req.body;
  const entries = loadJSON(ENTRIES_FILE);
  entries.push({ username: req.session.username, entry, emotion, time: new Date().toISOString() });
  saveJSON(ENTRIES_FILE, entries);
  res.json({ success: true });
});

app.get('/entries', (req, res) => {
  const entries = loadJSON(ENTRIES_FILE);
  res.json(entries);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));