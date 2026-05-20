import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

const STEPS = [
  { icon: '🍱', title: 'Donor posts food', desc: 'Surplus meals listed with pickup time & location.' },
  { icon: '🤝', title: 'Smart NGO match', desc: 'Nearest NGO picked by distance & capacity.' },
  { icon: '🚗', title: 'Volunteer delivers', desc: 'Pickup → delivery with live status updates.' },
  { icon: '✅', title: 'Meals served', desc: 'Tracked from pending to delivered in MongoDB.' },
];

const ROLES = [
  { icon: '🏪', title: 'Donor', desc: 'Restaurants, hotels, shops & events', to: '/register' },
  { icon: '🏛️', title: 'NGO', desc: 'Accept & coordinate distribution', to: '/register' },
  { icon: '💚', title: 'Volunteer', desc: 'Pick up and deliver food', to: '/register' },
];

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {});
  }, []);

  const cta = user
    ? {
        donor: { to: '/donate', label: 'Donate food now' },
        ngo: { to: '/ngo', label: 'Open NGO dashboard' },
        volunteer: { to: '/volunteer', label: 'Pick a delivery' },
        admin: { to: '/admin', label: 'Admin panel' },
      }[user.role]
    : { to: '/register', label: 'Join the network' };

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-badge">MERN · Smart matching · Real-time tracking</div>
        <h1 className="hero-title">
          Surplus food.
          <br />
          <span className="hero-highlight">Zero waste.</span>
        </h1>
        <p className="hero-tagline">
          Food For All connects donors, NGOs, and volunteers so extra meals reach hungry people
          — not landfills.
        </p>
        <div className="hero-actions">
          <Link to={cta.to} className="hero-cta primary">
            {cta.label}
          </Link>
          {!user && (
            <Link to="/login" className="hero-cta secondary">
              Sign in
            </Link>
          )}
        </div>
      </section>

      {stats && (
        <section className="impact-strip">
          <div className="impact-card">
            <strong>{stats.totalUsers}</strong>
            <span>People in network</span>
          </div>
          <div className="impact-card">
            <strong>{stats.totalDonations}</strong>
            <span>Donations posted</span>
          </div>
          <div className="impact-card accent">
            <strong>{stats.delivered}</strong>
            <span>Successfully delivered</span>
          </div>
          <div className="impact-card warm">
            <strong>{stats.mealsServed}+</strong>
            <span>Meals served</span>
          </div>
        </section>
      )}

      <section className="section-block">
        <h2 className="section-title">How it works</h2>
        <p className="section-desc">Four steps from kitchen surplus to someone&apos;s plate</p>
        <div className="workflow-grid">
          {STEPS.map((step, i) => (
            <article key={step.title} className="workflow-step" style={{ animationDelay: `${i * 0.08}s` }}>
              <span className="step-icon">{step.icon}</span>
              <span className="step-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <h2 className="section-title">Who joins?</h2>
        <div className="roles-grid">
          {ROLES.map((r) => (
            <Link key={r.title} to={r.to} className="role-card">
              <span className="role-icon">{r.icon}</span>
              <h3>{r.title}</h3>
              <p>{r.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="cta-banner">
        <h2>Ready to make an impact?</h2>
        <p>Every donation counts toward badges, certificates, and real meals served.</p>
        <Link to={user ? cta.to : '/register'} className="hero-cta primary">
          {user ? cta.label : 'Create free account'}
        </Link>
      </section>
    </div>
  );
}
