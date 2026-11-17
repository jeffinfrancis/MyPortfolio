// Admin: sees every message, can edit/delete. User: sees only their own, read-only.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import ContactFields from '../components/contact/ContactFields';
import { FormAlert } from '../components/Field';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../lib/hooks/useForm';
import { useResource } from '../lib/hooks/useResource';
import { messageOf } from '../../services/api';
import { validateContact, toContactValues, REFERRAL_SOURCE_OPTIONS } from '../lib/contactForm';
import type { ContactValues } from '../lib/contactForm';
import type { ContactMessage } from '../types';

const DATE_FORMAT = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

// MongoDB records created before timestamps were added may have a missing,
// null, or malformed createdAt value. Never pass an invalid Date to Intl.
function formatMessageDate(value: unknown): { dateTime?: string; label: string } {
  if (typeof value !== 'string' && typeof value !== 'number' && !(value instanceof Date)) {
    return { label: 'Date unavailable' };
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { label: 'Date unavailable' };
  }

  return {
    dateTime: date.toISOString(),
    label: DATE_FORMAT.format(date)
  };
}

function EditMessageForm({
  message,
  onSave,
  onCancel
}: {
  message: ContactMessage;
  onSave: (values: ContactValues) => Promise<void>;
  onCancel: () => void;
}) {
  const form = useForm<ContactValues>(toContactValues(message), validateContact);
  const onSubmit = form.handleSubmit(async (values) => {
    await onSave(values);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="card grid gap-4">
      <h2 className="m-0 text-xl">Edit message</h2>
      <ContactFields form={form} idPrefix={`edit-${message._id}`} />
      <FormAlert message={form.formError} />
      <div className="flex gap-3">
        <button type="submit" className="btn" disabled={form.submitting}>
          {form.submitting ? 'Saving…' : 'Save changes'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function Messages() {
  const { isAdmin } = useAuth();
  const { items, loading, error, update, remove } = useResource<ContactMessage>('/contacts');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDelete = async (message: ContactMessage) => {
    if (!window.confirm(`Delete the message from ${message.firstName} ${message.lastName}? This can't be undone.`)) return;
    setActionError(null);
    try {
      await remove(message._id);
    } catch (caught) {
      setActionError(messageOf(caught));
    }
  };

  return (
    <section>
      <h1 className="section-title">{isAdmin ? 'Messages' : 'My messages'}</h1>
      <p className="lead">
        {isAdmin
          ? 'Every message sent through the contact form. You can edit or delete them.'
          : 'Messages you sent while signed in.'}
      </p>

      <FormAlert message={actionError} />

      {loading && <p role="status" aria-live="polite" className="mt-6">Loading messages…</p>}
      {error && <FormAlert message={error} />}

      {!loading && !error && items.length === 0 && (
        <div className="card mt-6">
          <p className="m-0">
            No messages yet. <Link to="/contact" className="text-accent underline">Send one from the contact page.</Link>
          </p>
        </div>
      )}

      <ul className="list-none p-0 mt-6 grid gap-4">
        {items.map((message) => (
          <li key={message._id}>
            {editingId === message._id ? (
              <EditMessageForm
                message={message}
                onCancel={() => setEditingId(null)}
                onSave={async (values) => {
                  await update(message._id, values);
                  setEditingId(null);
                }}
              />
            ) : (
              <article className="card grid gap-2">
                <header className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="m-0 text-xl">
                    {message.firstName} {message.lastName}
                  </h2>
                  <time
                    dateTime={formatMessageDate(message.createdAt).dateTime}
                    className="text-sm text-muted"
                  >
                    {formatMessageDate(message.createdAt).label}
                  </time>
                </header>
                <p className="m-0 text-sm">
                  <a href={`mailto:${message.email}`}>{message.email}</a>
                  {' · '}
                  <a href={`tel:${message.phone}`}>{message.phone}</a>
                </p>
                <p className="m-0 text-text whitespace-pre-wrap">{message.message}</p>
                <p className="m-0 text-xs">
                  Prefers {message.preferredContactMethod === 'either' ? 'email or phone' : message.preferredContactMethod}
                  {' · '}Found me via{' '}
                  {REFERRAL_SOURCE_OPTIONS.find((o) => o.value === message.referralSource)?.label ?? message.referralSource}
                  {message.subscribeToUpdates && ' · Subscribed to updates'}
                </p>

                {isAdmin && (
                  <div className="flex gap-2 mt-1">
                    <button type="button" className="btn-secondary btn-sm" onClick={() => setEditingId(message._id)}>
                      Edit
                    </button>
                    <button type="button" className="btn-secondary btn-danger btn-sm" onClick={() => handleDelete(message)}>
                      Delete
                    </button>
                  </div>
                )}
              </article>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}