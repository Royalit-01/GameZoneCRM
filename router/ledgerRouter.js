const express = require("express");
const router = express.Router();
const ledgerController = require("../controller/ledgercontroller");
const authMiddleware = require("../middleware/authMiddleware");

// Add a ledger entry
router.post(
  "/:customerId/addentry",
  authMiddleware,
  ledgerController.addLedgerEntry
);

// Add a transaction
router.post(
  "/:phoneNumber/transaction",
  authMiddleware,
  ledgerController.addTransaction
);

// Get all ledgers
router.get("/", ledgerController.getAllLedgers);

module.exports = router;
