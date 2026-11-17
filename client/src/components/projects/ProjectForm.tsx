// description: paragraphs separated by a blank line <-> string[]
// techStack:   comma-separated                      <-> string[]
import Field, { FormAlert } from '../Field';
import { useForm } from '../../lib/hooks/useForm';
import type { FormErrors } from '../../lib/hooks/useForm';
import { URL_PATTERN } from '../../lib/validators';
import type { Project } from '../../types';

type Values = {
  title: string;
  role: string;
  outcome: string;
  timeline: string;
  description: string;
  techStack: string;
  imageUrl: string;
  liveUrl: string;
  repoUrl: string;
};

const EMPTY: Values = { title: '', role: '', outcome: '', timeline: '', description: '', techStack: '', imageUrl: '', liveUrl: '', repoUrl: '' };

const URL_MESSAGE = 'Enter a full link starting with http:// or https://.';

function validate(v: Values): FormErrors<Values> {
  const errors: FormErrors<Values> = {};
  if (!v.title.trim()) errors.title = 'Title is required.';
  if (!v.role.trim()) errors.role = 'Role is required.';
  if (!v.outcome.trim()) errors.outcome = 'A one-line outcome is required.';
  else if (v.outcome.trim().length > 400) errors.outcome = 'Keep the outcome under 400 characters.';
  for (const key of ['imageUrl', 'liveUrl', 'repoUrl'] as const) {
    if (v[key].trim() && !URL_PATTERN.test(v[key].trim())) errors[key] = URL_MESSAGE;
  }
  return errors;
}

const toValues = (p: Project): Values => ({
  title: p.title,
  role: p.role,
  outcome: p.outcome,
  timeline: p.timeline,
  description: p.description.join('\n\n'),
  techStack: p.techStack.join(', '),
  imageUrl: p.imageUrl,
  liveUrl: p.liveUrl,
  repoUrl: p.repoUrl
});

const toPayload = (v: Values) => ({
  title: v.title.trim(),
  role: v.role.trim(),
  outcome: v.outcome.trim(),
  timeline: v.timeline.trim(),
  description: v.description.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean),
  techStack: v.techStack.split(',').map((s) => s.trim()).filter(Boolean),
  imageUrl: v.imageUrl.trim(),
  liveUrl: v.liveUrl.trim(),
  repoUrl: v.repoUrl.trim()
});

type Props = {
  initial?: Project;
  onSave: (payload: ReturnType<typeof toPayload>) => Promise<void>;
  onCancel: () => void;
};

export default function ProjectForm({ initial, onSave, onCancel }: Props) {
  const form = useForm<Values>(initial ? toValues(initial) : EMPTY, validate);
  const prefix = initial ? `project-${initial._id}` : 'project-new';
  const onSubmit = form.handleSubmit(async (v) => {
    await onSave(toPayload(v));
  });
  const common = { onChange: form.handleChange, onBlur: form.handleBlur };

  return (
    <form onSubmit={onSubmit} noValidate className="card grid gap-4">
      <h2 className="m-0 text-xl">{initial ? 'Edit project' : 'Add a project'}</h2>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Field id={`${prefix}-title`} label="Title" error={form.errorFor('title')}>
          {(c) => <input {...c} {...common} name="title" type="text" required maxLength={120} value={form.values.title} />}
        </Field>
        <Field id={`${prefix}-role`} label="Your role" error={form.errorFor('role')}>
          {(c) => <input {...c} {...common} name="role" type="text" required maxLength={120} value={form.values.role} />}
        </Field>
      </div>

      <Field id={`${prefix}-outcome`} label="Outcome (shown on the project card)" error={form.errorFor('outcome')}>
        {(c) => <textarea {...c} {...common} name="outcome" rows={2} required maxLength={400} value={form.values.outcome} className={`${c.className} resize-y`} />}
      </Field>

      <Field id={`${prefix}-timeline`} label="Timeline (optional)" hint="For example: Jan 2024 – Nov 2024" error={form.errorFor('timeline')}>
        {(c) => <input {...c} {...common} name="timeline" type="text" maxLength={80} value={form.values.timeline} />}
      </Field>

      <Field id={`${prefix}-description`} label="Description (optional)" hint="Separate paragraphs with a blank line." error={form.errorFor('description')}>
        {(c) => <textarea {...c} {...common} name="description" rows={6} value={form.values.description} className={`${c.className} resize-y`} />}
      </Field>

      <Field id={`${prefix}-techStack`} label="Tech stack (optional)" hint="Comma-separated: React, TypeScript, Vite" error={form.errorFor('techStack')}>
        {(c) => <input {...c} {...common} name="techStack" type="text" value={form.values.techStack} />}
      </Field>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Field id={`${prefix}-imageUrl`} label="Image link (optional)" error={form.errorFor('imageUrl')}>
          {(c) => <input {...c} {...common} name="imageUrl" type="url" value={form.values.imageUrl} />}
        </Field>
        <Field id={`${prefix}-liveUrl`} label="Live site (optional)" error={form.errorFor('liveUrl')}>
          {(c) => <input {...c} {...common} name="liveUrl" type="url" value={form.values.liveUrl} />}
        </Field>
        <Field id={`${prefix}-repoUrl`} label="Source code (optional)" error={form.errorFor('repoUrl')}>
          {(c) => <input {...c} {...common} name="repoUrl" type="url" value={form.values.repoUrl} />}
        </Field>
      </div>

      <FormAlert message={form.formError} />

      <div className="flex gap-3">
        <button type="submit" className="btn" disabled={form.submitting}>
          {form.submitting ? 'Saving…' : initial ? 'Save changes' : 'Add project'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}