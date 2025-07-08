const express = require("express");
const router = express.Router();
const Device = require("../models/Device");
const { generateKeyPairSync } = require("crypto");
const forge = require("node-forge");
const axios = require("axios");

// ... (keep existing helper functions)

// Enhanced register endpoint
router.post("/register", async (req, res) => {
  try {
    const { deviceID, activationKey, serialNo, version, taxpayerInfo } =
      req.body;

    // Validate required fields
    if (!deviceID || !activationKey || !serialNo || !version) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if device exists
    let device = await Device.findOne({ deviceID });
    if (device) {
      return res.status(400).json({ message: "Device already registered" });
    }

    // Generate keys and CSR
    const { privateKey, publicKey } = getOrCreateKeyPair(deviceID);
    const csr = generateCSR(privateKey, publicKey, serialNo, deviceID);

    // Call ZIMRA API to register device
    const zimraResponse = await axios.post(
      `${process.env.FDMS_API_URL}/Public/v1/RegisterDevice`,
      {
        deviceID,
        activationKey,
        certificateRequest: csr,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (zimraResponse.status !== 200) {
      throw new Error("FDMS registration failed");
    }

    // Create new device with all required data
    device = new Device({
      deviceID,
      activationKey,
      serialNo,
      version,
      certificate: zimraResponse.data.certificate,
      publicKey,
      privateKey,
      operationID: zimraResponse.data.operationID,
      taxPayerName: taxpayerInfo?.name,
      taxPayerTIN: taxpayerInfo?.tin,
      vatNumber: taxpayerInfo?.vatNumber,
      deviceBranchName: taxpayerInfo?.branchName,
      deviceBranchAddress: taxpayerInfo?.branchAddress,
      deviceBranchContacts: taxpayerInfo?.branchContacts,
      status: "active",
      operatingMode: "ONLINE",
      fiscalDayStatus: "FiscalDayClosed",
      lastReceiptCounter: 0,
      lastReceiptGlobalNo: 0,
      lastFiscalDayNo: 0,
    });

    await device.save();

    res.status(201).json({
      success: true,
      device: {
        id: device._id,
        deviceID: device.deviceID,
        serialNo: device.serialNo,
        status: device.status,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message || "Server error during device registration",
    });
  }
});

// ... keep other existing routes

module.exports = router;
