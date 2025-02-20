const express = require("express");
const authController = require("../controllers/authController");
const userController = require("./../controllers/userController");
const upload = require("./../utils/upload");

const router = express.Router();

router.post("/signup", upload, authController.signup);
router.post("/uploadImage", upload, authController.uploadImage);
router.post("/login", authController.login);
router.route("/").get(userController.getAllUsers);
router
  .route("/:id")
  .get(userController.getUserById)
  .patch(userController.updateUser);

module.exports = router;
