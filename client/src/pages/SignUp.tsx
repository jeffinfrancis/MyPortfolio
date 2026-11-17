import { Link, Navigate, useNavigate } from 'react-router-dom';
import Field, { FormAlert } from '../components/Field';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../lib/hooks/useForm';
import type { FormErrors } from '../lib/hooks/useForm';
import { EMAIL_PATTERN, MIN_PASSWORD_LENGTH } from '../lib/validators';

type SignUpValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const INITIAL: SignUpValues = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' };

function validate(v: SignUpValues): FormErrors<SignUpValues> {
  const errors: FormErrors<SignUpValues> = {};
  if (!v.firstName.trim()) errors.firstName = 'First name is required.';
  if (!v.lastName.trim()) errors.lastName = 'Last name is required.';
  if (!v.email.trim()) errors.email = 'Email is required.';
  else if (!EMAIL_PATTERN.test(v.email.trim())) errors.email = "That doesn't look like a valid email address.";
  if (v.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (!v.confirmPassword) errors.confirmPassword = 'Re-enter your password.';
  else if (v.confirmPassword !== v.password) errors.confirmPassword = "Passwords don't match.";
  return errors;
}

export default function SignUp() {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  const form = useForm<SignUpValues>(INITIAL, validate);

  if (user) return <Navigate to="/" replace />;

  const onSubmit = form.handleSubmit(async (v) => {
    await signUp({ firstName: v.firstName.trim(), lastName: v.lastName.trim(), email: v.email.trim(), password: v.password });
    navigate('/', { replace: true });
  });

  return (
    <section className="max-w-xl mx-auto">
      <h2 className="section-title">Create an account</h2>
      <p className="lead">Signed-in users can read the portfolio and see the messages they have sent.</p>

      <form onSubmit={onSubmit} noValidate className="card grid gap-4 mt-6">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <Field id="signup-firstName" label="First name" error={form.errorFor('firstName')}>
            {(c) => (
              <input {...c} name="firstName" type="text" autoComplete="given-name" maxLength={40} required
                value={form.values.firstName} onChange={form.handleChange} onBlur={form.handleBlur} />
            )}
          </Field>
          <Field id="signup-lastName" label="Last name" error={form.errorFor('lastName')}>
            {(c) => (
              <input {...c} name="lastName" type="text" autoComplete="family-name" maxLength={40} required
                value={form.values.lastName} onChange={form.handleChange} onBlur={form.handleBlur} />
            )}
          </Field>
        </div>

        <Field id="signup-email" label="Email" error={form.errorFor('email')}>
          {(c) => (
            <input {...c} name="email" type="email" autoComplete="email" required
              value={form.values.email} onChange={form.handleChange} onBlur={form.handleBlur} />
          )}
        </Field>

        <Field id="signup-password" label="Password" hint={`At least ${MIN_PASSWORD_LENGTH} characters.`} error={form.errorFor('password')}>
          {(c) => (
            <input {...c} name="password" type="password" autoComplete="new-password" required
              value={form.values.password} onChange={form.handleChange} onBlur={form.handleBlur} />
          )}
        </Field>

        <Field id="signup-confirmPassword" label="Confirm password" error={form.errorFor('confirmPassword')}>
          {(c) => (
            <input {...c} name="confirmPassword" type="password" autoComplete="new-password" required
              value={form.values.confirmPassword} onChange={form.handleChange} onBlur={form.handleBlur} />
          )}
        </Field>

        <FormAlert message={form.formError} />

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" className="btn" disabled={form.submitting}>
            {form.submitting ? 'Creating account…' : 'Create account'}
          </button>
          <span className="text-sm text-muted">
            Already registered? <Link to="/signin" className="text-accent underline">Sign in</Link>
          </span>
        </div>
      </form>
    </section>
  );
}