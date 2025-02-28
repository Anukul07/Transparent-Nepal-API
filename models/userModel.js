const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userScehma = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please provide your first name"],
    },
    lastName: {
      type: String,
      required: [true, "Please provide your last name"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email address"],
      validator: [validator.isEmail, "Please provide a valid email address"],
      unique: [true, "User with the email already exists"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Please provide your phone number"],
    },
    profilePicture: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    uploadedResume: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      required: false,
      default: "user",
      enum: ["admin", "user"],
    },
    active: {
      type: Boolean,
      required: false,
      default: true,
    },
    appliedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
    savedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
  },
  {
    timestamps: true,
  }
);

userScehma.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userScehma.methods.correctPassword = async function (
  canditatePassword,
  userPassword
) {
  return await bcrypt.compare(canditatePassword, userPassword);
};

const User = mongoose.model("User", userScehma);
module.exports = User;
