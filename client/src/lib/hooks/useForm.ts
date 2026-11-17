import { useCallback, useMemo, useState } from 'react';
import type { ChangeEvent, FocusEvent, FormEvent } from 'react';
import { ApiError, messageOf } from '../../../services/api';

type FieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export type UseForm<T> = {
  values: T;
  errorFor: (name: keyof T) => string | undefined;
  formError: string | null;
  submitting: boolean;
  handleChange: (event: ChangeEvent<FieldElement>) => void;
  handleBlur: (event: FocusEvent<FieldElement>) => void;
  handleSubmit: (onValid: (values: T) => Promise<void>) => (event: FormEvent<HTMLFormElement>) => void;
  reset: (next?: T) => void;
};

// `validate` must be a stable function (declare it at module level).
export function useForm<T extends Record<string, string | boolean>>(
  initialValues: T,
  validate: (values: T) => FormErrors<T>
): UseForm<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<FormErrors<T>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const clientErrors = useMemo(() => validate(values), [values, validate]);

  const handleChange = useCallback((event: ChangeEvent<FieldElement>) => {
    const target = event.target;
    const name = target.name as keyof T;
    const value = target instanceof HTMLInputElement && target.type === 'checkbox' ? target.checked : target.value;

    setValues((previous) => ({ ...previous, [name]: value }));
    setServerErrors((previous) => {
      if (!previous[name]) return previous;
      const next = { ...previous };
      delete next[name];
      return next;
    });
  }, []);

  const handleBlur = useCallback((event: FocusEvent<FieldElement>) => {
    const name = event.target.name as keyof T;
    setTouched((previous) => ({ ...previous, [name]: true }));
  }, []);

  const errorFor = useCallback(
    (name: keyof T): string | undefined =>
      serverErrors[name] ?? (touched[name] ? clientErrors[name] : undefined),
    [serverErrors, touched, clientErrors]
  );

  const handleSubmit = useCallback(
    (onValid: (submitted: T) => Promise<void>) => (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;
      setFormError(null);

      if (Object.keys(clientErrors).length > 0) {
        setTouched(Object.fromEntries(Object.keys(values).map((key) => [key, true])) as Record<keyof T, boolean>);
        requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
        return;
      }

      setSubmitting(true);
      onValid(values)
        .catch((error: unknown) => {
          if (error instanceof ApiError && error.fieldErrors) {
            setServerErrors(error.fieldErrors as FormErrors<T>);
            requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
          }
          setFormError(messageOf(error));
        })
        .finally(() => setSubmitting(false));
    },
    [clientErrors, values]
  );

  const reset = useCallback(
    (next?: T) => {
      setValues(next ?? initialValues);
      setTouched({});
      setServerErrors({});
      setFormError(null);
    },
    [initialValues]
  );

  return { values, errorFor, formError, submitting, handleChange, handleBlur, handleSubmit, reset };
}