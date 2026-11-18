import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { errorMessage } from '../api/axios';
import { ErrorBox, Loading } from '../components/Status';

const COLUMNS = [
  { key: 'TODO', label: 'To Do' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'DONE', label: 'Done' },
];

export default function Board() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setProject((await api.get(`/projects/${id}`)).data);
        const { data } = await api.get(`/projects/${id}/tasks`, { params: { size: 200, sort: 'createdAt,desc' } });
        setTasks(data.content);
      } catch (e) { setError(errorMessage(e)); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const byStatus = useMemo(() => {
    const g = { TODO: [], IN_PROGRESS: [], DONE: [] };
    tasks.forEach((t) => g[t.status].push(t));
    return g;
  }, [tasks]);

  return (
    <>
      <h2>{project?.name ?? 'Project'}</h2>
      <p className="muted">{project?.description}</p>
      <ErrorBox message={error} />

      {loading ? <Loading /> : (
        <div className="board">
          {COLUMNS.map((col) => (
            <div key={col.key} className="column">
              <h4>{col.label} <span className="badge">{byStatus[col.key].length}</span></h4>
              {byStatus[col.key].map((t) => (
                <div key={t.id} className={`task p-${t.priority}`}>
                  <strong>{t.title}</strong>
                  <div className="meta">
                    <span className="tag">{t.priority}</span>
                    {t.dueDate && <span className={new Date(t.dueDate) < new Date() && t.status !== 'DONE' ? 'overdue' : ''}>Due {t.dueDate}</span>}
                    <span>{t.assigneeName ?? 'Unassigned'}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
}