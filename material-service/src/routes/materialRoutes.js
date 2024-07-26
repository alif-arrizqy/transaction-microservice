const express = require("express");
const router = express.Router();
const materialController = require("../controllers/materialController");

// Define your CRUD routes here
router.post("/", materialController.createMaterial);
router.get("/", materialController.getAllMaterials);

module.exports = router;
