const express = require("express");
const router = express.Router();
const Taxpayer = require("../models/Taxpayer");
const Device = require("../models/Device");

// Create taxpayer
router.post("/", async (req, res) => {
  try {
    const { deviceID, tin, name, address, ...taxpayerData } = req.body;

    // Validate required fields
    if (!deviceID || !tin || !name || !address) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if device exists
    const device = await Device.findOne({ deviceID });
    if (!device) {
      return res.status(400).json({
        success: false,
        message: "Device not found",
      });
    }

    // Check if taxpayer already exists by TIN
    const existingTaxpayer = await Taxpayer.findOne({ tin });
    if (existingTaxpayer) {
      return res.status(400).json({
        success: false,
        message: "Taxpayer with this TIN already registered",
      });
    }

    // Create new taxpayer
    const taxpayer = new Taxpayer({
      deviceID,
      tin,
      name,
      address: {
        province: address.province,
        city: address.city,
        street: address.street,
        houseNo: address.houseNo,
      },
      ...taxpayerData,
    });

    await taxpayer.save();

    res.status(201).json({
      success: true,
      data: taxpayer,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message || "Server error during taxpayer registration",
    });
  }
});

// Get taxpayer details
// routes/taxpayers.js
const { protect } = require("../middleware/auth");

// Get taxpayer by ID (MongoDB _id)
router.get("/id/:id", protect, async (req, res) => {
  try {
    const taxpayer = await Taxpayer.findById(req.params.id);
    if (!taxpayer) {
      return res.status(404).json({
        success: false,
        message: "Taxpayer not found",
      });
    }
    res.json({
      success: true,
      data: taxpayer,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Keep existing route for deviceID lookup
router.get("/:deviceID", protect, async (req, res) => {
  // ... existing implementation
});

module.exports = router;
