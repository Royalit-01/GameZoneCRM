const jwt = require("jsonwebtoken");
const Staff = require("../models/staff"); // Adjust path if needed
const logActivity = require("../utils/logActivity");
const Store = require("../models/Store");

exports.login = async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    const staff = await Staff.findOne({ number: phoneNumber });

    if (!staff || staff.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Check if staff.store matches any store number in the Stores collection
    const matchedStore = await Store.findOne({ number: staff.store });

    if (!matchedStore) {
      return res.status(400).json({
        message: `Store number ${staff.store} is not registered. Please contact Admin.`,
      });
    }

    // 🔐 Generate JWT with store info
    const token = jwt.sign(
      {
        id: staff._id,
        name: staff.name,
        store: staff.store, // 🏬 include store number
      },
      process.env.JWT_SECRET || "your-secret-key", // Use .env in production!
      { expiresIn: "8h" }
    );

    // ✅ Log the login activity
    await logActivity({
      employee: staff.name,
      action: "login",
      store: staff.store,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
    res.json({
      message: "Login successful",
      token,
      staff: {
        id: staff._id,
        name: staff.name,
        store: staff.store,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
