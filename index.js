const express = require('express');
const session = require('express-session');
const cors = require('cors');
const fs = require('fs');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const USERS_FILE = path.join(__dirname, 'users.json');
const ENTRIES_FILE = path.join(__dirname, 'entries.json');

// JSON dosyası yükleme
function loadJSON(file) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : [];
}

// JSON dosyası kaydetme
function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Skor hesaplama algoritması
function calculateScore(post) {
  const likeScore = post.likes || 0;
  const lengthScore = post.text.length / 100;
  const ageInDays = (Date.now() - new Date(post.time)) / (1000 * 60 * 60 * 24);
  return (1 * likeScore) + (0.3 * lengthScore) - (0.1 * ageInDays);
}

// CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'myassage-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Anasayfa
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Kayıt olma
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const users = loadJSON(USERS_FILE);

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Bu kullanıcı adı zaten alınmış.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    username,
    password: hashedPassword,
    bio: '',
    registeredAt: new Date().toISOString()
  };

  users.push(newUser);
  saveJSON(USERS_FILE, users);

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

  req.session.user = {
    username: user.username,
    registeredAt: user.registeredAt,
    bio: user.bio
  };

  res.json({ success: true });
});

// Çıkış yapma
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Çıkış yapılamadı.' });
    res.json({ success: true });
  });
});

// Yeni paylaşım ekleme
app.post('/post', (req, res) => {
  if (!req.session.user) return res.status(403).json({ error: 'Önce giriş yapmalısınız.' });

  const { content, emotion } = req.body;
  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Paylaşım boş olamaz.' });
  }

  const entries = loadJSON(ENTRIES_FILE);

  entries.push({
    username: req.session.user.username,
    text: content.trim(),
    emotion: emotion || '',
    time: new Date().toISOString(),
    likes: 0,
    likedBy: []
  });

  saveJSON(ENTRIES_FILE, entries);

  res.json({ success: true });
});

// Gönderiyi beğenme
app.post('/like', (req, res) => {
  if (!req.session.user) {
    return res.status(403).json({ error: 'Önce giriş yapmalısınız.' });
  }

  const { time } = req.body;
  const entries = loadJSON(ENTRIES_FILE);
  const entry = entries.find(e => e.time === time);
  if (!entry) return res.status(404).json({ error: 'Gönderi bulunamadı.' });

  if (!entry.likedBy.includes(req.session.user.username)) {
    entry.likes += 1;
    entry.likedBy.push(req.session.user.username);
    saveJSON(ENTRIES_FILE, entries);
    return res.json({ success: true, likes: entry.likes });
  } else {
    return res.status(400).json({ error: 'Bu gönderiyi zaten beğendiniz.' });
  }
});

// Kendi paylaşımlarını listeleme
app.get('/myposts', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Giriş yapmadınız.' });

  const entries = loadJSON(ENTRIES_FILE);
  const userEntries = entries.filter(e => e.username === req.session.user.username);
  res.json(userEntries);
});

// Tüm paylaşımlar (skora göre sıralanmış)
app.get('/allposts', (req, res) => {
  const entries = loadJSON(ENTRIES_FILE);
  const sorted = entries.sort((a, b) => calculateScore(b) - calculateScore(a));
  res.json(sorted);
});

// Profil bilgisi getirme
app.get('/profile-data', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Giriş yapmadınız.' });

  const users = loadJSON(USERS_FILE);
  const user = users.find(u => u.username === req.session.user.username);
  const entries = loadJSON(ENTRIES_FILE);
  const userEntries = entries.filter(e => e.username === req.session.user.username);

  res.json({
    username: user.username,
    registeredAt: user.registeredAt,
    bio: user.bio,
    postCount: userEntries.length
  });
});

// Profil sayfası
app.get('/profile', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public/profile.html'));
});

// Bio güncelleme
app.post('/update-bio', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Giriş yapmadınız.' });

  const { bio } = req.body;
  const users = loadJSON(USERS_FILE);
  const user = users.find(u => u.username === req.session.user.username);

  user.bio = bio;
  saveJSON(USERS_FILE, users);
  req.session.user.bio = bio;

  res.json({ success: true });
});

// Oturum durumu kontrolü
app.get('/session-status', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, username: req.session.user.username });
  } else {
    res.json({ loggedIn: false });
  }
});

// Sunucu başlat
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});