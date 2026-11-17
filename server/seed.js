// npm run seed         -> make sure the admin account exists
// npm run seed:sample  -> also add sample projects/qualifications (only into EMPTY collections)
import 'dotenv/config';
import mongoose from 'mongoose';
import ensureAdmin from './utils/ensureAdmin.js';
import Project from './models/Project.js';
import Qualification from './models/Qualification.js';

const withSamples = process.argv.includes('--sample');

const SAMPLE_QUALIFICATIONS = [
  { degree: 'M.Sc., Computer Science', institution: 'University of Toronto', startYear: 2021, endYear: 2023, detail: 'Specialization in human–computer interaction.' },
  { degree: 'B.Sc. (Hons.), Software Engineering', institution: 'University of Waterloo', startYear: 2016, endYear: 2020, detail: "Dean's honour list." }
];

const SAMPLE_PROJECTS = [
  {
    title: 'Insight Analytics Dashboard',
    role: 'Lead front-end developer',
    outcome: 'Delivered a real-time dashboard adopted by 40+ internal teams; cut report generation time from hours to under a minute.',
    timeline: 'Jan 2024 – Nov 2024',
    description: ['Insight is an internal analytics dashboard used by data teams to explore product usage, funnels, and cohort retention without writing SQL.'],
    techStack: ['React', 'TypeScript', 'Recharts', 'Vite']
  },
  {
    title: 'TrailTracker Mobile App',
    role: 'React Native developer',
    outcome: 'Shipped an offline-first hiking companion to iOS and Android with 4.8-star ratings.',
    timeline: 'Feb 2023 – Jul 2023',
    description: ['TrailTracker is an offline-first mobile app for hikers: download a park, get trail guidance, and log elevation with no cell signal.'],
    techStack: ['React Native', 'TypeScript', 'SQLite', 'Expo']
  }
];

try {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Portfolio');
  await ensureAdmin();

  if (withSamples) {
    if ((await Project.countDocuments()) === 0) {
      await Project.insertMany(SAMPLE_PROJECTS);
      console.log(`Added ${SAMPLE_PROJECTS.length} sample projects.`);
    }
    if ((await Qualification.countDocuments()) === 0) {
      await Qualification.insertMany(SAMPLE_QUALIFICATIONS);
      console.log(`Added ${SAMPLE_QUALIFICATIONS.length} sample qualifications.`);
    }
  }
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}