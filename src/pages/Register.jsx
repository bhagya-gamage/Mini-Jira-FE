import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { errorMessage } from '../api/axios';
import { ErrorBox } from '../components/Status';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'DEVELOPER' });
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try { await register(form); navigate('/projects'); }
    catch (err) { setError(errorMessage(err)); }
  };

  return (
    <form className="card auth" onSubmit={submit}>
      <h2>Create account</h2>
      <ErrorBox message={error} />
      <input placeholder="Full name" required value={form.fullName} onChange={set('fullName')} />
      <input type="email" placeholder="Email" required value={form.email} onChange={set('email')} />
      <input type="password" placeholder="Password (min 8 chars)" required value={form.password} onChange={set('password')} />
      <select value={form.role} onChange={set('role')}>
        <option value="DEVELOPER">Developer</option>
        <option value="PROJECT_MANAGER">Project Manager</option>
      </select>
      <button>Register</button>
      <p className="muted">Have an account? <Link to="/login">Log in</Link></p>
    </form>
  );
}
