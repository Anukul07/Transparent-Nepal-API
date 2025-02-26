const express = require("express");
const companyController = require("../controllers/companyController");
const { uploadCompanyLogo } = require("../utils/upload"); // Importing only company logo upload middleware

const router = express.Router();

// ✅ Create a new company (with optional logo upload)
router.post("/", uploadCompanyLogo, companyController.createCompany);

// ✅ Get all companies
router.get("/", companyController.getAllCompanies);

// ✅ Get a single company by ID
router.get("/:id", companyController.getCompanyById);

// ✅ Update company details (with optional logo update)
router.patch("/:id", uploadCompanyLogo, companyController.updateCompany);

// ✅ Delete a company
router.delete("/:id", companyController.deleteCompany);

module.exports = router;
