const multer = require("multer");
const maxSize = 2 * 1024 * 1024; // Maximum file size of 2MB for resume (adjust this as needed)
const path = require("path");

// Storage configuration for resumes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store resumes in 'public/uploads/resumes'
    cb(null, "public/uploads/resumes");
  },
  filename: (req, file, cb) => {
    // Use unique filename with a prefix 'RESUME-' and preserve the .pdf extension
    cb(null, `RESUME-${Date.now()}.pdf`);
  },
});

// File filter to allow only PDFs for resumes
const fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.pdf$/)) {
    return cb(new Error("Only PDF files are allowed for resumes"), false);
  }
  cb(null, true);
};

// Multer instance to handle file upload
const uploadResume = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize }, // You can adjust the max size for resumes
});

module.exports = { uploadResume };
