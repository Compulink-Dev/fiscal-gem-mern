import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import { connectToDB } from "./lib/mongoose/index.js";

// Import models
// import Device from "./models/Device";
// import Receipt from "./models/Receipt";
// import FiscalCounter from "./models/FiscalCounter";
// import Taxpayer from "./models/Taxpayer";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import deviceRoutes from "./routes/devices.js";
import receiptRoutes from "./routes/receipts.js";
import fiscalRoutes from "./routes/fiscal.js";
import taxpayerRoutes from "./routes/taxpayers.js";
import subdomainRoutes from "./routes/subdomains.js";
import subscriptionRoutes from "./routes/subscriptions.js";

const app = express();
dotenv.config();

console.log("Origins : ", process.env.CLIENT_URL);

const allowedOrigins = [
  "http://localhost:3000", // web dev
  "http://localhost:5174",
  "http://localhost:5173",
  "http://192.168.0.186:19000", // Expo Go Dev
  "http://192.168.0.186:8081", // Metro Bundler
  process.env.CLIENT_URL, // From .env
];

// Middleware

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked CORS request from:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
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

// API Routes
// API Routes with debugging
const routes = [
  { path: "/api/auth", router: authRoutes },
  { path: "/api/users", router: userRoutes },
  { path: "/api/devices", router: deviceRoutes },
  { path: "/api/receipts", router: receiptRoutes },
  { path: "/api/fiscal", router: fiscalRoutes },
  { path: "/api/taxpayer", router: taxpayerRoutes },
  { path: "/api/subdomains", router: subdomainRoutes },
  { path: "/api/subscriptions", router: subscriptionRoutes },
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
