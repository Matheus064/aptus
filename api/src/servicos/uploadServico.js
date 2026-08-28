const fs = require('node:fs');
const path = require('node:path');
const multer = require('multer');

const criarUpload = (pasta, limite) => {
  const destino = path.resolve('uploads', pasta);
  fs.mkdirSync(destino, { recursive: true });
  const storage = multer.diskStorage({
    destination: destino,
    filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 11)}${path.extname(file.originalname).toLowerCase()}`),
  });
  return multer({ storage, limits: { fileSize: limite }, fileFilter: (req, file, cb) => cb(null, ['image/jpeg', 'image/png', 'video/mp4'].includes(file.mimetype)) });
};
const urlDoArquivo = (req) => req.file ? `/uploads/${req.file.destination.split(`${path.sep}uploads${path.sep}`)[1].replaceAll(path.sep, '/')}/${req.file.filename}` : null;
module.exports = { uploadReceita: criarUpload('receitas', 10 * 1024 * 1024), uploadExercicio: criarUpload('exercicios', 50 * 1024 * 1024), urlDoArquivo };
