// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// const UserSchema = new mongoose.Schema({
//   name:     { type: String, required: true, trim: true },
//   email:    {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     trim: true,
//     match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
//   },
//   password: { type: String, required: true, select: false },
//   created:  { type: Date, default: Date.now },
//   updated:  { type: Date, default: Date.now },
// });

// UserSchema.pre("save", async function () {
//   if (!this.isModified("password")) return;
//   this.password = await bcrypt.hash(this.password, 12);
//   this.updated = new Date();
// });

// export default mongoose.model("User", UserSchema); // collection: users

import mongoose from 'mongoose';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, 'First name is required.'], trim: true, maxlength: 40 },
    lastName: { type: String, required: [true, 'Last name is required.'], trim: true, maxlength: 40 },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_PATTERN, "That doesn't look like a valid email address."]
    },
    // bcrypt hash. select:false keeps it out of queries unless explicitly requested.
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model('User', userSchema); // collection: users