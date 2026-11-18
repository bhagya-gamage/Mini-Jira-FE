import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { ErrorBox, Loading } from '../components/Status';

export default function Projects() {
  const { isManager } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    api.get('/projects')
      .then((r) => setProjects(r.data))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const create = async (e) => {
    e.preventDefault(); setError('');
    try {
      const { data } = await api.post('/projects', form);
      setProjects((p) => [data, ...p]);
      setForm({ name: '', description: '' });
    } catch (err) { setError(errorMessage(err)); }
  };

  return (
    <>
      <h2>Projects</h2>
      <ErrorBox message={error} />
      {isManager && (
        <form className="card row" onSubmit={create}>
          <input placeholder="Project name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button>Create</button>
        </form>
      )}
      {loading ? <Loading /> : projects.length === 0 ? <p className="muted">No projects yet.</p> : (
        <div className="grid">
          {projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.id}`} className="card link">
              <h3>{p.name}</h3>
              <p className="muted">{p.description || 'No description'}</p>
              <small>Owner: {p.ownerName}</small>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
