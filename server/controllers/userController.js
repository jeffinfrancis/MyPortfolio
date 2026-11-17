import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// All admin-only (enforced in the router).
export async function list(_req, res) {
  res.json(await User.find().sort({ createdAt: -1 }));
}

export async function get(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json(user);
}

export async function update(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  const { firstName, lastName, email, role, password } = req.body ?? {};
  if (role !== undefined && role !== user.role && user.id === req.user.id) {
    return res.status(400).json({ message: "You can't change your own role." });
  }
  user.set(
    Object.fromEntries(
      Object.entries({ firstName, lastName, email, role }).filter(([, v]) => v !== undefined)
    )
  );
  if (password !== undefined) {
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.', errors: { password: 'Password must be at least 8 characters.' } });
    }
    user.passwordHash = await bcrypt.hash(password, 10);
  }
  await user.save();
  res.json(user);
}

export async function remove(req, res) {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ message: "You can't delete your own account." });
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json({ message: 'User deleted.', id: user.id });
}