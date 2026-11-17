import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError, api, messageOf } from '../../services/api';
import { projectImage } from '../lib/projectImage';
import type { Project } from '../types';

type State =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'error'; message: string }
  | { status: 'ready'; project: Project };

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    api
      .get<Project>(`/projects/${id}`)
      .then((project) => !cancelled && setState({ status: 'ready', project }))
      .catch((caught) => {
        if (cancelled) return;
        // 404 = no such project; 400 = the id isn't even a valid id.
        const missing = caught instanceof ApiError && (caught.status === 404 || caught.status === 400);
        setState(missing ? { status: 'missing' } : { status: 'error', message: messageOf(caught) });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state.status === 'loading') {
    return <p role="status" aria-live="polite">Loading project…</p>;
  }

  if (state.status === 'missing' || state.status === 'error') {
    return (
      <section className="max-w-3xl">
        <h1 className="section-title">{state.status === 'missing' ? 'Project not found' : "Couldn't load the project"}</h1>
        <p className="lead">
          {state.status === 'missing' ? "The project you tried to open doesn't exist (or was removed)." : state.message}
        </p>
        <p>
          <Link className="btn" to="/projects">← Back to projects</Link>
        </p>
      </section>
    );
  }

  const { project } = state;

  return (
    <article className="max-w-3xl">
      <p className="mb-4 text-sm">
        <Link to="/projects" className="text-muted no-underline hover:text-accent hover:underline">← Back to projects</Link>
      </p>

      <header className="grid gap-1 mb-5">
        <h1 className="m-0 text-3xl leading-tight">{project.title}</h1>
        <p className="m-0 text-accent font-semibold">{project.role}</p>
        {project.timeline && <p className="m-0 text-muted text-sm">{project.timeline}</p>}
      </header>

      <img src={projectImage(project)} alt="" className="w-full h-64 object-cover rounded-md bg-surface-2 mb-5" />

      <p className="text-text leading-7 mb-4">{project.outcome}</p>

      {project.description.length > 0 && (
        <div className="grid gap-4 text-text leading-7 mb-6">
          {project.description.map((paragraph, index) => (
            <p key={index} className="m-0">{paragraph}</p>
          ))}
        </div>
      )}

      {project.techStack.length > 0 && (
        <section className="mb-6">
          <h2 className="m-0 mb-2 text-base text-muted font-semibold uppercase tracking-wider">Tech stack</h2>
          <ul className="list-none p-0 m-0 flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <li key={tech} className="tag">{tech}</li>
            ))}
          </ul>
        </section>
      )}

      {(project.liveUrl || project.repoUrl) && (
        <section className="flex flex-wrap gap-2.5">
          {project.liveUrl && (
            <a className="btn" href={project.liveUrl} target="_blank" rel="noreferrer noopener">Live site ↗</a>
          )}
          {project.repoUrl && (
            <a className="btn btn-secondary" href={project.repoUrl} target="_blank" rel="noreferrer noopener">Source code ↗</a>
          )}
        </section>
      )}
    </article>
  );
}