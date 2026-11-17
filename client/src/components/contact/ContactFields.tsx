// The contact form's inputs without the <form> or submit button. Used by the
// Contact page (send) and the admin Messages page (edit).
import Field from '../Field';
import type { UseForm } from '../../lib/hooks/useForm';
import {
  CONTACT_METHOD_OPTIONS,
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
  REFERRAL_SOURCE_OPTIONS
} from '../../lib/contactForm';
import type { ContactValues } from '../../lib/contactForm';

export default function ContactFields({ form, idPrefix }: { form: UseForm<ContactValues>; idPrefix: string }) {
  const { values, errorFor, handleChange, handleBlur } = form;
  const id = (name: keyof ContactValues) => `${idPrefix}-${name}`;
  const common = { onChange: handleChange, onBlur: handleBlur, required: true };

  return (
    <>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Field id={id('firstName')} label="First name" error={errorFor('firstName')}>
          {(c) => <input {...c} {...common} name="firstName" type="text" autoComplete="given-name" maxLength={40} value={values.firstName} />}
        </Field>
        <Field id={id('lastName')} label="Last name" error={errorFor('lastName')}>
          {(c) => <input {...c} {...common} name="lastName" type="text" autoComplete="family-name" maxLength={40} value={values.lastName} />}
        </Field>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Field id={id('phone')} label="Phone" error={errorFor('phone')}>
          {(c) => <input {...c} {...common} name="phone" type="tel" autoComplete="tel" placeholder="+1 (555) 555-0123" value={values.phone} />}
        </Field>
        <Field id={id('email')} label="Email" error={errorFor('email')}>
          {(c) => <input {...c} {...common} name="email" type="email" autoComplete="email" placeholder="you@example.com" value={values.email} />}
        </Field>
      </div>

      <Field id={id('referralSource')} label="How did you hear about me?" error={errorFor('referralSource')}>
        {(c) => (
          <select {...c} {...common} name="referralSource" value={values.referralSource} className={`${c.className} appearance-auto cursor-pointer`}>
            <option value="" disabled>Choose one…</option>
            {REFERRAL_SOURCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        )}
      </Field>

      <fieldset className="border-0 p-0 m-0 grid gap-2 text-sm text-muted">
        <legend className="p-0 mb-0.5">Preferred contact method</legend>
        <div className="flex flex-wrap gap-x-5 gap-y-3">
          {CONTACT_METHOD_OPTIONS.map((option) => (
            <label key={option.value} className="inline-flex items-center gap-1.5 text-text cursor-pointer">
              <input
                type="radio"
                name="preferredContactMethod"
                value={option.value}
                checked={values.preferredContactMethod === option.value}
                onChange={handleChange}
                className="focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field id={id('message')} label="Message" error={errorFor('message')}>
        {(c) => (
          <>
            <textarea {...c} {...common} name="message" rows={5} minLength={MESSAGE_MIN_LENGTH} maxLength={MESSAGE_MAX_LENGTH} value={values.message} className={`${c.className} resize-y`} />
            <p className={`m-0 text-right text-xs ${values.message.length > MESSAGE_MAX_LENGTH ? 'text-danger' : 'text-muted'}`}>
              {values.message.length}/{MESSAGE_MAX_LENGTH}
            </p>
          </>
        )}
      </Field>

      <label className="inline-flex items-start gap-2.5 text-[0.95rem] text-text cursor-pointer">
        <input
          type="checkbox"
          name="subscribeToUpdates"
          checked={values.subscribeToUpdates}
          onChange={handleChange}
          className="mt-1 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        />
        <span>Subscribe to occasional project updates (no spam).</span>
      </label>
    </>
  );
}