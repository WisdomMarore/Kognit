const THRESHOLDS = [
  { days: 100, emoji: '👑', label: 'Century' },
  { days: 60, emoji: '🥇', label: 'Gold' },
  { days: 30, emoji: '🏆', label: 'One Month' },
  { days: 14, emoji: '💪', label: 'Two Weeks' },
  { days: 7, emoji: '⚡', label: 'One Week' },
  { days: 3, emoji: '🔥', label: 'Building' },
  { days: 1, emoji: '🌱', label: 'Started' },
];

export function getStreakBadge(days) {
  return THRESHOLDS.find((t) => days >= t.days) || null;
}

// Returns the badge that was just newly reached going from `before` to `after`,
// or null if no new threshold was crossed.
export function getNewlyCrossedBadge(before, after) {
  const beforeBadge = getStreakBadge(before);
  const afterBadge = getStreakBadge(after);
  if (afterBadge && afterBadge.days !== beforeBadge?.days) {
    return afterBadge;
  }
  return null;
}