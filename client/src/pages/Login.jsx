import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      const routes = { donor: '/donate', ngo: '/ngo', volunteer: '/volunteer', admin: '/admin' };
      navigate(routes[user.role] || '/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page auth-page">
      <h1>Welcome back</h1>
      <p className="subtitle">Sign in to Food For All</p>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn-primary">
          Login
        </button>
      </form>
      <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
