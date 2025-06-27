async function loadProfile() {
  const res = await fetch('/profile-data', { credentials: 'include' });
  if (!res.ok) {
    window.location.href = '/';
    return;
  }
  const data = await res.json();

  const info = document.getElementById('profile-info');
  info.innerHTML = `
    <p><strong>Kullanıcı adı:</strong> ${data.username}</p>
    <p><strong>Kayıt tarihi:</strong> ${new Date(data.registeredAt).toLocaleDateString()}</p>
    <p><strong>Bio:</strong> <span id="bio-text">${data.bio || 'Henüz bio yok.'}</span></p>
    <textarea id="bio-input" placeholder="Yeni bio yaz..." rows="2"></textarea>
    <button id="update-bio-btn">Bio Güncelle</button>
    <p><strong>Toplam paylaşım sayısı:</strong> ${data.postCount}</p>
  `;

  document.getElementById('update-bio-btn').addEventListener('click', async () => {
    const bio = document.getElementById('bio-input').value.trim();
    const res = await fetch('/update-bio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio }),
      credentials: 'include'
    });
    if (res.ok) {
      document.getElementById('bio-text').textContent = bio || 'Henüz bio yok.';
      alert('Bio güncellendi!');
    } else {
      alert('Bio güncellenemedi.');
    }
  });

  // Kullanıcının paylaşımlarını yükle
  const postsRes = await fetch('/myposts', { credentials: 'include' });
  const posts = await postsRes.json();
  posts.forEach(post => addPostToPage(post));
}

function addPostToPage(post) {
  const section = document.createElement('div');
  section.className = 'user-post';
  const emotionLabel = post.emotion
    ? `<span class="emotion-badge">${emojiForEmotion(post.emotion)} ${capitalize(post.emotion)}</span>`
    : '';

  section.innerHTML = `
    <p><small>${new Date(post.time).toLocaleString()}</small></p>
    ${emotionLabel}
    <p>${post.text}</p>
    <hr>
  `;
  document.getElementById('post-list').append(section);
}

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

loadProfile();