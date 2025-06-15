const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create a storage engine for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  
  // === YAHI HAI ASLI "BULLETPROOF" FIX ===
  // Hum 'params' ko ek object ki jagah ek function bana rahe hain.
  // Yeh function file ko dekh kar dynamically resource_type set karega.
  params: (req, file) => {
    let folder = 'note_app_resources';
    let resource_type = 'auto'; // Default to auto

    // Agar file PDF, DOCX, ya koi aur document hai, to use 'raw' set karo
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') 
    {
      resource_type = 'raw';
    }

    // Agar aap alag-alag file types ke liye alag folder chahte hain, to woh bhi yahaan kar sakte hain.
    // Example: if (resource_type === 'raw') { folder = 'documents'; }

    return {
      folder: folder,
      resource_type: resource_type,
      allowed_formats: ['jpeg', 'png', 'jpg', 'pdf', 'doc', 'docx']
    };
  }
  // ============================================
});

const upload = multer({ storage: storage });

module.exports = {
    cloudinary,
    upload
};
