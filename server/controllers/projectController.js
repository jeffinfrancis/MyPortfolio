import Project from '../models/Project.js';
import { makeCrud } from './crud.js';

export default makeCrud(Project, {
  label: 'Project',
  fields: ['title', 'role', 'outcome', 'timeline', 'description', 'techStack', 'imageUrl', 'liveUrl', 'repoUrl'],
  sort: { createdAt: -1 }
});