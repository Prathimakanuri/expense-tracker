const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ["Food", "Travel", "Bills", "Shopping", "Education", "Health", "Other"],
      default: "Other"
    },
    date: { type: Date, required: true },
    note: { type: String, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
