const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Receipt = require("../models/Receipt");
const Device = require("../models/Device");
const Taxpayer = require("../models/Taxpayer");
const FiscalCounter = require("../models/FiscalCounter");
const { KJUR, hextob64 } = require("jsrsasign");
const { protect } = require("../middleware/auth");

// Helper functions
function getHash(data) {
  const hashHex = KJUR.crypto.Util.sha256(data);
  return hextob64(hashHex);
}

function signData(data, privateKey) {
  const sig = new KJUR.crypto.Signature({ alg: "SHA256withRSA" });
  sig.init(privateKey);
  sig.updateString(data);
  const encryptedHex = sig.sign();
  return hextob64(encryptedHex);
}

// Submit a receipt
router.post("/submit", async (req, res) => {
  try {
    const { deviceID, receiptData } = req.body;

    const device = await Device.findOne({ deviceID });
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    // Generate receipt counter and global number
    const receiptCounter = device.lastReceiptCounter + 1;
    const receiptGlobalNo = device.lastReceiptGlobalNo + 1;

    // Generate hash and signature
    const receiptStringToHash = `${deviceID}${receiptData.receiptType.toUpperCase()}...`;
    const hash = getHash(receiptStringToHash);
    const signature = signData(receiptStringToHash, device.privateKey);

    // Create receipt
    const receipt = new Receipt({
      deviceID,
      receiptCounter,
      receiptGlobalNo,
      ...receiptData,
      receiptDeviceSignature: { hash, signature },
      fiscalDayNo: device.lastFiscalDayNo + 1,
    });

    await receipt.save();

    // Update device counters
    device.lastReceiptCounter = receiptCounter;
    device.lastReceiptGlobalNo = receiptGlobalNo;
    device.previousReceiptHash = hash;
    await device.save();

    // Create fiscal counters
    for (const tax of receiptData.receiptTaxes) {
      const fiscalCounter = new FiscalCounter({
        deviceID,
        fiscalCounterType:
          receiptData.receiptType === "FiscalInvoice"
            ? "SaleByTax"
            : "CreditNoteByTax",
        fiscalCounterCurrency: receiptData.receiptCurrency,
        fiscalCounterTaxPercent: tax.taxPercent,
        fiscalCounterTaxID: tax.taxID,
        fiscalCounterValue: tax.salesAmountWithTax,
        fiscalCounterTaxAmountValue: tax.taxAmount,
        fiscalDayNo: device.lastFiscalDayNo + 1,
      });

      await fiscalCounter.save();
    }

    res.status(201).json(receipt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get receipts for a device
router.get("/device/:deviceID", protect, async (req, res) => {
  try {
    const { limit = 5, sort = "-receiptDate" } = req.query;

    const receipts = await Receipt.find({ deviceID: req.params.deviceID })
      .sort(sort)
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: receipts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get receipts for a tenant
router.get("/tenant/:tenantID", protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "-receiptDate", search } = req.query;

    // Validate tenantID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.tenantID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tenant ID format",
      });
    }

    // Check if tenant exists
    const tenantExists = await Taxpayer.exists({ _id: req.params.tenantID });
    if (!tenantExists) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    const query = {
      tenant: new mongoose.Types.ObjectId(req.params.tenantID),
    };

    if (search) {
      query.$or = [
        { invoiceNo: { $regex: search, $options: "i" } },
        { "buyerData.name": { $regex: search, $options: "i" } },
      ];
    }

    const [receipts, count] = await Promise.all([
      Receipt.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean(),
      Receipt.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: receipts,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

module.exports = router;
