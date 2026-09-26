const express = require("express");
const router = express.Router();
const { setSalary, getBudget } = require("../controllers/budgetController");
const { protect } = require("../middleware/authMiddleware");

router.post("/salary", protect, setSalary);
router.get("/:month", protect, getBudget);

module.exports = router;
