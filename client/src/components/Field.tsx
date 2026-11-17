import type { ReactNode } from 'react';

export const FIELD_CONTROL =
  'bg-surface-2 border border-border text-text rounded-md px-3.5 py-2.5 text-base font-sans w-full focus:outline-2 focus:outline-accent focus:outline-offset-2 aria-invalid:border-danger';

type ControlProps = {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby': string | undefined;
  className: string;
};

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: (control: ControlProps) => ReactNode;
};

export default function Field({ id, label, error, hint, children }: FieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="grid gap-1.5 text-sm text-muted">
      <label htmlFor={id}>{label}</label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy, className: FIELD_CONTROL })}
      {hint && !error && (
        <p id={`${id}-hint`} className="m-0 text-xs">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="m-0 text-danger text-[0.85rem] font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

// A form-level message (server rejected the request, network down, …).
export function FormAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="m-0 px-4 py-3 rounded-md border border-danger/50 bg-danger/10 text-text">
      {message}
    </p>
  );
}