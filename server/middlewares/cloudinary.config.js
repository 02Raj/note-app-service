const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Apne Cloudinary credentials ko configure karein
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer ke liye storage engine banayein
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'note_app_resources', // Cloudinary par is naam ka folder ban jayega
    // === YAHI HAI ASLI SOLUTION ===
    // 'auto' Cloudinary ko batata hai ki file ke extension (pdf, jpg, png) ke hisaab se use save kare
    resource_type: 'auto', 
    allowed_formats: ['jpeg', 'png', 'jpg', 'pdf', 'doc', 'docx', 'ppt', 'pptx']
  }
});

const upload = multer({ storage: storage });

module.exports = {
    cloudinary,
    upload
};
