import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  // קובעת את תיקיית השמירה של הקבצים שהועלו.
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },

  // יוצרת שם ייחודי לקובץ (זמן + מספר אקראי).
  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + '-' + Math.round(Math.random() * 1E9);

    cb(
      null,
      uniqueSuffix + path.extname(file.originalname).toLowerCase()
    );
  }
});

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// מאפשרת העלאה של תמונות JPG, PNG ו-WEBP בלבד.
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(null, true);
  }

  const error = new Error('ניתן להעלות רק תמונות מסוג JPG, PNG או WEBP.');
  error.statusCode = 400;
  cb(error);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

export default upload;
