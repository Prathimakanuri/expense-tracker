const express = require("express");
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const Expense = require("../models/Expense");

const router = express.Router();

router.get("/dashboard", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });

  const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  res.render("dashboard", { user, expenses, total, error: null });
});

module.exports = router;
