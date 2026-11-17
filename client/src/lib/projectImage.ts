// Falls back to a bundled illustration when a project has no imageUrl.
// Chosen from the id so a project keeps the same picture on the list and detail pages.
import dashboardImage from '../assets/project-dashboard.svg';
import mobileImage from '../assets/project-mobile.svg';
import apiImage from '../assets/project-api.svg';
import type { Project } from '../types';

const FALLBACKS = [dashboardImage, mobileImage, apiImage];

export function projectImage(project: Pick<Project, '_id' | 'imageUrl'>): string {
  if (project.imageUrl) return project.imageUrl;
  const hash = [...project._id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return FALLBACKS[hash % FALLBACKS.length];
}