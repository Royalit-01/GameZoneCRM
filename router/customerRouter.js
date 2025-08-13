const express = require("express");
const {
  addCustomer,
  getAllCustomers,
  updateCustomer,
  updateCustomerStatus,
  getStoreByNumber,
  getActiveScreens,
} = require("../controller/customerController");
const router = express.Router();
const customers = require("../models/customer"); // Your Mongoose model
const authMiddleware = require("../middleware/authMiddleware");
const customer = require("../models/customer");

// GET /api/customers/search?query=987
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    const results = await customers
      .find({
        phone: { $regex: query, $options: "i" },
      })
      .limit(5);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Search error" });
  }
});

// Add a new customer
router.post("/add", authMiddleware, addCustomer);

// Get all customers
router.get("/all", authMiddleware, getAllCustomers);

// Update customer details
router.put("/update/:id", updateCustomer);

// Update only customer status
router.patch("/status/:id", updateCustomerStatus);

// server.js or routes/bookings.js (example)

// Allowed screens
router.get("/active", authMiddleware, async (req, res) => {
  try {
    const screens = req.query.screens; // could be string or array
    const screenList = Array.isArray(screens) ? screens : [screens];
    const store = req.user.store;

    const bookings = await customer
      .find({
        screen: { $in: screenList },
        status: "active",
        store: store,
      })
      .lean();

    res.json(bookings);
  } catch (err) {
    console.error("Error fetching active bookings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// get all snacks and drinks
const { getAllSnacksAndDrinks } = require("../controller/customerController");
router.get("/snacksAndDrinks", getAllSnacksAndDrinks);

// Log activity endpoint

const logActivity = require("../utils/logActivity");

router.post("/log-activity-save", authMiddleware, async (req, res) => {
  const { action, details } = req.body;

  const employee = req.user?.username || req.user?.name || "Unknown";
  const store = req.user?.store || "Unknown";
  const ip = req.ip;
  const userAgent = req.headers["user-agent"];

  try {
    await logActivity({
      employee,
      action,
      details,
      store,
      ip,
      userAgent,
    });

    res.status(200).json({ message: "Activity logged" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to log activity", error: err.message });
  }
});

router.get("/getStoreByNumber/:number", getStoreByNumber);

router.get("/active-screens", authMiddleware, getActiveScreens);

module.exports = router;
