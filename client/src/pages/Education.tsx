import { useState } from 'react';
import QualificationForm from '../components/education/QualificationForm';
import { FormAlert } from '../components/Field';
import { useAuth } from '../context/AuthContext';
import { useResource } from '../lib/hooks/useResource';
import { messageOf } from '../../services/api';
import type { Qualification } from '../types';

// null = nothing open, 'new' = the add form, otherwise the id being edited.
type Editing = null | 'new' | string;

export default function Education() {
  const { isAdmin } = useAuth();
  const { items, loading, error, create, update, remove } = useResource<Qualification>('/qualifications');
  const [editing, setEditing] = useState<Editing>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDelete = async (item: Qualification) => {
    if (!window.confirm(`Delete "${item.degree}"? This can't be undone.`)) return;
    setActionError(null);
    try {
      await remove(item._id);
    } catch (caught) {
      setActionError(messageOf(caught));
    }
  };

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="section-title">Education</h1>
          <p className="lead">Formal qualifications and certifications, most recent first.</p>
        </div>
        {isAdmin && editing !== 'new' && (
          <button type="button" className="btn" onClick={() => setEditing('new')}>
            Add qualification
          </button>
        )}
      </div>

      <FormAlert message={actionError} />

      {editing === 'new' && (
        <div className="mt-6">
          <QualificationForm
            onCancel={() => setEditing(null)}
            onSave={async (payload) => {
              await create(payload);
              setEditing(null);
            }}
          />
        </div>
      )}

      {loading && <p role="status" aria-live="polite" className="mt-6">Loading…</p>}
      {error && <div className="mt-6"><FormAlert message={error} /></div>}
      {!loading && !error && items.length === 0 && (
        <div className="card mt-6">
          <p className="m-0">
            {isAdmin ? 'No qualifications yet. Use “Add qualification” to create the first one.' : 'No qualifications have been added yet.'}
          </p>
        </div>
      )}

      <ol className="list-none p-0 mt-6 grid gap-4">
        {items.map((item) => {
          if (editing === item._id) {
            return (
              <li key={item._id}>
                <QualificationForm
                  initial={item}
                  onCancel={() => setEditing(null)}
                  onSave={async (payload) => {
                    await update(item._id, payload);
                    setEditing(null);
                  }}
                />
              </li>
            );
          }

          const yearLabel = item.startYear === item.endYear ? `${item.startYear}` : `${item.startYear} – ${item.endYear}`;

          return (
            <li key={item._id} className="card grid gap-5 items-start grid-cols-1 sm:grid-cols-[140px_1fr]">
              <div className="font-bold text-accent text-[1.05rem]">{yearLabel}</div>
              <div>
                <h3 className="mb-1">{item.degree}</h3>
                <p className="text-text mb-1">{item.institution}</p>
                {item.detail && <p className="mb-0">{item.detail}</p>}

                {isAdmin && (
                  <div className="flex gap-2 mt-3">
                    <button type="button" className="btn-secondary btn-sm" onClick={() => setEditing(item._id)}>
                      Edit
                    </button>
                    <button type="button" className="btn-secondary btn-danger btn-sm" onClick={() => handleDelete(item)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}