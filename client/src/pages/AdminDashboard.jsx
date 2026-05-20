import { useEffect, useState } from 'react';
import { api } from '../api/client';
import DonationCard from '../components/DonationCard';
import '../App.css';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [a, u, d] = await Promise.all([
        api.getAnalytics(),
        api.getUsers(),
        api.getDonations(),
      ]);
      setAnalytics(a);
      setUsers(u);
      setDonations(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const removeDonation = async (id) => {
    if (!confirm('Remove fake/invalid donation?')) return;
    try {
      await api.deleteDonation(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const removeUser = async (id) => {
    if (!confirm('Remove this user?')) return;
    try {
      await api.deleteUser(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <p className="loading">Loading…</p>;

  return (
    <div className="page">
      <h1>Admin Panel</h1>
      <p className="subtitle">Manage users, monitor activity, view analytics</p>
      {error && <p className="error">{error}</p>}

      {analytics && (
        <div className="stats-row">
          <div className="stat-card">
            <strong>{analytics.totalUsers}</strong>
            <span>Users</span>
          </div>
          <div className="stat-card">
            <strong>{analytics.totalDonations}</strong>
            <span>Donations</span>
          </div>
          <div className="stat-card">
            <strong>{analytics.delivered}</strong>
            <span>Delivered</span>
          </div>
          <div className="stat-card">
            <strong>{analytics.pending}</strong>
            <span>Pending</span>
          </div>
          <div className="stat-card">
            <strong>{analytics.activeDeliveries}</strong>
            <span>Active deliveries</span>
          </div>
        </div>
      )}

      <h2 style={{ fontSize: '1.1rem' }}>Top donors</h2>
      <ul style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
        {analytics?.topDonors?.map((d) => (
          <li key={d._id}>
            {d.name} — score {d.donationScore}
          </li>
        ))}
      </ul>

      <h2 style={{ fontSize: '1.1rem' }}>Users</h2>
      <div style={{ marginBottom: '2rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--muted)' }}>
              <th style={{ padding: '0.5rem' }}>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '0.5rem' }}>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <button type="button" className="btn-sm danger" onClick={() => removeUser(u._id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: '1.1rem' }}>All donations</h2>
      <div className="card-grid">
        {donations.map((d) => (
          <DonationCard
            key={d._id}
            donation={d}
            actions={
              d.status !== 'delivered' && (
                <button type="button" className="btn-sm danger" onClick={() => removeDonation(d._id)}>
                  Remove fake
                </button>
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
