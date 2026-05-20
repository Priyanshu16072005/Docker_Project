import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import '../App.css';

export default function Donate() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    foodName: '',
    foodType: '',
    quantity: '',
    pickupAddress: '',
    expiryTime: '',
    notes: '',
    pickupLat: '',
    pickupLng: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [locating, setLocating] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const usePickupLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          pickupLat: pos.coords.latitude,
          pickupLng: pos.coords.longitude,
        }));
        setLocating(false);
      },
      () => {
        setError('Could not get pickup location');
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const result = await api.donate({
        ...form,
        quantity: Number(form.quantity),
        expiryTime: new Date(form.expiryTime).toISOString(),
        pickupLat: form.pickupLat ? Number(form.pickupLat) : undefined,
        pickupLng: form.pickupLng ? Number(form.pickupLng) : undefined,
      });
      const match = result.smartMatch?.ngoName;
      let msg = 'Donation posted successfully!';
      if (match) msg += ` Smart match: ${match}.`;
      if (result.newBadges?.length) {
        msg += ` New badge: ${result.newBadges.map((b) => b.name).join(', ')}!`;
      }
      setSuccess(msg);
      await refreshUser?.();
      setTimeout(() => navigate('/donations'), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <h1>Donate Food</h1>
      <p className="subtitle">Post surplus food for NGOs to accept</p>
      {user?.phone && (
        <p className="meta" style={{ marginBottom: '1rem' }}>
          Your contact for pickup: <strong>{user.phone}</strong>
        </p>
      )}
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Food name
          <input name="foodName" value={form.foodName} onChange={handleChange} required />
        </label>
        <label>
          Food type
          <input
            name="foodType"
            placeholder="e.g. cooked meal, groceries"
            value={form.foodType}
            onChange={handleChange}
          />
        </label>
        <label>
          Quantity (servings)
          <input
            name="quantity"
            type="number"
            min="1"
            value={form.quantity}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Pickup address
          <input name="pickupAddress" value={form.pickupAddress} onChange={handleChange} required />
        </label>
        <label>
          Pickup GPS (better smart matching)
          <button
            type="button"
            className="btn-sm"
            onClick={usePickupLocation}
            disabled={locating}
          >
            {locating ? 'Locating…' : 'Use current location for pickup'}
          </button>
        </label>
        <label>
          Expiry time
          <input
            name="expiryTime"
            type="datetime-local"
            value={form.expiryTime}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Notes (optional)
          <textarea name="notes" rows={3} value={form.notes} onChange={handleChange} />
        </label>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <button type="submit" className="btn-primary">
          Post donation
        </button>
      </form>
    </div>
  );
}
