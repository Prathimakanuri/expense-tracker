const express = require("express");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/authMiddleware");
const Expense = require("../models/Expense");
const User = require("../models/User");

const router = express.Router();

// ADD expense (POST)
router.post(
  "/expenses/add",
  auth,
  [
    body("title").notEmpty().withMessage("Title required"),
    body("amount").isFloat({ min: 0.01 }).withMessage("Amount must be > 0"),
    body("category").notEmpty().withMessage("Category required"),
    body("date").notEmpty().withMessage("Date required")
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const user = await User.findById(req.user.id).select("-password");
      const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
      const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      return res.render("dashboard", { user, expenses, total, error: errors.array()[0].msg });
    }

    const { title, amount, category, date, note } = req.body;

    await Expense.create({
      userId: req.user.id,
      title,
      amount: Number(amount),
      category,
      date: new Date(date),
      note: note || ""
    });

    res.redirect("/dashboard");
  }
);

// DELETE expense (POST)
router.post("/expenses/:id/delete", auth, async (req, res) => {
  await Expense.deleteOne({ _id: req.params.id, userId: req.user.id });
  res.redirect("/dashboard");
});

module.exports = router;
