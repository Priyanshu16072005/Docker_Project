import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const ROLES = [
  { value: 'donor', label: 'Donor (restaurant, hotel, shop)' },
  { value: 'ngo', label: 'NGO' },
  { value: 'volunteer', label: 'Volunteer' },
];

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'donor',
    phone: '',
    address: '',
    lat: '',
    lng: '',
    vehicleAvailability: '',
  });
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }));
        setLocating(false);
      },
      () => {
        setError('Could not get your location');
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        lat: form.lat ? Number(form.lat) : undefined,
        lng: form.lng ? Number(form.lng) : undefined,
        vehicleAvailability:
          form.role === 'ngo' ? Number(form.vehicleAvailability) : undefined,
      };
      const user = await register(payload);
      const routes = { donor: '/donate', ngo: '/ngo', volunteer: '/volunteer', admin: '/admin' };
      navigate(routes[user.role] || '/');
    } catch (err) {
      setError(err.message);
    }
  };

  const isNgo = form.role === 'ngo';

  return (
    <div className="page auth-page">
      <h1>Join the network</h1>
      <p className="subtitle">Create your Food For All account</p>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            minLength={6}
            required
          />
        </label>
        <label>
          I am a
          <select name="role" value={form.role} onChange={handleChange}>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Contact phone <span className="required-tag">required</span>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            required
          />
        </label>
        <label>
          Address {isNgo && <span className="required-tag">required for NGO</span>}
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            required={isNgo}
          />
        </label>
        {isNgo && (
          <>
            <label>
              Vehicle capacity (max servings you can transport){' '}
              <span className="required-tag">required</span>
              <input
                name="vehicleAvailability"
                type="number"
                min="1"
                value={form.vehicleAvailability}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Location (for smart matching)
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input name="lat" placeholder="Latitude" value={form.lat} onChange={handleChange} />
                <input name="lng" placeholder="Longitude" value={form.lng} onChange={handleChange} />
              </div>
              <button
                type="button"
                className="btn-sm"
                style={{ marginTop: '0.5rem' }}
                onClick={useMyLocation}
                disabled={locating}
              >
                {locating ? 'Getting location…' : 'Use my location'}
              </button>
            </label>
          </>
        )}
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn-primary">
          Create account
        </button>
      </form>
      <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
