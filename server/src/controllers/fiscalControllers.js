import Device from "../models/Device.js";
import Receipt from "../models/Receipt.js";
import FiscalCounter from "../models/FiscalCounter.js";
import { KJUR, hextob64 } from "jsrsasign";

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

export const opdenFiscalDay = async (req, res) => {
  try {
    const device = await Device.findOne({ deviceID: req.params.deviceID });
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    const fiscalDayNo = device.lastFiscalDayNo + 1;

    // Update device status
    device.fiscalDayStatus = "FiscalDayOpened";
    device.lastReceiptCounter = 0;
    device.previousReceiptHash = "";
    device.fiscalDayOpenedAt = new Date();
    device.fiscalDayClosed = false;

    await device.save();

    res.json({
      message: "Fiscal day opened successfully",
      fiscalDayNo,
      fiscalDayStatus: device.fiscalDayStatus,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const closeFiscalDay = async (req, res) => {
  try {
    const device = await Device.findOne({ deviceID: req.params.deviceID });
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    const fiscalDayDate = device.fiscalDayOpenedAt;

    // Get all fiscal counters for this device and day
    const fiscalCounters = await FiscalCounter.find({
      deviceID: device.deviceID,
      fiscalDayNo: device.lastFiscalDayNo + 1,
    });

    // Aggregate counters (similar to your existing logic)
    const saleByTaxTotals = {};
    const saleTaxByTaxTotals = {};
    const balanceByMoneyTotals = {};
    const creditNoteByTaxTotals = {};
    const creditNoteTaxByTaxTotals = {};

    fiscalCounters.forEach((counter) => {
      const {
        fiscalCounterType,
        fiscalCounterCurrency,
        fiscalCounterTaxPercent,
        fiscalCounterMoneyType,
        fiscalCounterValue,
        fiscalCounterTaxID,
        fiscalCounterTaxAmountValue,
      } = counter;
      const value = fiscalCounterValue || 0;
      const taxValue = fiscalCounterTaxAmountValue || 0;

      if (fiscalCounterType === "SaleByTax") {
        // Group by currency and tax percent for SaleByTax
        const key = `${fiscalCounterCurrency}-${fiscalCounterTaxPercent}`;
        if (!saleByTaxTotals[key]) {
          saleByTaxTotals[key] = {
            fiscalCounterCurrency: fiscalCounterCurrency,
            fiscalCounterType: "SaleByTax",
            fiscalCounterValue: 0,
            fiscalCounterTaxPercent: fiscalCounterTaxPercent,
            fiscalCounterTaxID: fiscalCounterTaxID,
          };
          saleTaxByTaxTotals[key] = {
            fiscalCounterCurrency: fiscalCounterCurrency,
            fiscalCounterType: "SaleTaxByTax",
            fiscalCounterValue: 0,
            fiscalCounterTaxPercent: fiscalCounterTaxPercent,
            fiscalCounterTaxID: fiscalCounterTaxID,
          };
        }
        saleByTaxTotals[key].fiscalCounterValue += value;

        // Calculate and accumulate tax for SaleTaxByTax

        saleTaxByTaxTotals[key].fiscalCounterValue += taxValue;
      }

      if (fiscalCounterType === "CreditNoteByTax") {
        // Group by currency and tax percent for SaleByTax
        const key = `${fiscalCounterCurrency}-${fiscalCounterTaxPercent}`;
        if (!creditNoteByTaxTotals[key]) {
          creditNoteByTaxTotals[key] = {
            fiscalCounterCurrency: fiscalCounterCurrency,
            fiscalCounterType: "CreditNoteByTax",
            fiscalCounterValue: 0,
            fiscalCounterTaxPercent: fiscalCounterTaxPercent,
            fiscalCounterTaxID: fiscalCounterTaxID,
          };
          creditNoteTaxByTaxTotals[key] = {
            fiscalCounterCurrency: fiscalCounterCurrency,
            fiscalCounterType: "CreditNoteTaxByTax",
            fiscalCounterValue: 0,
            fiscalCounterTaxPercent: fiscalCounterTaxPercent,
            fiscalCounterTaxID: fiscalCounterTaxID,
          };
        }
        creditNoteByTaxTotals[key].fiscalCounterValue -= value;

        // Calculate and accumulate tax for SaleTaxByTax

        creditNoteTaxByTaxTotals[key].fiscalCounterValue -= taxValue;
      }

      // Calculate BalanceByMoney by grouping by currency and payment type (e.g., cash, card)
      if (fiscalCounterMoneyType) {
        const key = `${fiscalCounterCurrency}-${fiscalCounterMoneyType}`;
        if (!balanceByMoneyTotals[key]) {
          balanceByMoneyTotals[key] = {
            fiscalCounterCurrency: fiscalCounterCurrency,

            fiscalCounterType: "BalanceByMoneyType",
            fiscalCounterValue: 0,

            fiscalCounterMoneyType: fiscalCounterMoneyType,
          };
        }

        if (fiscalCounterType === "CreditNoteByTax") {
          balanceByMoneyTotals[key].fiscalCounterValue -= value;
        } else {
          balanceByMoneyTotals[key].fiscalCounterValue += value;
        }
      }
    });

    console.log("saleByTaxTotals: ", saleByTaxTotals);
    console.log("saleTaxByTaxTotals: ", saleTaxByTaxTotals);
    console.log("creditNoteByTaxTotals: ", creditNoteByTaxTotals);
    console.log("creditNoteTaxByTaxTotals: ", creditNoteTaxByTaxTotals);
    console.log("balanceByMoneyTotals: ", balanceByMoneyTotals);

    // Format the results for each counter type

    // Function to handle taxPercent formatting
    function formatTaxPercent(taxPercent) {
      if (taxPercent === null || taxPercent === undefined) {
        return ""; // Return empty string for missing/exempt tax percent
      }

      return Number.isInteger(taxPercent)
        ? `${taxPercent}.00` // If integer, format as 'x.00'
        : taxPercent.toFixed(2); // If decimal, format as 'x.xx'
    }

    // Convert amounts to cents (rounding to ensure integers)
    function convertToCents(amount) {
      return Math.round(amount * 100); // Multiply by 100 to convert to cents
    }

    const formattedSaleByTax = Object.values(saleByTaxTotals)
      .sort((a, b) => {
        // First, compare by currency (string comparison)
        if (a.fiscalCounterCurrency < b.fiscalCounterCurrency) return -1;
        if (a.fiscalCounterCurrency > b.fiscalCounterCurrency) return 1;
        // If currencies are the same, compare by tax percent (numeric comparison)
        return a.fiscalCounterTaxPercent - b.fiscalCounterTaxPercent;
      })
      .map(
        (item) =>
          `SALEBYTAX${item.fiscalCounterCurrency.toUpperCase()}${formatTaxPercent(
            item.fiscalCounterTaxPercent
          )}${convertToCents(item.fiscalCounterValue.toFixed(2))}`
      )
      .join("");

    const formattedSaleTaxByTax = Object.values(saleTaxByTaxTotals)
      .sort((a, b) => {
        // First, compare by currency (string comparison)
        if (a.fiscalCounterCurrency < b.fiscalCounterCurrency) return -1;
        if (a.fiscalCounterCurrency > b.fiscalCounterCurrency) return 1;
        // If currencies are the same, compare by tax percent (numeric comparison)
        return a.fiscalCounterTaxPercent - b.fiscalCounterTaxPercent;
      })
      .map(
        (item) =>
          `SALETAXBYTAX${item.fiscalCounterCurrency.toUpperCase()}${formatTaxPercent(
            item.fiscalCounterTaxPercent
          )}${convertToCents(item.fiscalCounterValue.toFixed(2))}`
      )
      .join("");

    const formattedCreditNoteByTaxTotals = Object.values(creditNoteByTaxTotals)
      .sort((a, b) => {
        // First, compare by currency (string comparison)
        if (a.fiscalCounterCurrency < b.fiscalCounterCurrency) return -1;
        if (a.fiscalCounterCurrency > b.fiscalCounterCurrency) return 1;
        // If currencies are the same, compare by tax percent (numeric comparison)
        return a.fiscalCounterTaxPercent - b.fiscalCounterTaxPercent;
      })
      .map(
        (item) =>
          `CREDITNOTEBYTAX${item.fiscalCounterCurrency.toUpperCase()}${formatTaxPercent(
            item.fiscalCounterTaxPercent
          )}${convertToCents(item.fiscalCounterValue.toFixed(2))}`
      )
      .join("");

    const formattedCreditNoteTaxByTaxTotals = Object.values(
      creditNoteTaxByTaxTotals
    )
      .sort((a, b) => {
        // First, compare by currency (string comparison)
        if (a.fiscalCounterCurrency < b.fiscalCounterCurrency) return -1;
        if (a.fiscalCounterCurrency > b.fiscalCounterCurrency) return 1;
        // If currencies are the same, compare by tax percent (numeric comparison)
        return a.fiscalCounterTaxPercent - b.fiscalCounterTaxPercent;
      })
      .map(
        (item) =>
          `CREDITNOTETAXBYTAX${item.fiscalCounterCurrency.toUpperCase()}${formatTaxPercent(
            item.fiscalCounterTaxPercent
          )}${convertToCents(item.fiscalCounterValue.toFixed(2))}`
      )
      .join("");

    const formattedBalanceByMoney = Object.values(balanceByMoneyTotals)
      .sort((a, b) => {
        // First, compare by currency (string comparison)
        if (a.fiscalCounterCurrency < b.fiscalCounterCurrency) return -1;
        if (a.fiscalCounterCurrency > b.fiscalCounterCurrency) return 1;
        if (a.fiscalCounterMoneyType < b.fiscalCounterMoneyType) return -1;
        if (a.fiscalCounterMoneyType > b.fiscalCounterMoneyType) return 1;
      })
      .map(
        (item) =>
          `BALANCEBYMONEYTYPE${item.fiscalCounterCurrency.toUpperCase()}${item.fiscalCounterMoneyType.toUpperCase()}${convertToCents(
            item.fiscalCounterValue.toFixed(2)
          )}`
      )
      .join("");

    const totalFiscalCounters = [
      ...Object.values(creditNoteByTaxTotals).map((item) => ({
        ...item,
        fiscalCounterValue: item.fiscalCounterValue.toFixed(2),
      })),
      ...Object.values(creditNoteTaxByTaxTotals).map((item) => ({
        ...item,
        fiscalCounterValue: item.fiscalCounterValue.toFixed(2),
      })),
      ...Object.values(saleByTaxTotals).map((item) => ({
        ...item,
        fiscalCounterValue: item.fiscalCounterValue.toFixed(2),
      })),
      ...Object.values(saleTaxByTaxTotals).map((item) => ({
        ...item,
        fiscalCounterValue: item.fiscalCounterValue.toFixed(2),
      })),

      ...Object.values(balanceByMoneyTotals).map((item) => ({
        ...item,
        fiscalCounterValue: item.fiscalCounterValue.toFixed(2),
      })),
    ];

    // Concatenate all results into a single string
    const fiscalDayCountersString = `${formattedCreditNoteByTaxTotals}${formattedCreditNoteTaxByTaxTotals}${formattedSaleByTax}${formattedSaleTaxByTax}${formattedBalanceByMoney}`;

    // // Generate hash and signature
    // const fiscalDayString = `${device.deviceID}${device.lastFiscalDayNo + 1}${
    //   device.fiscalDayOpenedAt.toISOString().split("T")[0]
    // }...`;

    // Concatenate values to generate hash string
    const fiscalDayString = `${device.deviceID}${device.lastFiscalDayNo}${fiscalDayDate}${fiscalDayCountersString}`;

    const hash = getHash(fiscalDayString);
    const signature = signData(fiscalDayString, device.privateKey);

    const fiscalDayDeviceSignature = {
      hash: hash,
      signature: signature,
    };

    // Update device status
    device.fiscalDayStatus = "FiscalDayClosed";
    device.fiscalDayClosed = true;
    device.lastFiscalDayNo += 1;

    await device.save();

    res.json({
      message: "Fiscal day closed successfully",
      fiscalDayNo: device.lastFiscalDayNo,
      fiscalDayStatus: device.fiscalDayStatus,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFiscalCounters = async (req, res) => {
  try {
    const { fiscalDayNo } = req.query;
    if (!fiscalDayNo) {
      return res.status(400).json({
        success: false,
        message: "fiscalDayNo parameter is required",
      });
    }

    const counters = await FiscalCounter.find({
      deviceID: req.params.deviceID,
      fiscalDayNo: parseInt(fiscalDayNo),
    }).lean();

    res.json({
      success: true,
      data: counters,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
