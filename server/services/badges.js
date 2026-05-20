const BADGE_DEFS = [
  { id: 'first_bite', name: 'First Bite', icon: '🥗', minScore: 1 },
  { id: 'community_hero', name: 'Community Hero', icon: '⭐', minScore: 5 },
  { id: 'food_champion', name: 'Food Champion', icon: '🏆', minScore: 10 },
  { id: 'legend_donor', name: 'Legend Donor', icon: '💎', minScore: 25 },
  { id: 'golden_plate', name: 'Golden Plate', icon: '🥇', minScore: 50 },
];

const CERTIFICATE_THRESHOLDS = [10, 25, 50];

function badgesForScore(score) {
  return BADGE_DEFS.filter((b) => score >= b.minScore).map((b) => ({
    id: b.id,
    name: b.name,
    icon: b.icon,
    earnedAt: new Date(),
  }));
}

function newCertificates(score, existing = []) {
  const existingLevels = new Set(existing.map((c) => c.level));
  const certs = [];
  for (const level of CERTIFICATE_THRESHOLDS) {
    if (score >= level && !existingLevels.has(level)) {
      certs.push({
        level,
        title: `Food For All Donor Certificate — Level ${level}`,
        issuedAt: new Date(),
        downloadId: `cert-${level}-${Date.now()}`,
      });
    }
  }
  return certs;
}

async function applyDonorRewards(userId, User) {
  const user = await User.findById(userId);
  if (!user || user.role !== 'donor') return { badges: [], certificates: [] };

  const earned = badgesForScore(user.donationScore);
  const newBadgeIds = earned.filter((b) => !user.badges?.some((x) => x.id === b.id));
  user.badges = earned;

  const addedCerts = newCertificates(user.donationScore, user.certificates || []);
  user.certificates = [...(user.certificates || []), ...addedCerts];
  await user.save();

  return { newBadges: newBadgeIds, newCertificates: addedCerts };
}

module.exports = { BADGE_DEFS, badgesForScore, applyDonorRewards };
