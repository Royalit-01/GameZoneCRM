// controllers/customerController.js
const { constants } = require("fs/promises");
const Customer = require("../models/customer");
const CustomerLedger = require("../models/ledger");
const Staff = require("../models/staff");
const SnacksAndDrink = require("../models/SnacksAndDrink");
const AdminCredentials = require("../models/AdminCredentials");

exports.loginAdmin = async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ message: "Phone and password are required" });
  }

  try {
    const admin = await AdminCredentials.findOne({ phone });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.password !== password) {
      return res.status(401).json({ message: "Invalid phone or password" });
    }

    // ✅ Login success
    return res.status(200).json({
      message: "Login successful",
      adminId: admin._id,
      phone: admin.phone,
    });
  } catch (error) {
    console.error("Error logging in admin:", error);
    return res.status(500).json({ message: "Server error logging in admin" });
  }
};

exports.getActiveCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({
      status: { $in: ["active", "upcoming"] },
    })
      .sort({ created_at: -1 })
      .lean();

    res.json(customers);
  } catch (error) {
    console.error("Error fetching active customers:", error);
    res.status(500).json({ message: "Server error fetching active customers" });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCustomer = await Customer.findByIdAndDelete(id);
    if (!deletedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ message: "Server error deleting customer" });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    console.log("Update data:", updateData);

    const customer = await Customer.findByIdAndUpdate(id, updateData, {
      new: true,
      upsert: false, // Do not create new on update
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    console.log("Updated customer:", customer);
    res
      .status(200)
      .json({ message: "Customer details updated successfully", customer });
  } catch (error) {
    res.status(500).json({
      message: "Error updating customer details",
      error: error.message,
    });
  }
};

exports.getLedgers = async (req, res) => {
  try {
    // Fetch all ledgers with populated customer info
    const ledgers = await CustomerLedger.find()
      .populate("customer", "name phone") // get customer name and phone
      .lean();

    // Calculate total ledger amount for each ledger
    const ledgersWithTotal = ledgers.map((ledger) => {
      const totalAmount = ledger.transactions.reduce((acc, txn) => {
        return txn.transactionType === "credit"
          ? acc + txn.amount
          : acc - txn.amount;
      }, 0);

      return {
        _id: ledger._id,
        customerId: ledger.customer?._id,
        name: ledger.customer?.name || "Unknown",
        phoneNumber: ledger.customer?.phone || "N/A",
        ledgerAmount: totalAmount,
        // You can add other fields if needed
      };
    });

    console.log(ledgersWithTotal);

    res.json(ledgersWithTotal);
  } catch (error) {
    console.error("Error fetching ledgers:", error);
    res.status(500).json({ message: "Server error fetching ledgers" });
  }
};

// Get all staff
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create new staff
exports.createStaff = async (req, res) => {
  const { name, number, password, adhar, role, store } = req.body;

  if (!name || !password || !adhar) {
    return res
      .status(400)
      .json({ message: "Name, password, and Aadhaar are required." });
  }

  try {
    const newStaff = new Staff({
      name,
      number,
      password,
      adhar,
      role: role || "staff",
      store: store || 0,
    });

    const savedStaff = await newStaff.save();
    res.status(201).json(savedStaff);
  } catch (err) {
    console.error("Error creating staff:", err);
    res.status(400).json({ message: err.message });
  }
};

// Update staff by ID
exports.updateStaff = async (req, res) => {
  try {
    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedStaff)
      return res.status(404).json({ message: "Staff not found" });
    res.json(updatedStaff);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete staff by ID
exports.deleteStaff = async (req, res) => {
  try {
    const deletedStaff = await Staff.findByIdAndDelete(req.params.id);
    if (!deletedStaff)
      return res.status(404).json({ message: "Staff not found" });
    res.json({ message: "Staff deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const { date } = req.query; // ⬅️ get optional ?date=YYYY-MM-DD

    const query = {};

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999); // end of that day

      query.created_at = {
        $gte: start,
        $lte: end,
      };
    }

    const customers = await Customer.find(query);

    res.status(200).json(customers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching customers", error: error.message });
  }
};

// GET all snacks & drinks
exports.getAllSnacksAndDrinks = async (req, res) => {
  try {
    const items = await SnacksAndDrink.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching snacks" });
  }
};

// POST new item
exports.createSnacksAndDrink = async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const newItem = new SnacksAndDrink({ name, price, category });
    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Error creating item" });
  }
};

// PUT update
exports.updateSnacksAndDrink = async (req, res) => {
  try {
    const updated = await SnacksAndDrink.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Item not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating item" });
  }
};

// DELETE item
exports.deleteSnacksAndDrink = async (req, res) => {
  try {
    const deleted = await SnacksAndDrink.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting item" });
  }
};

const Attendance = require("../models/attendance");

// POST /api/admin/attendance
exports.saveAttendance = async (req, res) => {
  try {
    const { date, time = null, records } = req.body;

    console.log("🟢 Received attendance:", { date, time, records });

    // Validation
    if (
      !date ||
      !Array.isArray(records) ||
      records.length === 0 ||
      records.some(
        (r) =>
          !r.name ||
          !r.phone ||
          typeof r.store !== "number" ||
          !["present", "absent", "half-day"].includes(r.status)
      )
    ) {
      return res
        .status(400)
        .json({ message: "❌ Missing or invalid fields in attendance data" });
    }

    // Save or update attendance by (date + time) combination
    const updated = await Attendance.findOneAndUpdate(
      { date, time },
      { date, time, records },
      { new: true, upsert: true }
    );

    console.log("✅ Attendance saved:", updated);
    res.status(200).json(updated);
  } catch (error) {
    console.error("🔥 Error saving attendance:", error);
    res.status(500).json({
      message: "Server error saving attendance",
      error: error.message,
    });
  }
};

// GET /api/admin/attendance/summary?month=YYYY-MM

exports.getMonthlyAttendanceSummary = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res
        .status(400)
        .json({ message: "Month must be in YYYY-MM format" });
    }

    // Fetch all attendance records for the given month
    const entries = await Attendance.find({
      date: { $regex: `^${month}` },
    });

    const summary = {};

    for (const entry of entries) {
      const entryDate = entry.date;
      for (const { name, phone, store, status } of entry.records) {
        const key = `${name}-${phone}-${store}`;

        if (!summary[key]) {
          summary[key] = {
            name,
            phone,
            store,
            present: 0,
            absent: 0,
            halfDay: 0,
            days: [],
          };
        }

        if (status === "present") summary[key].present += 1;
        if (status === "absent") summary[key].absent += 1;
        if (status === "half-day") summary[key].halfDay += 1;

        summary[key].days.push({ date: entryDate, status });
      }
    }

    res.json(Object.values(summary));
  } catch (error) {
    console.error("🔥 Error fetching monthly summary:", error);
    res
      .status(500)
      .json({ message: "Server error fetching summary", error: error.message });
  }
};
