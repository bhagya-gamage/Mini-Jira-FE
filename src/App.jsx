import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Projects from './pages/Projects';
import Board from './pages/Board';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<Board />} />
          <Route element={<ProtectedRoute managerOnly />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
}
