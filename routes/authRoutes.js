const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

const router = express.Router();

// pages
router.get("/", (req, res) => res.redirect("/login"));
router.get("/signup", (req, res) => res.render("signup", { error: null }));
router.get("/login", (req, res) => res.render("login", { error: null }));

// SIGNUP (POST mandatory)
router.post(
  "/signup",
  [
    body("name").notEmpty().withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.render("signup", { error: errors.array()[0].msg });

    const { name, email, password } = req.body;

    try {
      // ✅ Email duplication prevention
      const existing = await User.findOne({ email });
      if (existing) return res.render("signup", { error: "Email already registered" });

      // ✅ Password hashing
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);

      await User.create({ name, email, password: hashed });
      return res.redirect("/login");
    } catch {
      return res.render("signup", { error: "Something went wrong" });
    }
  }
);

// LOGIN (POST mandatory)
router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) return res.render("login", { error: "Invalid credentials" });

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.render("login", { error: "Invalid credentials" });

      const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: "1d"
      });

      res.cookie("token", token, { httpOnly: true });
      return res.redirect("/dashboard");
    } catch {
      return res.render("login", { error: "Something went wrong" });
    }
  }
);

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

module.exports = router;
