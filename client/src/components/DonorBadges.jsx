export default function DonorBadges({ badges = [], certificates = [], donationScore = 0 }) {
  return (
    <section className="donor-badges">
      <h2>Your impact</h2>
      <p className="donor-score">Donation score: <strong>{donationScore}</strong></p>
      {badges.length > 0 ? (
        <div className="badge-row">
          {badges.map((b) => (
            <span key={b.id} className="donor-badge" title={b.name}>
              {b.icon} {b.name}
            </span>
          ))}
        </div>
      ) : (
        <p className="meta">Donate food to earn your first badge!</p>
      )}
      {certificates.length > 0 && (
        <>
          <h3>Certificates</h3>
          <ul className="cert-list">
            {certificates.map((c) => (
              <li key={c.downloadId}>
                🎓 {c.title}
                <span className="cert-date">{new Date(c.issuedAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
