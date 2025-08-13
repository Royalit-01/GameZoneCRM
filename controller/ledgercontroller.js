const CustomerLedger = require("../models/ledger");
const Customer = require("../models/customer");
const logActivity = require("../utils/logActivity"); // assumes you abstracted logging to this helper

// Add a ledger entry
exports.addLedgerEntry = async (req, res) => {
  try {
    const ledgerId = req.params.customerId;
    const user = req.user;
    const { customer, date, time, description, amount, transactionType } =
      req.body;

    // Validate required fields
    if (
      !customer ||
      !date ||
      !time ||
      !description ||
      !amount ||
      !transactionType
    ) {
      return res
        .status(400)
        .json({ message: "Missing required transaction fields" });
    }

    // Build new transaction object
    const newTransaction = {
      customer,
      date,
      time,
      description,
      amount,
      transactionType,
    };

    // Find the ledger and push the new transaction
    const updatedLedger = await CustomerLedger.findByIdAndUpdate(
      ledgerId,
      { $push: { transactions: newTransaction } },
      { new: true } // Return updated document
    );

    if (!updatedLedger) {
      return res.status(404).json({ message: "Ledger not found" });
    }

    // ✅ Log the transaction activity
    await logActivity({
      employee: user?.name || "Unknown",
      action: "add entry",
      details: {
        customerId: updatedLedger.customer,
        customerName: updatedLedger.name,
        customerPhone: updatedLedger.phone,
        description,
        amount,
        transactionType,
        time,
      },
      store: user?.store || updatedLedger.store || "Unknown Store",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    return res.status(200).json(updatedLedger);
  } catch (error) {
    console.error("Error adding transaction:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

// Add a transaction
exports.addTransaction = async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const { date, description, amount, transactionType, bookingId } = req.body;
    const user = req.user;

    console.log("Booking ID:", bookingId);

    const customer = await Customer.findById(bookingId);
    console.log("Customer found:", customer);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    let ledger = await CustomerLedger.findOne({ phone: phoneNumber });
    console.log("Ledger found:", ledger);
    if (!ledger) {
      ledger = new CustomerLedger({
        customer: bookingId,
        name: customer.name,
        phone: phoneNumber,
        store: user?.store || customer.store,
        ledgerEntries: [],
        transactions: [],
      });
      await ledger.save();
    }

    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour12: false });
    ledger.transactions.push({
      customer: bookingId,
      date: now,
      time,
      description,
      amount,
      transactionType,
    });
    await ledger.save();

    // ✅ Log the transaction activity
    await logActivity({
      employee: user?.name || "Unknown",
      action: "add transaction",
      details: {
        customerId: customer._id,
        customerName: customer.name,
        customerPhone: customer.phone,
        description,
        amount,
        transactionType,
        time,
        date: now,
      },
      store: user?.store || ledger.store || "Unknown Store",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(201).json(ledger);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all ledgers (optionally with customer info)
exports.getAllLedgers = async (req, res) => {
  try {
    const ledgers = await CustomerLedger.find()
      .populate("customer")
      .populate("transactions.customer"); // populate nested customer in transactions;
    console.log("All ledgers:", ledgers);

    res.json(ledgers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
