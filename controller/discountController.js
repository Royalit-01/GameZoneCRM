const Discount = require("../models/Discount"); // Import the Discount model
const Coupon = require("../models/coupon"); // Assuming you have a Coupon model

// Create new discount
exports.createDiscount = async (req, res) => {
  try {
    const discount = new Discount(req.body);
    await discount.save();
    res.status(201).json({ message: "Discount saved successfully", discount });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// 
exports.getTodaysDiscount = async (req, res) => {
  try {
    const today = new Date();
    const todayDate = today.toISOString().slice(0, 10); // YYYY-MM-DD

    // Format current time as HH:mm with leading zeros
    const pad = (num) => num.toString().padStart(2, "0");
    const currentTime = `${pad(today.getHours())}:${pad(today.getMinutes())}`;

    const todayDiscount = await Discount.findOne({
      startDate: { $lte: todayDate },
      endDate: { $gte: todayDate },
      startTime: { $lte: currentTime },
      endTime: { $gte: currentTime },
    });

    if (todayDiscount) {
      res.json(todayDiscount);
    } else {
      res.json({ message: "No discount available today" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all discounts
exports.getDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find();
    res.json(discounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a discount by ID
exports.deleteDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Discount.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Discount not found" });
    }
    res.json({ message: "Discount deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get discount coupon by code
exports.getDiscountCoupon = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const discount = await Coupon.findOne({ code: code.trim() });

    if (!discount) {
      return res.status(404).json({ message: "Discount coupon not found" });
    }

    const now = new Date();
    const isExpired = discount.expiresAt < now;

    res.status(200).json({
      success: true,
      data: {
        code: discount.code,
        store: discount.store,
        discountType: discount.discountType,
        value: discount.value,
        startDate: discount.startDate,
        expiresAt: discount.expiresAt,
        used: discount.used,
        isExpired,
        freeSnacks: discount.freeSnacks || [],
        createdAt: discount.createdAt,
      },
    });
  } catch (err) {
    console.error("Error fetching discount coupon:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// controllers/discountController.js
exports.updateCouponUsedStatus = async (req, res) => {
  try {
    const { code } = req.params;

    const coupon = await Coupon.findOne({ code });
    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }

    coupon.used = true; // ✅ Mark as used
    await coupon.save();

    res.json({ success: true, message: "Coupon marked as used" });
  } catch (error) {
    console.error("Error updating coupon:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
