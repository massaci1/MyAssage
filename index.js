const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'myassage-secret-key',
  resave: false,
  saveUninitialized: true,
}));

const USERS_FILE = path.join(__dirname, 'users.json');
const ENTRIES_FILE = path.join(__dirname, 'entries.json');

function loadJSON(file) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : [];
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  const users = loadJSON(USERS_FILE);

  if (users.find(u => u.username === username)) {
    return res.status(400).send('Username already exists');
  }

  users.push({ username, password });
  saveJSON(USERS_FILE, users);
  req.session.user = username;
  res.sendStatus(200);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = loadJSON(USERS_FILE);

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).send('Invalid credentials');
  }

  req.session.user = username;
  res.sendStatus(200);
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.sendStatus(200);
});

app.post('/entries', (req, res) => {
  if (!req.session.user) return res.status(403).send('Not logged in');

  const { entry } = req.body;
  if (!entry) return res.status(400).send('Empty entry');

  const entries = loadJSON(ENTRIES_FILE);
  entries.push({ username: req.session.user, text: entry, time: new Date().toISOString() });
  saveJSON(ENTRIES_FILE, entries);
  res.sendStatus(200);
});

app.get('/entries', (req, res) => {
  const entries = loadJSON(ENTRIES_FILE);
  res.json(entries);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});