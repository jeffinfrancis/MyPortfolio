import { useNavigate } from 'react-router-dom';
import ContactFields from '../components/contact/ContactFields';
import { FormAlert } from '../components/Field';
import { useForm } from '../lib/hooks/useForm';
import { api } from '../../services/api';
import { EMPTY_CONTACT, validateContact } from '../lib/contactForm';
import type { ContactValues } from '../lib/contactForm';

export default function Contact() {
  const navigate = useNavigate();
  const form = useForm<ContactValues>(EMPTY_CONTACT, validateContact);

  const onSubmit = form.handleSubmit(async (values) => {
    await api.post('/contacts', values);
    navigate('/', {
      state: { justSubmitted: true, firstName: values.firstName, lastName: values.lastName }
    });
  });

  return (
    <section>
      <h1 className="section-title">Contact Me</h1>
      <p className="lead">
        Want to work together, ask a question, or just say hello? Reach out below
        and I'll get back to you within a couple of business days.
      </p>

      <div className="grid gap-5 mt-6 items-start grid-cols-1 md:grid-cols-[1fr_1.4fr]">
        <aside className="card">
          <h2 className="mt-0">Get in touch</h2>
          <dl className="m-0 grid gap-3">
            <div className="grid grid-cols-[90px_1fr] gap-2">
              <dt className="text-muted font-semibold">Email</dt>
              <dd className="m-0 text-text">
                <a href="mailto:hello@billchen.dev">jfran123@my.centennialcollege.ca</a>
              </dd>
            </div>
            <div className="grid grid-cols-[90px_1fr] gap-2">
              <dt className="text-muted font-semibold">Phone</dt>
              <dd className="m-0 text-text">
                <a href="tel:+15555550123">+1 (111) 111-1111</a>
              </dd>
            </div>
            <div className="grid grid-cols-[90px_1fr] gap-2">
              <dt className="text-muted font-semibold">Location</dt>
              <dd className="m-0 text-text">London, Canada — open to remote</dd>
            </div>
            <div className="grid grid-cols-[90px_1fr] gap-2">
              <dt className="text-muted font-semibold">Availability</dt>
              <dd className="m-0 text-text">Mon–Fri, 9am–6pm ET</dd>
            </div>
          </dl>
        </aside>

        <form onSubmit={onSubmit} noValidate className="card grid gap-4">
          <ContactFields form={form} idPrefix="contact" />
          <FormAlert message={form.formError} />
          <button type="submit" className="btn justify-self-start" disabled={form.submitting}>
            {form.submitting ? 'Sending…' : 'Send Message'}
          </button>
        </form>
      </div>
    </section>
  );
}