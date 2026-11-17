import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sign = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });

// Rejects non-strings up front (stops NoSQL operator injection like {"email": {"$gt": ""}}).
const isText = (v) => typeof v === 'string';

// POST /api/auth/signup — ALWAYS creates a normal user; `role` in the body is ignored.
export async function signUp(req, res) {
  const { firstName, lastName, email, password } = req.body ?? {};
  const errors = {};
  if (!isText(firstName) || !firstName.trim()) errors.firstName = 'First name is required.';
  else if (firstName.trim().length > 40) errors.firstName = 'First name must be 40 characters or fewer.';
  if (!isText(lastName) || !lastName.trim()) errors.lastName = 'Last name is required.';
  else if (lastName.trim().length > 40) errors.lastName = 'Last name must be 40 characters or fewer.';
  if (!isText(email) || !email.trim()) errors.email = 'Email is required.';
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = "That doesn't look like a valid email address.";
  if (!isText(password) || password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (Object.keys(errors).length) {
    return res.status(400).json({ message: 'Please fix the highlighted fields.', errors });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: 'user'
    });
    return res.status(201).json({ token: sign(user), user });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'An account with this email already exists.',
        errors: { email: 'An account with this email already exists.' }
      });
    }
    if (error.name === 'ValidationError') {
      const fieldErrors = Object.fromEntries(
        Object.entries(error.errors).map(([field, issue]) => [field, issue.message])
      );
      return res.status(400).json({ message: 'Please fix the highlighted fields.', errors: fieldErrors });
    }
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Unable to create account.' });
  }
}

// POST /api/auth/signin
export async function signIn(req, res) {
  const { email, password } = req.body ?? {};
  if (!isText(email) || !email.trim() || !isText(password) || !password) {
    return res.status(400).json({ message: 'Enter your email and password.' });
  }
  if (!EMAIL_PATTERN.test(email.trim())) {
    return res.status(400).json({ message: 'Enter a valid email address.' });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) return res.status(401).json({ message: 'Incorrect email or password.' });

    return res.json({ token: sign(user), user });
  } catch (error) {
    console.error('Sign-in error:', error);
    return res.status(500).json({ message: 'Unable to sign in.' });
  }
}

// GET /api/auth/me
export function me(req, res) {
  res.json({ user: req.user });
}

// POST /api/auth/signout — JWTs are stateless; the client discarding its token is the real sign-out.
export function signOut(_req, res) {
  res.json({ message: 'Signed out.' });
}