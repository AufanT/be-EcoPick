const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Buat folder public/images jika belum ada
const dir = 'public/images';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// Konfigurasi penyimpanan untuk multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images'); // Tentukan folder penyimpanan
  },
  filename: function (req, file, cb) {
    // Buat nama file yang unik untuk menghindari konflik
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter untuk hanya menerima file gambar
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif/;
  const mimetype = allowedFileTypes.test(file.mimetype);
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb('Error: Tipe file tidak didukung!');
};

// Inisialisasi multer dengan konfigurasi di atas
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Batas ukuran file 5MB
  fileFilter: fileFilter
});

module.exports = upload;