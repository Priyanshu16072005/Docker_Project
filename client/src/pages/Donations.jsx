import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import DonationCard from '../components/DonationCard';
import DonorBadges from '../components/DonorBadges';
import '../App.css';

export default function Donations() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    const params = user?.role === 'ngo' ? '?nearby=true' : '';
    api
      .getDonations(params)
      .then(setDonations)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [user?.role]);

  const handleDelete = async (id) => {
    if (!confirm('Remove this donation?')) return;
    try {
      await api.deleteDonation(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <p className="loading">Loading donations…</p>;

  return (
    <div className="page">
      <h1>Donations</h1>
      <p className="subtitle">
        {user?.role === 'donor' ? 'Your donation history' : 'Available and active donations'}
      </p>
      {error && <p className="error">{error}</p>}
      {user?.role === 'donor' && (
        <DonorBadges
          badges={user.badges}
          certificates={user.certificates}
          donationScore={user.donationScore}
        />
      )}
      <div className="card-grid">
        {donations.map((d) => (
          <DonationCard
            key={d._id}
            donation={d}
            actions={
              (user?.role === 'admin' ||
                (user?.role === 'donor' && d.status === 'pending')) && (
                <button type="button" className="btn-sm danger" onClick={() => handleDelete(d._id)}>
                  Remove
                </button>
              )
            }
          />
        ))}
      </div>
      {donations.length === 0 && <p style={{ color: 'var(--muted)' }}>No donations yet.</p>}
    </div>
  );
}
