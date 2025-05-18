const express = require('express');
const app = express();

// JSON verileri alabilmek için:
app.use(express.json());

// Anasayfa isteği
app.get('/', (req, res) => {
  res.send('Hoş geldin Myassage!');
});

// Sunucuyu başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
