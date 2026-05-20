const STATUS_LABELS = {
  pending: 'Pending',
  accepted: 'Accepted',
  assigned: 'Volunteer assigned',
  picked_up: 'Picked up',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function DonationCard({ donation, actions, highlight }) {
  const expiry = new Date(donation.expiryTime);
  const isExpiringSoon = expiry - Date.now() < 2 * 60 * 60 * 1000;
  const match = donation.smartMatch || donation.suggestedNgoId;

  return (
    <article
      className={`donation-card status-${donation.status}${highlight ? ' donation-highlight' : ''}`}
    >
      <div className="donation-card-header">
        <h3>{donation.foodName}</h3>
        <span className={`badge badge-${donation.status}`}>
          {STATUS_LABELS[donation.status] || donation.status}
        </span>
      </div>
      {donation.foodType && <p className="meta">Type: {donation.foodType}</p>}
      <p className="meta">Quantity: {donation.quantity} servings</p>
      <p className="meta">Pickup: {donation.pickupAddress}</p>
      <p className={`meta ${isExpiringSoon ? 'expiring' : ''}`}>
        Expires: {expiry.toLocaleString()}
        {isExpiringSoon && ' — expiring soon!'}
      </p>
      {donation.donorId?.name && (
        <p className="meta">
          Donor: {donation.donorId.name}
          {donation.donorId.phone && (
            <span className="contact-line"> · 📞 {donation.donorId.phone}</span>
          )}
        </p>
      )}
      {match && (
        <p className="meta smart-match">
          ✨ Smart match: {donation.smartMatch?.ngoName || donation.suggestedNgoId?.name}
          {donation.smartMatch?.distanceKm != null &&
            ` (${donation.smartMatch.distanceKm} km)`}
          {donation.smartMatch?.score != null && ` · score ${donation.smartMatch.score}`}
        </p>
      )}
      {actions && <div className="donation-actions">{actions}</div>}
    </article>
  );
}
