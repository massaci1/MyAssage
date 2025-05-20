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

// Giriş butonuna basınca popup aç veya prompt (basit demo)
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
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (data.success) {
    showMessage('Giriş başarılı!', false);
  } else {
    showMessage(data.error || 'Bir hata oluştu.');
  }
});

// Kayıt ol butonuna basınca popup aç veya prompt (basit demo)
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
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (data.success) {
    showMessage('Kayıt başarılı! Giriş yapıldı.', false);
  } else {
    showMessage(data.error || 'Bir hata oluştu.');
  }
});

// Paylaş butonuna basınca
postBtn.addEventListener('click', async () => {
  const content = postContent.value.trim();
  if (!content) {
    showMessage('Lütfen paylaşımınızı yazın.');
    return;
  }

  const res = await fetch('/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });

  const data = await res.json();

  if (data.success) {
    showMessage('Paylaşımınız başarıyla kaydedildi!', false);
    postContent.value = '';
  } else {
    showMessage(data.error || 'Bir hata oluştu.');
  }
});