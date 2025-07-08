const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const crypto = require("crypto");
const forge = require("node-forge");
const { KJUR, hextob64 } = require("jsrsasign");
const { connectToDB } = require("./lib/mongoose");

const app = express();
dotenv.config();

// Middleware
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsOptions));
app.use(express.json());

//cookie parser
app.use(cookieParser());

// Connect to MongoDB
connectToDB();

// Import models
const Device = require("./models/Device");
const Receipt = require("./models/Receipt");
const FiscalCounter = require("./models/FiscalCounter");
const Taxpayer = require("./models/Taxpayer");

// API Routes
// API Routes with enhanced error handling
const routeFiles = [
  { path: "/api/auth", file: "./routes/auth" },
  { path: "/api/users", file: "./routes/users" },
  { path: "/api/devices", file: "./routes/devices" },
  { path: "/api/receipts", file: "./routes/receipts" },
  { path: "/api/fiscal", file: "./routes/fiscal" },
  { path: "/api/taxpayer", file: "./routes/taxpayers" },
  { path: "/api/subdomains", file: "./routes/subdomains" },
  { path: "/api/subscriptions", file: "./routes/subscriptions" },
];

routeFiles.forEach(({ path, file }) => {
  try {
    console.log(`Attempting to mount routes from ${file} at ${path}`);
    const router = require(file);
    if (router && typeof router === "function") {
      app.use(path, router);
      console.log(`Successfully mounted routes at ${path}`);
    } else {
      console.error(`Invalid router exported from ${file}`);
    }
  } catch (err) {
    console.error(`Error mounting routes from ${file}:`, err);
    // You might want to exit the process here if route mounting fails
    process.exit(1);
  }
});

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
