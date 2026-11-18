import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Layout() {
  const { user, isManager, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <>
      <header className="nav">
        <Link to="/projects" className="brand">Mini Jira</Link>
        <nav>
          <NavLink to="/projects">Projects</NavLink>
          {isManager && <NavLink to="/dashboard">Dashboard</NavLink>}
        </nav>
        <div className="spacer" />
        <span className="muted">{user.fullName} · {user.role.replace('_', ' ')}</span>
        <button className="ghost" onClick={() => { logout(); navigate('/login'); }}>Log out</button>
      </header>
      <main><Outlet /></main>
    </>
  );
}
