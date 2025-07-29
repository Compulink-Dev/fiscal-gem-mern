import Taxpayer from "../models/Taxpayer.js";
import Device from "../models/Device.js";

export const createTaxPayer = async (req, res) => {
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
};

export const getTaxpayerById = async (req, res) => {
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
};

export const getTaxpayerByDeviceId = async (req, res) => {
  try {
    const taxpayer = await Taxpayer.findOne({ deviceID: req.params.deviceID });
    if (!taxpayer) {
      return res.status(404).json({
        success: false,
        message: "Taxpayer not found for this device",
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
};
