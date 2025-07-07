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
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/devices", require("./routes/devices"));
app.use("/api/receipts", require("./routes/receipts"));
app.use("/api/fiscal", require("./routes/fiscal"));
app.use("/api/taxpayer", require("./routes/taxpayers"));
app.use("/api/subdomains", require("./routes/subdomains"));
app.use("/api/subscriptions", require("./routes/subscriptions"));

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
