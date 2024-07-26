const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

// Define your CRUD routes here
router.post("/", transactionController.createTransaction);
router.get("/", transactionController.getAllTransactions);


module.exports = router;
