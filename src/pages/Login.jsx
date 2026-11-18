import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { errorMessage } from '../api/axios';
import { ErrorBox } from '../components/Status';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(form.email, form.password);
      navigate(location.state?.from?.pathname || '/projects', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally { setLoading(false); }
  };

  return (
    <form className="card auth" onSubmit={submit}>
      <h2>Log in</h2>
      <ErrorBox message={error} />
      <input type="email" placeholder="Email" required value={form.email}
             onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="Password" required value={form.password}
             onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button disabled={loading}>{loading ? 'Signing in…' : 'Log in'}</button>
      <p className="muted">No account? <Link to="/register">Register</Link></p>
    </form>
  );
}
