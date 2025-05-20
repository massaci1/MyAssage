const express = require('express');
const session = require('express-session');
const fs = require('fs');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const USERS_FILE = path.join(__dirname, 'users.json');
const ENTRIES_FILE = path.join(__dirname, 'entries.json');

// Yardımcı fonksiyonlar
function loadJSON(file) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : [];
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'myassage-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Signup endpoint
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required.' });

  const users = loadJSON(USERS_FILE);
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists.' });
  }

  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed });
  saveJSON(USERS_FILE, users);

  req.session.user = username;
  res.json({ success: true });
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const users = loadJSON(USERS_FILE);

  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'Invalid username or password.' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid username or password.' });

  req.session.user = username;
  res.json({ success: true });
});

// Logout endpoint
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Add a new entry/post
app.post('/entries', (req, res) => {
  if (!req.session.user) return res.status(403).json({ error: 'Not logged in' });

  const { entry } = req.body;
  if (!entry || entry.trim() === '') return res.status(400).json({ error: 'Empty entry' });

  const entries = loadJSON(ENTRIES_FILE);
  entries.push({ username: req.session.user, text: entry.trim(), time: new Date().toISOString() });
  saveJSON(ENTRIES_FILE, entries);

  res.json({ success: true });
});

// Get all entries/posts
app.get('/entries', (req, res) => {
  const entries = loadJSON(ENTRIES_FILE);
  res.json(entries);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});