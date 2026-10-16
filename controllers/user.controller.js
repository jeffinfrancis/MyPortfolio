import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const list = async (req, res) => {
  try {
    res.json(await User.find().select("-password"));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!password) return res.status(400).json({ message: "Password is required" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      created: user.created,
      updated: user.updated,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const changes = { ...req.body, updated: Date.now() };
    if (changes.password) changes.password = await bcrypt.hash(changes.password, 10);
    const user = await User.findByIdAndUpdate(req.params.id, changes, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const removeAll = async (req, res) => {
  try {
    const result = await User.deleteMany({});
    res.json({ message: `${result.deletedCount} users deleted` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
