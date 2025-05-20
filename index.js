const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// In-memory user and posts store (for demonstration; replace with a real DB)
const users = [];
const posts = [];

// Signup endpoint
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.json({ error: 'Username and password are required.' });
  if (users.find(u => u.username === username)) return res.json({ error: 'Username already exists.' });

  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed });
  req.session.username = username;
  res.json({ success: true });
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.json({ error: 'Invalid username or password.' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ error: 'Invalid username or password.' });

  req.session.username = username;
  res.json({ success: true });
});

// Logout endpoint
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Post creation endpoint
app.post('/post', (req, res) => {
  if (!req.session.username) return res.json({ error: 'You must be logged in to post.' });
  const { content } = req.body;
  if (!content || content.trim() === '') return res.json({ error: 'Post content cannot be empty.' });

  posts.push({
    content: content.trim(),
    username: req.session.username,
    created_at: new Date()
  });
  res.json({ success: true });
});

// Get current user's posts
app.get('/myposts', (req, res) => {
  if (!req.session.username) return res.status(401).json({ error: 'Unauthorized' });
  const userPosts = posts.filter(p => p.username === req.session.username);
  res.json({ posts: userPosts });
});

// Get all posts
app.get('/allposts', (req, res) => {
  res.json({ posts });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});