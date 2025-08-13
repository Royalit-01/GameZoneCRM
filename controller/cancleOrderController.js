// const express = require('express');
const Order = require("../models/Order");

exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelMessage } = req.body;

    if (!cancelMessage || cancelMessage.trim() === "") {
      return res.status(400).json({ message: "Cancel message is required" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status: "Cancelled", cancelMessage },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order cancelled successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to cancel order" });
  }
};
