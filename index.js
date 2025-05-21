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

  // Burada yeni ekleme:
  const bio = ""; // Başlangıçta boş bio veriyoruz
  const registeredAt = new Date(); // Kayıt tarihi şu an

  // Kayıt işlemi sırasında username, password, bio ve registeredAt kaydedilecek
  try {
    // Örneğin MongoDB kullanıyorsan şöyle olabilir:
    await usersCollection.insertOne({
      username,
      password,  // (şifreyi hash’lemen lazım, bu sadece örnek)
      bio,
      registeredAt,
    });

    // Kayıt başarılı ise:
    res.json({ success: true });

  } catch (err) {
    res.json({ success: false, error: 'Kayıt sırasında hata oluştu.' });
  }
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
app.get('/profile-data', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Yetkisiz' });

  const user = users[req.session.user];
  const userPosts = posts.filter(p => p.username === req.session.user);

  res.json({
    username: req.session.user,
    registeredAt: user.registeredAt,
    bio: user.bio || '',
    postCount: userPosts.length
  });
});
app.post('/update-bio', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Yetkisiz' });

  const { bio } = req.body;
  users[req.session.user].bio = bio;
  res.json({ success: true });
});
app.get('/profile', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  res.sendFile(__dirname + '/profile.html');
});
// Profil bilgilerini JSON olarak gönder
app.get('/profile/data', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Oturum yok' });

  res.json({
    username: req.session.user.username,
    registerDate: req.session.user.registerDate,
    bio: req.session.user.bio || '',
  });
});

// Bio güncelleme endpoint’i
app.post('/profile/update-bio', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Oturum yok' });

  const newBio = req.body.bio || '';

  // Burada session’daki bio’yu güncelle
  req.session.user.bio = newBio;

  // İstersen gerçek veritabanında da güncelle
  // Örneğin: usersDB.update(req.session.user.username, { bio: newBio });

  res.json({ success: true });
});

// Çıkış yapma (session temizleme)
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Çıkış yapılamadı.' });
    res.json({ success: true });
  });
});