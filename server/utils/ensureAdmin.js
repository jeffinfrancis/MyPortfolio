import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Creates the admin account in the `users` collection if it isn't there yet.
// Safe on every start-up: an existing admin is left alone (password NOT reset).
export default async function ensureAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'admin@myportfolio.com').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Admin@12345';

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`Promoted ${email} to admin.`);
    }
    return existing;
  }

  const admin = await User.create({
    firstName: process.env.ADMIN_FIRST_NAME || 'Site',
    lastName: process.env.ADMIN_LAST_NAME || 'Admin',
    email,
    passwordHash: await bcrypt.hash(password, 10),
    role: 'admin'
  });
  console.log(`Created admin account ${email}.`);
  return admin;
}