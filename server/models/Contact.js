import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    // Current contact form fields (camelCase matches the React client).
    firstName: { type: String, trim: true, maxlength: 40 },
    lastName: { type: String, trim: true, maxlength: 40 },
    phone: { type: String, trim: true, maxlength: 20 },
    email: { type: String, trim: true, lowercase: true },
    message: { type: String, trim: true, maxlength: 500 },
    preferredContactMethod: {
      type: String,
      enum: ['email', 'phone', 'either'],
      default: 'email'
    },
    referralSource: {
      type: String,
      enum: ['google', 'linkedin', 'referral', 'other']
    },
    subscribeToUpdates: { type: Boolean, default: false },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // Retained temporarily so older contact documents remain readable.
    firstname: { type: String, select: false },
    lastname: { type: String, select: false }
  },
  { timestamps: true }
);

export default mongoose.model('Contact', contactSchema);
