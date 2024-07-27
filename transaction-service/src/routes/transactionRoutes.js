const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

// Define your CRUD routes here
router.post("/", transactionController.createTransaction);
router.get("/", transactionController.getAllTransactions);
router.get("/:id", transactionController.getTransaction);
router.put("/:id", transactionController.updateTransaction);
router.delete("/:id", transactionController.deleteTransaction);

module.exports = router;
