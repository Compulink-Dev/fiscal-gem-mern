// routes/subdomains.js
import express from "express";
import {
  createSubdomain,
  getSubdomain,
  getSubdomainById,
  updateSubdomain,
  deleteSubdomain,
} from "../controllers/subdomainControllers.js";

const router = express.Router();

// Create subdomain
router.post("/", createSubdomain);

// Get all subdomains for a taxpayer
router.get("/taxpayer/:taxpayerId", getSubdomain);

// Get subdomain by ID
router.get("/:id", getSubdomainById);

// Update subdomain
router.put("/:id", updateSubdomain);

// Delete subdomain
router.delete("/:id", deleteSubdomain);

export default router;
