import { useEffect, useState } from 'react';
import { api } from '../api/client';
import DonationCard from '../components/DonationCard';
import '../App.css';

export default function VolunteerDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [del, donations] = await Promise.all([
        api.getDeliveries(),
        api.getDonations('?status=accepted'),
      ]);
      setDeliveries(del);
      setAvailable(donations.filter((d) => d.status === 'accepted'));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const pickTask = async (donationId) => {
    try {
      await api.pickTask({ donationId });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const updateStatus = async (deliveryId, deliveryStatus) => {
    try {
      await api.updateDeliveryStatus(deliveryId, { deliveryStatus });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <p className="loading">Loading…</p>;

  return (
    <div className="page">
      <h1>Volunteer Dashboard</h1>
      <p className="subtitle">Pick tasks, navigate to pickup, mark delivery complete</p>
      {error && <p className="error">{error}</p>}

      <h2 style={{ fontSize: '1.1rem' }}>Available tasks</h2>
      <div className="card-grid" style={{ marginBottom: '2rem' }}>
        {available.map((d) => (
          <DonationCard
            key={d._id}
            donation={d}
            actions={
              <button type="button" className="btn-sm" onClick={() => pickTask(d._id)}>
                Pick this task
              </button>
            }
          />
        ))}
        {available.length === 0 && (
          <p style={{ color: 'var(--muted)' }}>No accepted donations waiting for pickup.</p>
        )}
      </div>

      <h2 style={{ fontSize: '1.1rem' }}>My deliveries</h2>
      <div className="card-grid">
        {deliveries.map((del) => (
          <article key={del._id} className="donation-card">
            <h3>{del.donationId?.foodName}</h3>
            <p className="meta">Pickup: {del.donationId?.pickupAddress}</p>
            <p className="meta">Status: {del.deliveryStatus}</p>
            <div className="donation-actions">
              {del.deliveryStatus === 'assigned' && (
                <button
                  type="button"
                  className="btn-sm"
                  onClick={() => updateStatus(del._id, 'in_transit')}
                >
                  Picked up
                </button>
              )}
              {del.deliveryStatus === 'in_transit' && (
                <button
                  type="button"
                  className="btn-sm"
                  onClick={() => updateStatus(del._id, 'completed')}
                >
                  Mark delivered
                </button>
              )}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(del.donationId?.pickupAddress || '')}`}
                target="_blank"
                rel="noreferrer"
                className="btn-sm"
                style={{ display: 'inline-block', textAlign: 'center' }}
              >
                Open in Maps
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
