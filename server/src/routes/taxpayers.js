import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createTaxPayer,
  getTaxpayerByDeviceId,
  getTaxpayerById,
} from "../controllers/taxpayerControllers.js";

const router = express.Router();

// Create taxpayer
router.post("/", createTaxPayer);

// Get taxpayer details
// routes/taxpayers.js

// Get taxpayer by ID (MongoDB _id)
router.get("/id/:id", protect, getTaxpayerById);

// Get taxpayer by deviceID
router.get("/:deviceID", protect, getTaxpayerByDeviceId);

export default router;
