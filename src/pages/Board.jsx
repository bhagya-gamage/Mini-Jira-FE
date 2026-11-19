import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { errorMessage } from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { ErrorBox, Loading } from '../components/Status';

const COLUMNS = [
  { key: 'TODO', label: 'To Do' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'DONE', label: 'Done' },
];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function Board() {
  const { id } = useParams();
  const { isManager } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filters, setFilters] = useState({ q: '', assigneeId: '' });
  const [form, setForm] = useState({ title: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTasks = useCallback(async () => {
    const params = { size: 200, sort: 'createdAt,desc' };
    if (filters.q) params.q = filters.q;
    if (filters.assigneeId) params.assigneeId = filters.assigneeId;
    const { data } = await api.get(`/projects/${id}/tasks`, { params });
    setTasks(data.content);
  }, [id, filters]);

  const loadMembers = useCallback(async () => {
    setMembers((await api.get(`/projects/${id}/members`)).data);
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        setProject((await api.get(`/projects/${id}`)).data);
        await loadMembers();
        if (isManager) setAllUsers((await api.get('/users')).data);
      } catch (e) { setError(errorMessage(e)); }
    })();
  }, [id, isManager, loadMembers]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      loadTasks().catch((e) => setError(errorMessage(e))).finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [loadTasks]);

  const byStatus = useMemo(() => {
    const g = { TODO: [], IN_PROGRESS: [], DONE: [] };
    tasks.forEach((t) => g[t.status].push(t));
    return g;
  }, [tasks]);

  const createTask = async (e) => {
    e.preventDefault(); setError('');
    try {
      await api.post(`/projects/${id}/tasks`, {
        title: form.title, priority: form.priority,
        dueDate: form.dueDate || null, assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
      });
      setForm({ title: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
      await loadTasks();
    } catch (err) { setError(errorMessage(err)); }
  };

  const moveTask = async (taskId, status) => {
    const prev = tasks;
    setTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, status } : t)));
    try { await api.patch(`/tasks/${taskId}/status`, { status }); }
    catch (err) { setTasks(prev); setError(errorMessage(err)); }
  };

  const addMember = async (e) => {
    e.preventDefault();
    const userId = Number(e.target.userId.value);
    if (!userId) return;
    try { await api.post(`/projects/${id}/members`, { userId }); await loadMembers(); }
    catch (err) { setError(errorMessage(err)); }
  };

  const memberIds = new Set(members.map((m) => m.userId));

  return (
    <>
      <h2>{project?.name ?? 'Project'}</h2>
      <p className="muted">{project?.description}</p>
      <ErrorBox message={error} />

      <form className="card row" onSubmit={createTask}>
        <input placeholder="New task title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
          {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
        </select>
        <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        <select value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>
          <option value="">Unassigned</option>
          {members.map((m) => <option key={m.userId} value={m.userId}>{m.fullName}</option>)}
        </select>
        <button>Add task</button>
      </form>

      <div className="row filters">
        <input placeholder="Search title…" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
        <select value={filters.assigneeId} onChange={(e) => setFilters({ ...filters, assigneeId: e.target.value })}>
          <option value="">All assignees</option>
          {members.map((m) => <option key={m.userId} value={m.userId}>{m.fullName}</option>)}
        </select>
        {isManager && (
          <form className="row" onSubmit={addMember}>
            <select name="userId" defaultValue="">
              <option value="">Add member…</option>
              {allUsers.filter((u) => !memberIds.has(u.id)).map((u) => <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>)}
            </select>
            <button className="ghost">Add</button>
          </form>
        )}
      </div>

      {loading && tasks.length === 0 ? <Loading /> : (
        <div className="board">
          {COLUMNS.map((col) => (
            <div key={col.key} className="column"
                 onDragOver={(e) => e.preventDefault()}
                 onDrop={(e) => {
                   const taskId = Number(e.dataTransfer.getData('text/plain'));
                   const t = tasks.find((x) => x.id === taskId);
                   if (t && t.status !== col.key) moveTask(taskId, col.key);
                 }}>
              <h4>{col.label} <span className="badge">{byStatus[col.key].length}</span></h4>
              {byStatus[col.key].map((t) => (
                <div key={t.id} className={`task p-${t.priority}`} draggable
                     onDragStart={(e) => e.dataTransfer.setData('text/plain', String(t.id))}>
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