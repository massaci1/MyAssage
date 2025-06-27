const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const postBtn = document.getElementById('post-btn');
const postContent = document.getElementById('post-content');
const messages = document.getElementById('messages');

function showMessage(text, isError = true) {
  messages.textContent = text;
  messages.style.color = isError ? 'red' : 'green';
  setTimeout(() => messages.textContent = '', 4000);
}

// Giriş
loginBtn.addEventListener('click', async () => {
  const username = prompt('Kullanıcı adınızı girin:');
  const password = prompt('Şifrenizi girin:');

  if (!username || !password) {
    showMessage('Kullanıcı adı ve şifre boş olamaz.');
    return;
  }

  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include'
  });

  const data = await res.json();

  if (data.success) {
    showMessage('Giriş başarılı!', false);
  } else {
    showMessage(data.error || 'Bir hata oluştu.');
  }
});

// Kayıt
signupBtn.addEventListener('click', async () => {
  const username = prompt('Yeni kullanıcı adınızı girin:');
  const password = prompt('Yeni şifrenizi girin:');

  if (!username || !password) {
    showMessage('Kullanıcı adı ve şifre boş olamaz.');
    return;
  }

  const res = await fetch('/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include'
  });

  const data = await res.json();

  if (data.success) {
    showMessage('Kayıt başarılı! Giriş yapıldı.', false);
  } else {
    showMessage(data.error || 'Bir hata oluştu.');
  }
});

// Yeni paylaşımı sayfaya ekle
function addPostToPage(post) {
  const section = document.createElement('div');
  section.className = 'user-post';

  const emotionLabel = post.emotion
    ? `<span class="emotion-badge">${emojiForEmotion(post.emotion)} ${capitalize(post.emotion)}</span>`
    : '';

  section.innerHTML = `
    <p><strong>${post.username}</strong> - <small>${new Date(post.time).toLocaleString()}</small></p>
    ${emotionLabel}
    <p>${post.text}</p>
    <button class="like-btn">❤️ Beğen (${post.likes || 0})</button>
    <hr>
  `;

  const likeBtn = section.querySelector('.like-btn');
  likeBtn.addEventListener('click', async () => {
    const res = await fetch('/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ time: post.time }),
      credentials: 'include'
    });

    const data = await res.json();
    if (data.success) {
      likeBtn.textContent = `❤️ Beğen (${data.likes})`;
    } else {
      alert(data.error || 'Bir hata oluştu.');
    }
  });

  document.getElementById('post-list').prepend(section);
}

// Paylaşım butonu
postBtn.addEventListener('click', async () => {
  const content = postContent.value.trim();
  const emotion = document.getElementById('emotion-select').value;

  if (!content) {
    showMessage('Lütfen paylaşımınızı yazın.');
    return;
  }

  const res = await fetch('/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, emotion }),
    credentials: 'include'
  });

  const data = await res.json();

  if (data.success) {
    showMessage('Paylaşımınız başarıyla kaydedildi!', false);
    postContent.value = '';
    document.getElementById('emotion-select').value = '';

    const usernameRes = await fetch('/myposts', { credentials: 'include' });
    const userPosts = await usernameRes.json();
    addPostToPage(userPosts[userPosts.length - 1]);
  } else {
    showMessage(data.error || 'Bir hata oluştu.');
  }
});

// Sayfa açıldığında gönderileri getir
window.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('/allposts', { credentials: 'include' });
  const posts = await res.json();
  posts.forEach(post => addPostToPage(post));
});

// Yardımcı fonksiyonlar
function emojiForEmotion(emotion) {
  switch (emotion) {
    case 'mutlu': return '😊';
    case 'uzgun': return '😢';
    case 'ofkeli': return '😡';
    case 'heyecanli': return '😃';
    case 'huzurlu': return '🌿';
    case 'yalnız': return '🙁';
    default: return '';
  }
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
// Sayfa açıldığında oturum durumunu kontrol et
window.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('/session-status', { credentials: 'include' });
  const data = await res.json();

  if (data.loggedIn) {
    document.getElementById('login-btn').style.display = 'none';
    document.getElementById('signup-btn').style.display = 'none';
    document.getElementById('profile-btn').style.display = 'inline-block';
  } else {
    document.getElementById('login-btn').style.display = 'inline-block';
    document.getElementById('signup-btn').style.display = 'inline-block';
    document.getElementById('profile-btn').style.display = 'none';
  }
});
// Profil butonuna tıklayınca profil sayfasına yönlendir
document.getElementById('profile-btn').addEventListener('click', () => {
  window.location.href = 'https://www.myassage.com/profile';
});