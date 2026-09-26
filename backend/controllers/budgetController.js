const { Budget } = require("../models");

const isProd = process.env.NODE_ENV === "production";

// POST /api/budget/salary
const setSalary = async (req, res) => {
  try {
    const { salary, month } = req.body;
    const userId = req.user._id || req.user.id;

    if (!salary || !month)
      return res.status(400).json({ message: "salary and month are required" });

    let budget;
    if (isProd) {
      budget = await Budget.findOneAndUpdate(
        { userId, month },
        { salary },
        { upsert: true, new: true }
      );
    } else {
      const [b, created] = await Budget.findOrCreate({ where: { userId, month }, defaults: { salary } });
      if (!created) await b.update({ salary });
      budget = b;
    }

    return res.status(200).json({
      id: budget._id || budget.id,
      userId: budget.userId,
      month: budget.month,
      salary: Number(budget.salary),
    });
  } catch (err) {
    console.error("setSalary error:", err);
    return res.status(500).json({ message: "Server error setting salary" });
  }
};

// GET /api/budget/:month
const getBudget = async (req, res) => {
  try {
    const { month } = req.params;
    const userId = req.user._id || req.user.id;

    const budget = isProd
      ? await Budget.findOne({ userId, month })
      : await Budget.findOne({ where: { userId, month } });

    if (!budget) return res.status(200).json(null);

    return res.status(200).json({
      id: budget._id || budget.id,
      userId: budget.userId,
      month: budget.month,
      salary: Number(budget.salary),
    });
  } catch (err) {
    console.error("getBudget error:", err);
    return res.status(500).json({ message: "Server error fetching budget" });
  }
};

module.exports = { setSalary, getBudget };
