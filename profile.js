document.addEventListener('DOMContentLoaded', async () => {
  const usernameSpan = document.getElementById('username');
  const registerDateSpan = document.getElementById('register-date');
  const bioText = document.getElementById('bio-text');
  const message = document.getElementById('message');
  const logoutBtn = document.getElementById('logout-btn');
  const saveBtn = document.getElementById('save-bio-btn');

  // Kullanıcı bilgilerini al
  const res = await fetch('/profile/data');
  if (res.ok) {
    const data = await res.json();
    usernameSpan.textContent = data.username;
    registerDateSpan.textContent = new Date(data.registerDate).toLocaleDateString();
    bioText.value = data.bio || '';
  } else {
    // Oturum yoksa anasayfaya yönlendir
    window.location.href = '/';
  }

  // Bio güncelleme isteği
  saveBtn.addEventListener('click', async () => {
    const newBio = bioText.value.trim();

    const res = await fetch('/profile/update-bio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio: newBio }),
    });

    const result = await res.json();
    if (result.success) {
      message.style.color = 'green';
      message.textContent = 'Bio başarıyla güncellendi!';
    } else {
      message.style.color = 'red';
      message.textContent = result.error || 'Bio güncellenirken hata oluştu.';
    }

    setTimeout(() => (message.textContent = ''), 3000);
  });

  // Çıkış yapma
  logoutBtn.addEventListener('click', async () => {
    await fetch('/logout', { method: 'POST' });
    window.location.href = '/';
  });
});