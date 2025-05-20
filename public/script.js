const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const userSection = document.getElementById('user-section');
const authSection = document.getElementById('auth-section');

const userNameSpan = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');

const postForm = document.getElementById('post-form');
const postContent = document.getElementById('post-content');

const myPostsList = document.getElementById('my-posts');
const allPostsList = document.getElementById('all-posts');

const signupError = document.getElementById('signup-error');
const loginError = document.getElementById('login-error');
const postError = document.getElementById('post-error');

async function checkSession() {
  const res = await fetch('/myposts');
  if (res.status === 401) {
    // Not logged in
    authSection.classList.remove('hidden');
    userSection.classList.add('hidden');
  } else {
    authSection.classList.add('hidden');
    userSection.classList.remove('hidden');
    const data = await res.json();
    // Kullanıcı adı göstermek için backend'den alamıyoruz, o yüzden localStorage ile tutacağız.
    const username = localStorage.getItem('username') || 'Kullanıcı';
    userNameSpan.textContent = username;
    loadPosts(data.posts);
    loadAllPosts();
  }
}

function loadPosts(posts) {
  myPostsList.innerHTML = '';
  if (posts.length === 0) myPostsList.innerHTML = '<li>Henüz paylaşım yok.</li>';
  posts.forEach(p => {
    const li = document.createElement('li');
    li.textContent = `${p.content} (Paylaşan: ${p.username})`;
    myPostsList.appendChild(li);
  });
}

async function loadAllPosts() {
  const res = await fetch('/allposts');
  const data = await res.json();
  allPostsList.innerHTML = '';
  if (data.posts.length === 0) allPostsList.innerHTML = '<li>Henüz paylaşım yok.</li>';
  data.posts.forEach(p => {
    const li = document.createElement('li');
    li.textContent = `${p.content} (Paylaşan: ${p.username})`;
    allPostsList.appendChild(li);
  });
}

signupForm.addEventListener('submit', async e => {
  e.preventDefault();
  signupError.textContent = '';

  const username = document.getElementById('signup-username').value.trim();
  const password = document.getElementById('signup-password').value.trim();

  const res = await fetch('/signup', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (data.error) {
    signupError.textContent = data.error;
  } else {
    localStorage.setItem('username', username);
    await checkSession();
  }
});

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  loginError.textContent = '';

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();

  const res = await fetch('/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (data.error) {
    loginError.textContent = data.error;
  } else {
    localStorage.setItem('username', username);
    await checkSession();
  }
});

logoutBtn.addEventListener('click', async () => {
  await fetch('/logout', { method: 'POST' });
  localStorage.removeItem('username');
  await checkSession();
});

postForm.addEventListener('submit', async e => {
  e.preventDefault();
  postError.textContent = '';

  const content = postContent.value.trim();
  if (!content) {
    postError.textContent = 'Lütfen bir şeyler yazın.';
    return;
  }

  const res = await fetch('/post', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ content })
  });

  const data = await res.json();
  if (data.error) {
    postError.textContent = data.error;
  } else {
    postContent.value = '';
    await checkSession();
  }
});

// Sayfa yüklenince oturum kontrolü yap
checkSession();