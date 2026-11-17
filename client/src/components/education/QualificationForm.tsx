import Field, { FormAlert } from '../Field';
import { useForm } from '../../lib/hooks/useForm';
import type { FormErrors } from '../../lib/hooks/useForm';
import type { Qualification } from '../../types';

type Values = { degree: string; institution: string; startYear: string; endYear: string; detail: string };

const EMPTY: Values = { degree: '', institution: '', startYear: '', endYear: '', detail: '' };
const MIN_YEAR = 1950;
const MAX_YEAR = new Date().getFullYear() + 10;

function validate(v: Values): FormErrors<Values> {
  const errors: FormErrors<Values> = {};
  if (!v.degree.trim()) errors.degree = 'Degree or certification is required.';
  if (!v.institution.trim()) errors.institution = 'Institution is required.';

  const start = Number(v.startYear);
  const end = Number(v.endYear);
  const validYear = (text: string, n: number) => text.trim() !== '' && Number.isInteger(n) && n >= MIN_YEAR && n <= MAX_YEAR;

  if (!validYear(v.startYear, start)) errors.startYear = `Enter a year between ${MIN_YEAR} and ${MAX_YEAR}.`;
  if (!validYear(v.endYear, end)) errors.endYear = `Enter a year between ${MIN_YEAR} and ${MAX_YEAR}.`;
  else if (!errors.startYear && end < start) errors.endYear = "End year can't be before the start year.";

  if (v.detail.length > 400) errors.detail = 'Keep details under 400 characters.';
  return errors;
}

type Props = {
  initial?: Qualification;
  onSave: (payload: Omit<Qualification, '_id'>) => Promise<void>;
  onCancel: () => void;
};

export default function QualificationForm({ initial, onSave, onCancel }: Props) {
  const form = useForm<Values>(
    initial
      ? { degree: initial.degree, institution: initial.institution, startYear: String(initial.startYear), endYear: String(initial.endYear), detail: initial.detail }
      : EMPTY,
    validate
  );
  const prefix = initial ? `qual-${initial._id}` : 'qual-new';

  const onSubmit = form.handleSubmit(async (v) => {
    await onSave({
      degree: v.degree.trim(),
      institution: v.institution.trim(),
      startYear: Number(v.startYear),
      endYear: Number(v.endYear),
      detail: v.detail.trim()
    });
  });

  const common = { onChange: form.handleChange, onBlur: form.handleBlur };

  return (
    <form onSubmit={onSubmit} noValidate className="card grid gap-4">
      <h2 className="m-0 text-xl">{initial ? 'Edit qualification' : 'Add a qualification'}</h2>

      <Field id={`${prefix}-degree`} label="Degree or certification" error={form.errorFor('degree')}>
        {(c) => <input {...c} {...common} name="degree" type="text" required maxLength={120} value={form.values.degree} />}
      </Field>
      <Field id={`${prefix}-institution`} label="Institution" error={form.errorFor('institution')}>
        {(c) => <input {...c} {...common} name="institution" type="text" required maxLength={120} value={form.values.institution} />}
      </Field>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Field id={`${prefix}-startYear`} label="Start year" error={form.errorFor('startYear')}>
          {(c) => <input {...c} {...common} name="startYear" type="text" inputMode="numeric" required value={form.values.startYear} />}
        </Field>
        <Field id={`${prefix}-endYear`} label="End year" error={form.errorFor('endYear')}>
          {(c) => <input {...c} {...common} name="endYear" type="text" inputMode="numeric" required value={form.values.endYear} />}
        </Field>
      </div>

      <Field id={`${prefix}-detail`} label="Details (optional)" error={form.errorFor('detail')}>
        {(c) => <textarea {...c} {...common} name="detail" rows={3} maxLength={400} value={form.values.detail} className={`${c.className} resize-y`} />}
      </Field>

      <FormAlert message={form.formError} />

      <div className="flex gap-3">
        <button type="submit" className="btn" disabled={form.submitting}>
          {form.submitting ? 'Saving…' : initial ? 'Save changes' : 'Add qualification'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}