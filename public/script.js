const colors = [
  { color: 'yellow', emotion: 'Mutlu' },
  { color: 'blue', emotion: 'Üzgün' },
  { color: 'red', emotion: 'Öfkeli' },
  { color: 'green', emotion: 'Huzurlu' },
  { color: 'purple', emotion: 'Yalnız' },
  { color: 'orange', emotion: 'Heyecanlı' },
  { color: 'black', emotion: 'Korkmuş' },
  { color: 'gray', emotion: 'Kararsız / Boşlukta' },
  { color: 'pink', emotion: 'Aşık' },
  { color: 'brown', emotion: 'Yorulmuş' },
  { color: 'white', emotion: 'Umutlu' },
  { color: 'navy', emotion: 'Endişeli' }
];

let index = 0;
updateTheme();

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') {
    index = (index + 1) % colors.length;
    updateTheme();
  } else if (e.key === 'ArrowLeft') {
    index = (index - 1 + colors.length) % colors.length;
    updateTheme();
  }
});

function updateTheme() {
  document.body.style.backgroundColor = colors[index].color;
}

document.getElementById('submit').addEventListener('click', async () => {
  const entry = document.getElementById('entry').value.trim();
  if (!entry) return alert('Boş yazı gönderemezsin.');

  const response = await fetch('/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      entry,
      emotion: colors[index].emotion
    })
  });

  const result = await response.json();
  if (result.success) {
    alert('Paylaşıldı!');
    document.getElementById('entry').value = '';
  } else {
    alert(result.error || 'Hata oluştu.');
  }
});