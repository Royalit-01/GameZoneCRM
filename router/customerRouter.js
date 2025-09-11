const express = require("express");
const {
  addCustomer,
  getAllCustomers,
  updateCustomer,
  updateCustomerStatus,
  getStoreByNumber,
  getActiveScreens,
  getAllowedScreens,
  getLogActivity,
  updateCustomerWithGameSession
} = require("../controller/customerController");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const customer = require("../models/customer");
const logActivity = require("../utils/logActivity");
const { getAllSnacksAndDrinks } = require("../controller/customerController");


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

// Update customer with game session
router.put("/update-session/:id", updateCustomerWithGameSession);

// Update only customer status
router.patch("/status/:id", updateCustomerStatus);


// Allowed screens
router.get("/active", authMiddleware, getAllowedScreens );

// get all snacks and drinks
router.get("/snacksAndDrinks", getAllSnacksAndDrinks);

// Log activity endpoint


router.post("/log-activity-save", authMiddleware, getLogActivity);

router.get("/getStoreByNumber/:number", getStoreByNumber);

router.get("/active-screens", authMiddleware, getActiveScreens);

module.exports = router;
