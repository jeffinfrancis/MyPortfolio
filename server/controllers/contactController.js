import Contact from '../models/Contact.js';

const FIELDS = [
  'firstName', 'lastName', 'phone', 'email', 'message',
  'preferredContactMethod', 'referralSource', 'subscribeToUpdates'
];
const pick = (body = {}) =>
  Object.fromEntries(FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));

// POST /api/contacts — public. If the sender is signed in we remember who.
export async function create(req, res) {
  const doc = await Contact.create({ ...pick(req.body), submittedBy: req.user?._id ?? null });
  res.status(201).json(doc);
}

// GET /api/contacts — admin sees everything; a user sees only their own.
export async function list(req, res) {
  const filter = req.user.role === 'admin' ? {} : { submittedBy: req.user._id };
  res.json(await Contact.find(filter).sort({ createdAt: -1 }));
}

export async function get(req, res) {
  const doc = await Contact.findById(req.params.id);
  const mine = doc?.submittedBy && String(doc.submittedBy) === String(req.user._id);
  if (!doc || (req.user.role !== 'admin' && !mine)) {
    return res.status(404).json({ message: 'Message not found.' });
  }
  res.json(doc);
}

// PUT / DELETE are admin-only (enforced in the router).
export async function update(req, res) {
  const doc = await Contact.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Message not found.' });
  doc.set(pick(req.body));
  await doc.save();
  res.json(doc);
}

export async function remove(req, res) {
  const doc = await Contact.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Message not found.' });
  res.json({ message: 'Message deleted.', id: doc.id });
}