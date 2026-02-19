import express from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, and password are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "invalid email format",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An error occurred when creating the user",
      });
    }

    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(password, salt);
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      response: {
        email: user.email,
        userId: user._id,
        createdAt: user.createdAt,
        accessToken: user.accessToken,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create user",
      response: error,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && bcrypt.compareSync(password, user.password)) {
      res.json({
        success: true,
        message: "Login successful",
        response: {
          email: user.email,
          userId: user._id,
          accessToken: user.accessToken,
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
        response: null,
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Login failed",
      response: error,
    });
  }
});

export default router;
