import { Link, Navigate } from 'react-router-dom';
import Field, { FormAlert } from '../components/Field';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../lib/hooks/useForm';
import type { FormErrors } from '../lib/hooks/useForm';
import { EMAIL_PATTERN } from '../lib/validators';

type SignInValues = { email: string; password: string };

const INITIAL: SignInValues = { email: '', password: '' };

function validate(v: SignInValues): FormErrors<SignInValues> {
  const errors: FormErrors<SignInValues> = {};
  if (!v.email.trim()) errors.email = 'Email is required.';
  else if (!EMAIL_PATTERN.test(v.email.trim())) errors.email = "That doesn't look like a valid email address.";
  if (!v.password) errors.password = 'Password is required.';
  return errors;
}

export default function SignIn() {
  const { user, signIn } = useAuth();
  const form = useForm<SignInValues>(INITIAL, validate);

  if (user) return <Navigate to="/" replace />;

  const onSubmit = form.handleSubmit(async (v) => {
    await signIn(v.email.trim(), v.password);
  });

  return (
    <section className="max-w-xl mx-auto">
      <h1 className="section-title">Sign in</h1>
      <p className="lead">Use the email and password you registered with.</p>

      <form onSubmit={onSubmit} noValidate className="card grid gap-4 mt-6">
        <Field id="signin-email" label="Email" error={form.errorFor('email')}>
          {(c) => (
            <input {...c} name="email" type="email" autoComplete="email" required
              value={form.values.email} onChange={form.handleChange} onBlur={form.handleBlur} />
          )}
        </Field>

        <Field id="signin-password" label="Password" error={form.errorFor('password')}>
          {(c) => (
            <input {...c} name="password" type="password" autoComplete="current-password" required
              value={form.values.password} onChange={form.handleChange} onBlur={form.handleBlur} />
          )}
        </Field>

        <FormAlert message={form.formError} />

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" className="btn" disabled={form.submitting}>
            {form.submitting ? 'Signing in…' : 'Sign in'}
          </button>
          <span className="text-sm text-muted">
            New here? <Link to="/signup" className="text-accent underline">Create an account</Link>
          </span>
        </div>
      </form>
    </section>
  );
}