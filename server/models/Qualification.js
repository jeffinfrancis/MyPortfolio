import mongoose from 'mongoose';

const thisYear = new Date().getFullYear();

const qualificationSchema = new mongoose.Schema(
  {
    degree: { type: String, required: [true, 'Degree or certification is required.'], trim: true, maxlength: 120 },
    institution: { type: String, required: [true, 'Institution is required.'], trim: true, maxlength: 120 },
    startYear: {
      type: Number,
      required: [true, 'Start year is required.'],
      min: [1950, 'Start year must be 1950 or later.'],
      max: [thisYear + 10, `Start year can't be after ${thisYear + 10}.`]
    },
    endYear: {
      type: Number,
      required: [true, 'End year is required.'],
      min: [1950, 'End year must be 1950 or later.'],
      max: [thisYear + 10, `End year can't be after ${thisYear + 10}.`],
      validate: {
        validator: function (value) {
          return value >= this.startYear;
        },
        message: "End year can't be before the start year."
      }
    },
    detail: { type: String, trim: true, maxlength: 400, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('Qualification', qualificationSchema); // collection: qualifications