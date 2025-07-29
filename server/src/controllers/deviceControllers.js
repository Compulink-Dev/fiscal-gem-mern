import Device from "../models/Device.js";
import { generateKeyPairSync } from "crypto";
import forge from "node-forge";

// Get or create key pair
function getOrCreateKeyPair(deviceID) {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    privateKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
    publicKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
  });
  return { privateKey, publicKey };
}

// Generate CSR
function generateCSR(privateKey, publicKey, serialNumber, deviceID) {
  const pki = forge.pki;
  const paddedDeviceID = deviceID.toString().padStart(10, "0");
  const prKey = pki.privateKeyFromPem(privateKey);
  const pubKey = pki.publicKeyFromPem(publicKey);

  const csr = pki.createCertificationRequest();
  csr.publicKey = pubKey;
  csr.setSubject([
    {
      name: "commonName",
      value: `ZIMRA-${serialNumber}-${paddedDeviceID}`,
    },
  ]);

  csr.setAttributes([]);
  csr.sign(prKey, forge.md.sha256.create());

  if (!csr.verify()) {
    throw new Error("CSR verification failed!");
  }

  return pki.certificationRequestToPem(csr);
}

export const registerDevice = async (req, res) => {
  try {
    const { deviceID, activationKey, serialNo, version, taxpayerId } = req.body;

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

    // Here you would call the ZIMRA API to register the device
    // For now, we'll simulate a successful registration
    const certificate = csr; // Replace with actual API call

    // Create new device
    device = new Device({
      deviceID,
      taxpayerId,
      activationKey,
      serialNo,
      version,
      certificate,
      publicKey,
      privateKey,
      operationID: "SIMULATED-OPERATION-ID", // Replace with actual call
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
};

export const getDeviceStatus = async (req, res) => {
  try {
    const device = await Device.findOne({ deviceID: req.params.deviceID });
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    res.json({
      fiscalDayStatus: device.fiscalDayStatus,
      operationID: device.operationID,
      fiscalDayClosed: device.fiscalDayClosed,
      lastReceiptGlobalNo: device.lastReceiptGlobalNo,
      lastFiscalDayNo: device.lastFiscalDayNo,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getDeviceConfig = async (req, res) => {
  try {
    const device = await Device.findOne({ deviceID: req.params.deviceID });
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    res.json({
      operatingMode: device.operatingMode,
      operationID: device.operationID,
      certificateValidTill: device.certificateValidTill,
      taxPayerName: device.taxPayerName,
      taxPayerTIN: device.taxPayerTIN,
      deviceBranchName: device.deviceBranchName,
      deviceBranchAddress: device.deviceBranchAddress,
      deviceBranchContacts: device.deviceBranchContacts,
      applicableTaxes: device.applicableTaxes,
      vatNumber: device.vatNumber,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
