import { useEffect, useState } from 'react';
import api, { errorMessage } from '../api/axios';
import { ErrorBox, Loading } from '../components/Status';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/reports/tasks-per-developer'),
      api.get('/reports/overdue-by-project'),
      api.get('/reports/completion-rate'),
    ])
      .then(([a, b, c]) => setData({ perDev: a.data, overdue: b.data, completion: c.data }))
      .catch((e) => setError(errorMessage(e)));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;
  const max = Math.max(1, ...data.perDev.map((d) => d.taskCount));

  return (
    <>
      <h2>Dashboard</h2>
      <div className="grid">
        <section className="card">
          <h3>Tasks per developer</h3>
          {data.perDev.length === 0 && <p className="muted">No assigned tasks.</p>}
          {data.perDev.map((d) => (
            <div key={d.developer} className="bar-row">
              <span>{d.developer}</span>
              <div className="bar"><div style={{ width: `${(d.taskCount / max) * 100}%` }} /></div>
              <b>{d.taskCount}</b>
            </div>
          ))}
        </section>

        <section className="card">
          <h3>Overdue tasks per project</h3>
          {data.overdue.length === 0 && <p className="muted">Nothing overdue 🎉</p>}
          <table><tbody>
            {data.overdue.map((o) => <tr key={o.project}><td>{o.project}</td><td className="overdue">{o.overdueTasks}</td></tr>)}
          </tbody></table>
        </section>

        <section className="card">
          <h3>Completion rate</h3>
          {data.completion.map((c) => (
            <div key={c.project} className="bar-row">
              <span>{c.project}</span>
              <div className="bar"><div style={{ width: `${c.completionPercent}%` }} /></div>
              <b>{c.completionPercent}%</b>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
