const express = require("express");
const morgan = require("morgan");
const userRouter = require("./routes/userRoutes");
const companyRouter = require("./routes/companyRoutes");
const jobRouter = require("./routes/jobRoutes");
const authController = require("./controllers/authController");
const path = require("path");
const cors = require("cors");
const app = express();

// Enable CORS for all routes
app.use(cors());

// OR, to allow only your frontend origin
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests only from this frontend
    methods: "GET,POST,PUT,PATCH,DELETE", // Allowed HTTP methods
    allowedHeaders: "Content-Type,Authorization", // Allowed headers
    credentials: true, // Allow cookies (if needed)
  })
);

app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/v1/users", userRouter);
app.use("/api/v1/companies", companyRouter);
app.use("/api/v1/jobs", jobRouter);
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use(
  "/uploadProfile",
  express.static(path.join(__dirname, "public/uploads/profiles"))
);
app.use(authController.globalErrorHandler);

module.exports = app;
