const multer = require("multer");
const maxSize = 2 * 1024 * 1024;
const path = require("path");

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads"); // Store images in 'public/uploads'
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    cb(null, `IMG-${Date.now()}` + ext); // Unique filename
  },
});

// File filter: Allow only images
const imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error("File format not supported"), false);
  }
  cb(null, true);
};

// Multer instance supporting multiple fields
const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: maxSize },
});

// Middleware for different upload fields
const uploadUserProfile = upload.single("profilePicture"); // For user profile pictures
const uploadCompanyLogo = upload.single("companyLogo"); // For company logos

module.exports = { uploadUserProfile, uploadCompanyLogo };
