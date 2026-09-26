const express = require("express");
const router = express.Router();
const {
  addTransaction,
  getSummary,
  deleteTransaction,
  getCategoryAggregate,
} = require("../controllers/transactionController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, addTransaction);
router.get("/summary/:month", protect, getSummary);
router.delete("/:id", protect, deleteTransaction);
router.get("/aggregate/category/:month", protect, getCategoryAggregate);

module.exports = router;
