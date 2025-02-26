const express = require("express");
const authController = require("../controllers/authController");
const userController = require("./../controllers/userController");
const { uploadUserProfile } = require("./../utils/upload");
const verifyToken = require("./../middlewares/authMiddleware");
const authorizeRoles = require("./../middlewares/roleMiddleware");
const { uploadResume } = require("./../utils/uploadResume"); // Import the uploadResume middleware

const router = express.Router();

router.post("/signup", uploadUserProfile, authController.signup);
router.post("/uploadImage", uploadUserProfile, authController.uploadImage);
router.post(
  "/uploadResume",
  uploadResume.single("resume"),
  userController.uploadResume
);
router.post("/login", authController.login);
// router.route("/").get(userController.getAllUsers);

//only admin can access this router
router.get("/admin", verifyToken, authorizeRoles("admin"), (req, res) => {
  res.json({
    message: "Welcome admin",
  });
});
//only user can access this router
router.get("/user", verifyToken, (req, res) => {
  res.json({
    message: "Welcome user",
  });
});

router.route("/savedJobs").post(userController.saveJob);

router.route("/getSavedJobs").post(userController.getSavedJobs);

router
  .route("/:id")
  .get(userController.getUserById)
  .put(userController.updateUser);

module.exports = router;
