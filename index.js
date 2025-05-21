const express = require('express');
const session = require('express-session');
const fs = require('fs');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const USERS_FILE = path.join(__dirname, 'users.json');
const ENTRIES_FILE = path.join(__dirname, 'entries.json');

// JSON dosyasından yükle
function loadJSON(file) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : [];
}

// JSON dosyasına kaydet
function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'myassage-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 gün
}));

// Anasayfa
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Kayıt olma
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli.' });

  const users = loadJSON(USERS_FILE);
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Kullanıcı adı zaten mevcut.' });
  }

  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed });
  saveJSON(USERS_FILE, users);

  req.session.username = username;
  res.json({ success: true });
});

// Giriş yapma
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const users = loadJSON(USERS_FILE);
  const user = users.find(u => u.username === username);

  if (!user) return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre.' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre.' });

  req.session.username = username;
  res.json({ success: true });
});

// Çıkış yapma
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Yeni paylaşım ekleme
app.post('/post', (req, res) => {
  if (!req.session.username) return res.status(403).json({ error: 'Önce giriş yapmalısınız.' });

  const { content } = req.body;
  if (!content || content.trim() === '') return res.status(400).json({ error: 'Paylaşım boş olamaz.' });

  const entries = loadJSON(ENTRIES_FILE);
  entries.push({
    username: req.session.username,
    text: content.trim(),
    time: new Date().toISOString()
  });
  saveJSON(ENTRIES_FILE, entries);

  res.json({ success: true });
});

// Kendi paylaşımlarını listele
app.get('/myposts', (req, res) => {
  if (!req.session.username) return res.status(401).json({ error: 'Giriş yapmadınız.' });

  const entries = loadJSON(ENTRIES_FILE);
  const userEntries = entries.filter(e => e.username === req.session.username);
  res.json(userEntries);
});

// Tüm paylaşımlar
app.get('/allposts', (req, res) => {
  const entries = loadJSON(ENTRIES_FILE);
  res.json(entries);
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});