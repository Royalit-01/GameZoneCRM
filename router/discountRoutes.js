// backend/router/discountRoutes.js

const express = require('express');
const router = express.Router();

// ✅ Destructure all required functions directly
const {
  createDiscount,
  getDiscounts,
  deleteDiscount,
  getTodaysDiscount,
  getDiscountCoupon,
  updateCouponUsedStatus, // ✅ must match what’s exported
} = require('../controller/discountController');


// POST - Create a new discount
router.post('/add', createDiscount);

// GET - Fetch all discounts
router.get('/', getDiscounts);

router.get('/today', getTodaysDiscount);

// DELETE - Remove a discount by ID
router.delete('/:id', deleteDiscount);

router.get('/getCoupon/:code', getDiscountCoupon);

router.patch('/markUsed/:code', updateCouponUsedStatus);

module.exports = router;
