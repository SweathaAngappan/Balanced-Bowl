const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload folder if not exists
const uploadPath = path.join(__dirname, '../../uploads/certificates');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + ext);
  }
});

// Validate file types (PDF + Images)
function fileFilter(req, file, cb) {
  const allowedTypes = /pdf|jpg|jpeg|png/;
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF or image files allowed"), false);
  }
}

const upload = multer({
  storage,
  fileFilter
});

module.exports = upload;
