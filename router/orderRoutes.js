const express = require("express");
const router = express.Router();
const orderController = require("../controller/orderController");
const ordergamezone = require("../controller/ordergamezoneController");
const Order = require("../controller/cancleOrderController");

// GET all orders or filtered by status
router.get("/", orderController.getOrders); //Working     // front-end

router.post("/gamezone", ordergamezone.createOrder);

// POST create new order
router.post("/", orderController.createOrder); // Working    //front-end

// PATCH move Pending -> Cooking
router.patch("/:orderId/start-cooking", orderController.startCooking); //Working  //front-end

// PATCH move Cooking -> Prepared
router.patch("/:orderId/mark-prepared", orderController.markPrepared); //Working //front-end

// DELETE order
router.delete("/:orderId", orderController.deleteOrder); //Working

router.put("/:id/cancel", Order.cancelOrder);

module.exports = router;
