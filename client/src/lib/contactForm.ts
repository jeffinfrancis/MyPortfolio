import type { ContactMessage } from '../types';
import { EMAIL_PATTERN } from './validators';
import type { FormErrors } from './hooks/useForm';

export type ContactValues = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
  preferredContactMethod: 'email' | 'phone' | 'either';
  referralSource: '' | 'google' | 'linkedin' | 'referral' | 'other';
  subscribeToUpdates: boolean;
};

export const EMPTY_CONTACT: ContactValues = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  message: '',
  preferredContactMethod: 'email',
  referralSource: '',
  subscribeToUpdates: false
};

export const CONTACT_METHOD_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'either', label: 'Either is fine' }
] as const;

export const REFERRAL_SOURCE_OPTIONS = [
  { value: 'google', label: 'Search engine (Google, DuckDuckGo, …)' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'referral', label: 'A friend or colleague' },
  { value: 'other', label: 'Somewhere else' }
] as const;

const PHONE_PATTERN = /^[0-9+()\-\s]{7,20}$/;
const NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'.\- ]{0,39}$/;
export const MESSAGE_MIN_LENGTH = 10;
export const MESSAGE_MAX_LENGTH = 500;

export function validateContact(values: ContactValues): FormErrors<ContactValues> {
  const errors: FormErrors<ContactValues> = {};

  for (const key of ['firstName', 'lastName'] as const) {
    const label = key === 'firstName' ? 'First' : 'Last';
    const value = values[key].trim();
    if (!value) errors[key] = `${label} name is required.`;
    else if (!NAME_PATTERN.test(value)) errors[key] = 'Use letters, spaces, hyphens, or apostrophes only.';
  }

  if (!values.phone.trim()) errors.phone = 'Phone number is required.';
  else if (!PHONE_PATTERN.test(values.phone.trim())) errors.phone = 'Enter 7–20 characters — digits, spaces, +, -, ( or ).';

  if (!values.email.trim()) errors.email = 'Email is required.';
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "That doesn't look like a valid email address.";

  if (!values.referralSource) errors.referralSource = 'Please pick where you heard about me.';

  const message = values.message.trim();
  if (!message) errors.message = 'Message is required.';
  else if (message.length < MESSAGE_MIN_LENGTH) {
    errors.message = `Message must be at least ${MESSAGE_MIN_LENGTH} characters (currently ${message.length}).`;
  } else if (message.length > MESSAGE_MAX_LENGTH) {
    errors.message = `Message must be ${MESSAGE_MAX_LENGTH} characters or fewer (currently ${message.length}).`;
  }

  return errors;
}

export function toContactValues(message: ContactMessage): ContactValues {
  const { firstName, lastName, phone, email, message: body, preferredContactMethod, referralSource, subscribeToUpdates } = message;
  return { firstName, lastName, phone, email, message: body, preferredContactMethod, referralSource, subscribeToUpdates };
}