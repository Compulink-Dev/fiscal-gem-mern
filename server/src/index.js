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
  origin: "https://fiscal-gem-mern.onrender.com",
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
// API Routes with debugging
const routes = [
  { path: "/api/auth", router: require("./routes/auth") },
  { path: "/api/users", router: require("./routes/users") },
  { path: "/api/devices", router: require("./routes/devices") },
  { path: "/api/receipts", router: require("./routes/receipts") },
  { path: "/api/fiscal", router: require("./routes/fiscal") },
  { path: "/api/taxpayer", router: require("./routes/taxpayers") },
  { path: "/api/subdomains", router: require("./routes/subdomains") },
  { path: "/api/subscriptions", router: require("./routes/subscriptions") },
];

routes.forEach(({ path, router }) => {
  console.log(`Mounting routes at ${path}`);
  app.use(path, router);
});

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {
  // Serve static files
  app.use(express.static("client/build"));

  // Handle React routing, return all requests to React app
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
