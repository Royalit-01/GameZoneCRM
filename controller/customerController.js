const Customer = require("../models/customer"); // Adjust path as needed
const CustomerLedger = require("../models/ledger");

const SnacksAndDrinks = require("../models/SnacksAndDrink"); // Adjust path as needed
const logActivity = require("../utils/logActivity");
const Store = require("../models/Store");
const Payment = require("../models/Payment");

exports.addCustomer = async (req, res) => {
  try {
    const {
      name,
      phone,
      screen,
      game,
      time,
      snacks,
      drink,
      paid,
      players,
      nonPlayingMembers,
      total_amount,
      store,
      payment,
      discount,
      remainingAmount,
      couponDetails,
      onlineAmount,
      cashAmount,
    } = req.body;
    console.log("Received booking data:", req.body);

    // Basic validation
    if (!name || !phone  || total_amount === undefined) {
      return res.status(400).json({
        message:
          "Missing required fields: name, phone, screen, time, or total_amount",
      });
    }

    const customer = new Customer({
      name,
      phone,
      screen,
      game,
      duration: time,
      snacks,
      drink,
      players,
      nonPlayingMembers,
      extended_amount: 0, // default or calculate if needed
      paid: paid, // match schema
      total_amount,
      store,
      wallet: 0,
      payment,
      discount: discount || "not available", // Add discount field if provided
      remainingAmount,
      couponDetails,
    });
    await customer.save();

    const paymentIn = new Payment({
      customerId: customer._id,
      onlineAmount,
      cashAmount,
    });
    await paymentIn.save();


    // ✅ Log the "create order" activity
    await logActivity({
      employee: req.user?.name || "Unknown",
      action: "create order",
      details: {
        customerId: customer._id,
        name,
        phone,
        screen,
        game,
        duration: time,
        snacks,
        drink,
        players,
        nonPlayingMembers,
        payment_mode: payment,
        game_price: paid,
        discount: discount || "not available",
        couponDetails,
        total_amount: total_amount,
      },
      store: req.user?.store || store,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(201).json({ message: "Booking saved successfully", customer });
  } catch (error) {
    console.error("Error saving booking:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
exports.getAllCustomers = async (req, res) => {
  try {
    const store = req.user.store;
    const { date } = req.query; // ⬅️ get optional ?date=YYYY-MM-DD

    const query = { store };

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

// Update only customer status
exports.updateCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }
    const customer = await Customer.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res
      .status(200)
      .json({ message: "Customer status updated successfully", customer });
  } catch (error) {
    res.status(500).json({
      message: "Error updating customer status",
      error: error.message,
    });
  }
};

// Get all snacks and drinks
exports.getAllSnacksAndDrinks = async (req, res) => {
  try {
    const snacksAndDrinks = await SnacksAndDrinks.find();
    res.json(snacksAndDrinks);
  } catch (err) {
    console.error("Error fetching snacks and drinks:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getStoreByNumber = async (req, res) => {
  try {
    const store = await Store.findOne({ number: req.params.number });
    if (!store) return res.status(404).json({ error: "Store not found" });
    res.status(200).json(store);
  } catch (err) {
    console.error("❌ Error fetching store by number:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get active screens only
exports.getActiveScreens = async (req, res) => {
  try {
    // Store ID should be set in authMiddleware (req.user.store)
    const storeId = req.user?.store;
    if (!storeId) {
      return res.status(400).json({ error: "Store ID missing in request" });
    }

    const activeScreens = await Customer.find(
      { status: "active", store: storeId }, // ✅ Filter by store
      { screen: 1, _id: 0 }
    );

    // Lowercase, remove null/empty, and deduplicate
    const screens = [
      ...new Set(
        activeScreens.map((s) => (s.screen || "").toLowerCase()).filter(Boolean)
      ),
    ];

    res.json(screens);
  } catch (err) {
    console.error("Error fetching active screens:", err);
    res.status(500).json({ error: "Failed to fetch active screens" });
  }
};

exports.getAllowedScreens = async (req, res) => {
  try {
    const screens = req.query.screens; // could be string or array
    const screenList = Array.isArray(screens) ? screens : [screens];
    const store = req.user.store;

    // Fetch active bookings for the given screens and store
    const bookings = await Customer.find({
      screen: { $in: screenList },
      status: "active",
      store: store,
    }).lean();

    // Fetch all payments for these bookings using orderId
    const payments = await Payment.find({
      orderId: { $in: bookings.map(b => b._id) }
    }).lean();

    // Create a map for quick lookup
    const paymentMap = {};
    payments.forEach(payment => {
      paymentMap[payment.orderId.toString()] = payment;
    });

    // Attach payment details to each booking
    bookings.forEach(booking => {
      const payment = paymentMap[booking._id.toString()];
      if (payment) {
        booking.onlineAmount = payment.onlineAmount;
        booking.cashAmount = payment.cashAmount;
      }
    });
    console.log('bookings', bookings)
    res.json(bookings);
  } catch (err) {
    console.error("Error fetching active bookings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}


//  Get log activity 
exports.getLogActivity = async (req, res) => {
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
}