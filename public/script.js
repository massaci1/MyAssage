document.addEventListener('DOMContentLoaded', () => {
  const entryInput = document.getElementById('entryInput');
  const submitEntry = document.getElementById('submitEntry');
  const entriesDiv = document.getElementById('entries');
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('closeModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalUsername = document.getElementById('modalUsername');
  const modalPassword = document.getElementById('modalPassword');
  const modalSubmit = document.getElementById('modalSubmit');

  let authMode = 'login';

  function loadEntries() {
    fetch('/entries')
      .then(res => res.json())
      .then(entries => {
        entriesDiv.innerHTML = '';
        entries.reverse().forEach(entry => {
          const el = document.createElement('div');
          el.className = 'entry';
          el.innerHTML = `<strong>${entry.username}</strong><br>${entry.text}<br><small>${new Date(entry.time).toLocaleString()}</small>`;
          entriesDiv.appendChild(el);
        });
      });
  }

  submitEntry.addEventListener('click', () => {
    fetch('/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry: entryInput.value })
    })
    .then(res => {
      if (res.ok) {
        entryInput.value = '';
        loadEntries();
      } else {
        alert('You must log in to post.');
      }
    });
  });

  loginBtn.addEventListener('click', () => {
    authMode = 'login';
    modalTitle.textContent = 'Login';
    modal.style.display = 'block';
  });

  signupBtn.addEventListener('click', () => {
    authMode = 'signup';
    modalTitle.textContent = 'Sign up';
    modal.style.display = 'block';
  });

  logoutBtn.addEventListener('click', () => {
    fetch('/logout', { method: 'POST' })
      .then(() => {
        logoutBtn.style.display = 'none';
        loginBtn.style.display = '';
        signupBtn.style.display = '';
      });
  });

  modalSubmit.addEventListener('click', () => {
    const endpoint = authMode === 'signup' ? '/signup' : '/login';
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: modalUsername.value,
        password: modalPassword.value
      })
    }).then(res => {
      if (res.ok) {
        modal.style.display = 'none';
        logoutBtn.style.display = '';
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        loadEntries();
      } else {
        alert('Error: ' + (authMode === 'signup' ? 'Username taken.' : 'Invalid credentials.'));
      }
    });
  });

  closeModal.addEventListener('click', () => modal.style.display = 'none');
  loadEntries();
});