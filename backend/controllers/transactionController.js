const { Transaction, Budget } = require("../models");
const { fn, col, literal } = require("sequelize");
const mongoose = require("mongoose");

const isProd = process.env.NODE_ENV === "production";

// POST /api/transactions
const addTransaction = async (req, res) => {
  try {
    const { note, amount, month } = req.body;
    const userId = req.user._id || req.user.id;

    if (!note || !amount || !month)
      return res.status(400).json({ message: "note, amount and month are required" });

    const today = new Date().toISOString().split("T")[0];
    const tx = await Transaction.create({ userId, note, amount: Number(amount), month, date: today });

    return res.status(201).json({
      id: tx._id || tx.id,
      userId: tx.userId,
      note: tx.note,
      amount: Number(tx.amount),
      month: tx.month,
      date: tx.date,
    });
  } catch (err) {
    console.error("addTransaction error:", err);
    return res.status(500).json({ message: "Server error adding transaction" });
  }
};

// GET /api/transactions/summary/:month
const getSummary = async (req, res) => {
  try {
    const { month } = req.params;
    const userId = req.user._id || req.user.id;

    let salary = 0;
    let transactions = [];

    if (isProd) {
      const budget = await Budget.findOne({ userId, month });
      salary = budget ? Number(budget.salary) : 0;

      const txs = await Transaction.find({ userId, month }).sort({ createdAt: -1 });
      transactions = txs.map((t) => ({
        id: t._id,
        note: t.note,
        amount: Number(t.amount),
        month: t.month,
        date: t.date,
      }));
    } else {
      const budget = await Budget.findOne({ where: { userId, month } });
      salary = budget ? Number(budget.salary) : 0;

      const txs = await Transaction.findAll({ where: { userId, month }, order: [["createdAt", "DESC"]] });
      transactions = txs.map((t) => ({
        id: t.id,
        note: t.note,
        amount: Number(t.amount),
        month: t.month,
        date: t.date,
      }));
    }

    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const remaining = salary - totalSpent;

    return res.status(200).json({ salary, totalSpent, remaining, transactions });
  } catch (err) {
    console.error("getSummary error:", err);
    return res.status(500).json({ message: "Server error fetching summary" });
  }
};

// DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    let tx;
    if (isProd) {
      tx = await Transaction.findOne({ _id: id, userId });
      if (!tx) return res.status(404).json({ message: "Transaction not found or not authorized" });
      await tx.deleteOne();
    } else {
      tx = await Transaction.findOne({ where: { id, userId } });
      if (!tx) return res.status(404).json({ message: "Transaction not found or not authorized" });
      await tx.destroy();
    }

    return res.status(200).json("Transaction deleted successfully");
  } catch (err) {
    console.error("deleteTransaction error:", err);
    return res.status(500).json({ message: "Server error deleting transaction" });
  }
};

// GET /api/transactions/aggregate/category/:month
const getCategoryAggregate = async (req, res) => {
  try {
    const { month } = req.params;
    const userId = req.user._id || req.user.id;

    let formatted = [];

    if (isProd) {
      const results = await Transaction.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId.toString()), month } },
        { $group: { _id: "$note", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
      ]);
      formatted = results.map((r) => ({ note: r._id, total: Number(r.total) }));
    } else {
      const results = await Transaction.findAll({
        where: { userId, month },
        attributes: ["note", [fn("SUM", col("amount")), "total"]],
        group: ["note"],
        order: [[literal("total"), "DESC"]],
        raw: true,
      });
      formatted = results.map((r) => ({ note: r.note, total: Number(r.total) }));
    }

    return res.status(200).json(formatted);
  } catch (err) {
    console.error("getCategoryAggregate error:", err);
    return res.status(500).json({ message: "Server error fetching category aggregate" });
  }
};

module.exports = { addTransaction, getSummary, deleteTransaction, getCategoryAggregate };
