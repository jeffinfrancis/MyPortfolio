import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FormAlert } from '../components/Field';
import ProjectForm from '../components/projects/ProjectForm';
import { useAuth } from '../context/AuthContext';
import { useResource } from '../lib/hooks/useResource';
import { messageOf } from '../../services/api';
import { projectImage } from '../lib/projectImage';
import type { Project } from '../types';

type Editing = null | 'new' | string;

export default function Projects() {
  const { isAdmin } = useAuth();
  const { items, loading, error, create, update, remove } = useResource<Project>('/projects');
  const [editing, setEditing] = useState<Editing>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDelete = async (project: Project) => {
    if (!window.confirm(`Delete "${project.title}"? This can't be undone.`)) return;
    setActionError(null);
    try {
      await remove(project._id);
    } catch (caught) {
      setActionError(messageOf(caught));
    }
  };

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="section-title">Projects</h1>
          <p className="lead">
            A few things I've shipped recently. Each card describes my role and the
            outcome the work produced — click a title for the full write-up.
          </p>
        </div>
        {isAdmin && editing !== 'new' && (
          <button type="button" className="btn" onClick={() => setEditing('new')}>
            Add project
          </button>
        )}
      </div>

      <FormAlert message={actionError} />

      {editing === 'new' && (
        <div className="mt-6">
          <ProjectForm
            onCancel={() => setEditing(null)}
            onSave={async (payload) => {
              await create(payload);
              setEditing(null);
            }}
          />
        </div>
      )}

      {loading && <p role="status" aria-live="polite" className="mt-6">Loading projects…</p>}
      {error && <div className="mt-6"><FormAlert message={error} /></div>}
      {!loading && !error && items.length === 0 && (
        <div className="card mt-6">
          <p className="m-0">
            {isAdmin ? 'No projects yet. Use “Add project” to create the first one.' : 'No projects have been added yet.'}
          </p>
        </div>
      )}

      <div className="grid gap-5 mt-6 grid-cols-1 md:grid-cols-3">
        {items.map((project) =>
          editing === project._id ? (
            <div key={project._id} className="md:col-span-3">
              <ProjectForm
                initial={project}
                onCancel={() => setEditing(null)}
                onSave={async (payload) => {
                  await update(project._id, payload);
                  setEditing(null);
                }}
              />
            </div>
          ) : (
            <article key={project._id} className="card flex flex-col gap-2">
              <img
                src={projectImage(project)}
                alt=""
                loading="lazy"
                className="w-full h-40 object-cover rounded-md bg-surface-2"
              />
              <h3 className="mt-2 mb-0 text-text">
                <Link to={`/projects/${project._id}`} className="text-inherit no-underline hover:text-accent hover:underline">
                  {project.title}
                </Link>
              </h3>
              <p className="text-accent font-semibold text-[0.95rem] m-0">{project.role}</p>
              <p className="mt-1 mb-0">{project.outcome}</p>
              <Link
                to={`/projects/${project._id}`}
                aria-label={`Read more about ${project.title}`}
                className="self-start mt-1 text-accent font-semibold no-underline hover:underline"
              >
                Details →
              </Link>

              {isAdmin && (
                <div className="flex gap-2 mt-2">
                  <button type="button" className="btn-secondary btn-sm" onClick={() => setEditing(project._id)}>
                    Edit
                  </button>
                  <button type="button" className="btn-secondary btn-danger btn-sm" onClick={() => handleDelete(project)}>
                    Delete
                  </button>
                </div>
              )}
            </article>
          )
        )}
      </div>
    </section>
  );
}