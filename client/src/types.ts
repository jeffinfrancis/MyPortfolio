export type Role = 'user' | 'admin';

export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
};

export type Qualification = {
  _id: string;
  degree: string;
  institution: string;
  startYear: number;
  endYear: number;
  detail: string;
};

export type Project = {
  _id: string;
  title: string;
  role: string;
  outcome: string;
  timeline: string;
  description: string[];
  techStack: string[];
  imageUrl: string;
  liveUrl: string;
  repoUrl: string;
};

export type ContactMessage = {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
  preferredContactMethod: 'email' | 'phone' | 'either';
  referralSource: 'google' | 'linkedin' | 'referral' | 'other';
  subscribeToUpdates: boolean;
  createdAt: string;
};