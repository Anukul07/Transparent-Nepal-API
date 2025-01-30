const express = require("express");
const morgan = require("morgan");
const userRouter = require("./routes/userRoutes");
const authController = require("./controllers/authController");
const app = express();

app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/v1/users", userRouter);
app.use(authController.globalErrorHandler);

module.exports = app;
