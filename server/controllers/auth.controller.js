import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { createAuthToken } from "../middleware/authenticate.js";

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
});

export const register = async (req, res) => {
  const { name, email, password } = req.body ?? {};

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof password !== "string" ||
    password.length < 8
  ) {
    return res.status(400).json({
      message: "Name, a valid email, and a password of at least 8 characters are required",
    });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    return res.status(201).json({
      token: createAuthToken(user._id),
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Unable to register account" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.json({
      token: createAuthToken(user._id),
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Unable to log in" });
  }
};

export const currentUser = async (req, res) => {
  try {
    const user = await User.findById(req.auth.userId);
    if (!user) return res.status(401).json({ message: "User account no longer exists" });
    return res.json({ user: publicUser(user) });
  } catch (error) {
    console.error("Current-user lookup error:", error);
    return res.status(500).json({ message: "Unable to retrieve account" });
  }
};
