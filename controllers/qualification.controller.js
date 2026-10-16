import Qualification from "../models/Qualification.js";

export const list = async (req, res) => {
  try {
    res.json(await Qualification.find());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const qualification = await Qualification.findById(req.params.id);
    if (!qualification) return res.status(404).json({ message: "Qualification not found" });
    res.json(qualification);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const qualification = await Qualification.create(req.body);
    res.status(201).json(qualification);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const qualification = await Qualification.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!qualification) return res.status(404).json({ message: "Qualification not found" });
    res.json(qualification);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const qualification = await Qualification.findByIdAndDelete(req.params.id);
    if (!qualification) return res.status(404).json({ message: "Qualification not found" });
    res.json({ message: "Qualification deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const removeAll = async (req, res) => {
  try {
    const result = await Qualification.deleteMany({});
    res.json({ message: `${result.deletedCount} qualifications deleted` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};