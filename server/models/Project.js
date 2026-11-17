import mongoose from 'mongoose';

const URL_PATTERN = /^https?:\/\/\S+$/i;
const optionalUrl = {
  type: String,
  trim: true,
  default: '',
  validate: {
    validator: (v) => v === '' || URL_PATTERN.test(v),
    message: 'Enter a full link starting with http:// or https://.'
  }
};

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required.'], trim: true, maxlength: 120 },
    role: { type: String, required: [true, 'Role is required.'], trim: true, maxlength: 120 },
    outcome: { type: String, required: [true, 'Outcome summary is required.'], trim: true, maxlength: 400 },
    timeline: { type: String, trim: true, maxlength: 80, default: '' },
    description: { type: [String], default: [] },
    techStack: { type: [String], default: [] },
    imageUrl: optionalUrl,
    liveUrl: optionalUrl,
    repoUrl: optionalUrl
  },
  { timestamps: true }
);

export default mongoose.model('Project', projectSchema); // collection: projects