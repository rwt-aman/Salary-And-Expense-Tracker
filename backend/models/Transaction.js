const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    note: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    month: { type: String, required: true }, // "YYYY-MM"
    date: { type: String, required: true }, // "YYYY-MM-DD"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
