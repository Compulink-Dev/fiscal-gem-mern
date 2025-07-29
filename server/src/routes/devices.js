import express from "express";
import {
  registerDevice,
  getDeviceStatus,
  getDeviceConfig,
} from "../controllers/deviceControllers.js";

const router = express.Router();

// Register a device
router.post("/register", registerDevice);

// Get device status
router.get("/:deviceID/status", getDeviceStatus);

// Get device config
router.get("/:deviceID/config", getDeviceConfig);

export default router;
