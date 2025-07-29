import express from "express";
import { protect } from "../middleware/auth.js";
import {
  submitReceipt,
  getDeviceReceipts,
  getTenantReceipts,
} from "../controllers/receiptsControllers.js";

const router = express.Router();

// Submit a receipt
router.post("/submit", submitReceipt);

// Get receipts for a device
router.get("/device/:deviceID", protect, getDeviceReceipts);

// Get receipts for a tenant
router.get("/tenant/:tenantID", protect, getTenantReceipts);

export default router;
