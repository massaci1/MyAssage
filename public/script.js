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

// Giriş butonuna basınca
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
    credentials: 'include' // EKLENDİ
  });

  const data = await res.json();

  if (data.success) {
    showMessage('Giriş başarılı!', false);
  } else {
    showMessage(data.error || 'Bir hata oluştu.');
  }
});

// Kayıt ol butonuna basınca
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
    credentials: 'include' // EKLENDİ
  });

  const data = await res.json();

  if (data.success) {
    showMessage('Kayıt başarılı! Giriş yapıldı.', false);
  } else {
    showMessage(data.error || 'Bir hata oluştu.');
  }
});

// Yeni paylaşımı göster
function addPostToPage(post) {
  const section = document.createElement('div');
  section.className = 'user-post';
  section.innerHTML = `
    <p><strong>${post.username}</strong> - <small>${new Date(post.time).toLocaleString()}</small></p>
    <p>${post.text}</p>
    <hr>
  `;
  document.getElementById('post-list')
  .prepend(section);
}

// Sayfa yüklendiğinde mevcut paylaşımları getir
window.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('/allposts', { credentials: 'include' }); // EKLENDİ
  const posts = await res.json();

  posts.forEach(post => addPostToPage(post));
});

// Paylaşım yap
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
    credentials: 'include' // EKLENDİ
  });

  const data = await res.json();

  if (data.success) {
    showMessage('Paylaşımınız başarıyla kaydedildi!', false);
    postContent.value = '';

    // Yeni gönderiyi hemen sayfaya ekle
    const usernameRes = await fetch('/myposts', { credentials: 'include' }); // EKLENDİ
    const userPosts = await usernameRes.json();
    addPostToPage(userPosts[userPosts.length - 1]);
  } else {
    showMessage(data.error || 'Bir hata oluştu.');
  }
});

document.getElementById('profile-btn').addEventListener('click', () => {
  window.location.href = '/profile';
});
function addPostToPage(post) {
  const section = document.createElement('div');
  section.className = 'user-post';

  // Duygu etiketini hazırlayalım
  const emotionLabel = post.emotion
    ? `<span class="emotion-badge">${emojiForEmotion(post.emotion)} ${capitalize(post.emotion)}</span>`
    : '';

  // Kart içeriği
  section.innerHTML = `
    <p><strong>${post.username}</strong> - <small>${new Date(post.time).toLocaleString()}</small></p>
    ${emotionLabel}
    <p>${post.text}</p>
    <button class="like-btn">❤️ Beğen (${post.likes || 0})</button>
    <hr>
  `;

  // Beğeni butonu işlevi
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