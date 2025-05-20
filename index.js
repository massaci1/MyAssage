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

// Orta katmanlar (middleware)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'myassage-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 gün
}));

// Anasayfa
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

  req.session.username = username;
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

  req.session.username = username;
  res.json({ success: true });
});

// Logout endpoint
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Yeni gönderi (entry) ekleme
app.post('/entries', (req, res) => {
  if (!req.session.username) return res.status(403).json({ error: 'Not logged in' });

  const { entry } = req.body;
  if (!entry || entry.trim() === '') return res.status(400).json({ error: 'Empty entry' });

  const entries = loadJSON(ENTRIES_FILE);
  entries.push({ username: req.session.username, text: entry.trim(), time: new Date().toISOString() });
  saveJSON(ENTRIES_FILE, entries);

  res.json({ success: true });
});

// Kullanıcının kendi gönderilerini getir
app.get('/myposts', (req, res) => {
  if (!req.session.username) return res.status(401).json({ error: 'Unauthorized' });

  const entries = loadJSON(ENTRIES_FILE);
  const userEntries = entries.filter(e => e.username === req.session.username);
  res.json({ posts: userEntries });
});

// Tüm gönderileri getir
app.get('/allposts', (req, res) => {
  const entries = loadJSON(ENTRIES_FILE);
  res.json({ posts: entries });
});

// Server başlat
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});