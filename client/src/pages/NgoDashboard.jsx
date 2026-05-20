import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import DonationCard from '../components/DonationCard';
import '../App.css';

export default function NgoDashboard() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [d, del] = await Promise.all([
        api.getDonations('?status=pending'),
        api.getDeliveries(),
      ]);
      setDonations(d);
      setDeliveries(del);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 45000);
    return () => clearInterval(id);
  }, []);

  const acceptDonation = async (id) => {
    try {
      await api.updateDonation(id, { status: 'accepted' });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <p className="loading">Loading…</p>;

  const pending = donations.filter((d) => d.status === 'pending');
  const suggestedForYou = pending.filter(
    (d) =>
      d.suggestedNgoId?._id === user?.id ||
      d.suggestedNgoId?.toString?.() === user?.id ||
      d.smartMatch?.ngoId?.toString() === user?.id
  );

  return (
    <div className="page">
      <h1>NGO Dashboard</h1>
      <p className="subtitle">
        Smart match highlights donations best suited for your location and capacity.
      </p>
      {error && <p className="error">{error}</p>}

      {suggestedForYou.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.1rem' }}>Recommended for you (smart match)</h2>
          <div className="card-grid" style={{ marginBottom: '2rem' }}>
            {suggestedForYou.map((d) => (
              <DonationCard
                key={d._id}
                donation={d}
                highlight
                actions={
                  <button type="button" className="btn-sm" onClick={() => acceptDonation(d._id)}>
                    Accept request
                  </button>
                }
              />
            ))}
          </div>
        </>
      )}

      <h2 style={{ fontSize: '1.1rem' }}>All pending donations</h2>
      <div className="card-grid" style={{ marginBottom: '2rem' }}>
        {pending.map((d) => (
          <DonationCard
            key={d._id}
            donation={d}
            highlight={
              d.suggestedNgoId?._id === user?.id || d.smartMatch?.ngoId?.toString() === user?.id
            }
            actions={
              <button type="button" className="btn-sm" onClick={() => acceptDonation(d._id)}>
                Accept request
              </button>
            }
          />
        ))}
        {pending.length === 0 && (
          <p style={{ color: 'var(--muted)' }}>No pending donations. You will be notified when donors post food.</p>
        )}
      </div>

      <h2 style={{ fontSize: '1.1rem' }}>Active deliveries</h2>
      <div className="card-grid">
        {deliveries.map((del) => (
          <article key={del._id} className="donation-card">
            <h3>{del.donationId?.foodName || 'Delivery'}</h3>
            <p className="meta">Status: {del.deliveryStatus}</p>
            <p className="meta">Volunteer: {del.volunteerId?.name || '—'}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
