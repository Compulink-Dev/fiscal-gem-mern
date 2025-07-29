import express from "express";
import { protect } from "../middleware/auth.js";
import {
  opdenFiscalDay,
  closeFiscalDay,
  getFiscalCounters,
} from "../controllers/fiscalControllers.js";

const router = express.Router();

// Open fiscal day
router.post("/:deviceID/open-day", opdenFiscalDay);

// Close fiscal day
router.post("/:deviceID/close-day", closeFiscalDay);

// Get fiscal counters for device and day
router.get("/:deviceID/counters", protect, getFiscalCounters);

export default router;
