// Get attendance by date
// routes/customerRoutes.js
const express = require("express");
const router = express.Router();
const { getAllCustomers } = require("../controller/adminController");
const {
  deleteCustomer,
  updateCustomer,
  getLedgers,
  getAllStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} = require("../controller/adminController");
const {
  saveAttendance,
  getMonthlyAttendanceSummary,
} = require("../controller/adminController");
const {
  getAllSnacksAndDrinks,
  createSnacksAndDrink,
  updateSnacksAndDrink,
  deleteSnacksAndDrink,
} = require("../controller/adminController");
const ActivityLog = require("../models/ActivityLog");
const Coupon = require("../models/Coupon");
const {
  saveStoreData,
  getAllStores,
  updateStoreData,
  deleteStore,
} = require("../controller/storeController");
const { loginAdmin } = require("../controller/adminController");
const { getAttendanceByDate } = require("../controller/adminController");


// Admin Routes
router.post("/login", loginAdmin);
router.get("/attendance", getAttendanceByDate);

//customer routes
router.get("/active", getAllCustomers);
router.delete("/customers/:id", deleteCustomer);
router.put("/customers/update/:id", updateCustomer);
router.get("/", getLedgers);

// routes/staffRoutes.js
router.get("/staff", getAllStaff);
router.post("/staff/add", createStaff);
router.put("/staff/:id", updateStaff);
router.delete("/staff/:id", deleteStaff);

//snacks and drinks routes
router.get("/snacks-and-drinks", getAllSnacksAndDrinks);
router.post("/snacks-and-drinks", createSnacksAndDrink);
router.put("/snacks-and-drinks/:id", updateSnacksAndDrink);
router.delete("/snacks-and-drinks/:id", deleteSnacksAndDrink);

// Attendance Routes
router.post("/attendance", saveAttendance);
router.get("/attendance/summary", getMonthlyAttendanceSummary);

// Activity Log Routes
router.get("/activity/logs", async (req, res) => {
  try {
    const { start, end } = req.query;
    const query = {};

    if (start && end) {
      query.timestamp = { $gte: new Date(start), $lte: new Date(end) };
    } else {
      // 🕐 default: today's logs
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      query.timestamp = { $gte: today, $lt: tomorrow };
    }

    const logs = await ActivityLog.find(query).sort({ timestamp: -1 }).lean();
    res.json(logs);
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
});

// create-bulk-coupons
router.post("/create-bulk-coupons", async (req, res) => {
  const { codes, discountType, value, startDate, endDate, freeSnacks, store } =
    req.body;

  if (
    !codes?.length ||
    !discountType ||
    !value ||
    !startDate ||
    !endDate ||
    !store
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const couponsToInsert = codes.map((code) => ({
      code,
      store,
      discountType,
      value,
      startDate: new Date(startDate),
      expiresAt: new Date(endDate),
      freeSnacks: Array.isArray(freeSnacks) ? freeSnacks : [],
      used: false,
    }));

    const createdCoupons = await Coupon.insertMany(couponsToInsert);

    res.status(200).json({
      success: true,
      count: createdCoupons.length,
      message: `${createdCoupons.length} coupons created successfully.`,
    });
  } catch (err) {
    console.error("Coupon creation failed:", err);
    res.status(500).json({ message: "Server error while creating coupons" });
  }
});

// Get all coupons
router.get("/getAll-coupons", async (req, res) => {
  try {
    const coupons = await Coupon.find().lean();
    res.json(coupons);
  } catch (err) {
    console.error("Error fetching coupons:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Store Routes

// save store data
router.post("/save-store", saveStoreData);
// get all store data
router.get("/get-all-stores", getAllStores);
// update store data
router.put("/update-store/:storeNumber", updateStoreData);
// delete store data
router.delete("/delete-store/:storeNumber", deleteStore);

module.exports = router;
