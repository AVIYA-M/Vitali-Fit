const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// הגדרת החיבור ל-Cloudinary באמצעות משתני הסביבה
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// הגדרת האחסון כך שהתמונות יעלו לענן תחת תיקייה ייעודית
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'VitaliFit_Meals',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});

const uploadCloud = multer({ storage: storage });

module.exports = { cloudinary, uploadCloud };