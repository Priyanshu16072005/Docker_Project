import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Donate from './pages/Donate';
import Donations from './pages/Donations';
import NgoDashboard from './pages/NgoDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AdminDashboard from './pages/AdminDashboard';

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="loading">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route
          path="donate"
          element={
            <PrivateRoute roles={['donor', 'admin']}>
              <Donate />
            </PrivateRoute>
          }
        />
        <Route
          path="donations"
          element={
            <PrivateRoute>
              <Donations />
            </PrivateRoute>
          }
        />
        <Route
          path="ngo"
          element={
            <PrivateRoute roles={['ngo', 'admin']}>
              <NgoDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="volunteer"
          element={
            <PrivateRoute roles={['volunteer', 'admin']}>
              <VolunteerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="admin"
          element={
            <PrivateRoute roles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
}
