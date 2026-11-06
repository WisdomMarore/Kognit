import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { getNewlyCrossedBadge } from '../utils/streak';
import AmbientSound from '../components/AmbientSound';

const RATINGS = [
  { label: 'Again', value: 0, className: 'bg-rose text-paper hover:opacity-90' },
  { label: 'Hard', value: 1, className: 'bg-ink-2 text-paper border border-sand/30 hover:border-sand' },
  { label: 'Good', value: 2, className: 'bg-moss text-paper hover:opacity-90' },
  { label: 'Easy', value: 3, className: 'bg-ember text-ink hover:bg-ember-dark' },
];

export default function ReviewSession() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [queue, setQueue] = useState(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [streakBefore, setStreakBefore] = useState(null);
  const [newBadge, setNewBadge] = useState(null);

  useEffect(() => {
    client.get(`/decks/${deckId}/due/`).then((res) => setQueue(res.data));
    client.get('/dashboard/').then((res) => setStreakBefore(res.data.streak_days));
  }, [deckId]);

  async function handleRate(rating) {
    const card = queue[index];
    await client.post(`/cards/${card.id}/review/`, { rating });
    const nextIndex = index + 1;
    setRevealed(false);
    setIndex(nextIndex);

    if (nextIndex >= queue.length && streakBefore !== null) {
      const dashboard = await client.get('/dashboard/');
      const badge = getNewlyCrossedBadge(streakBefore, dashboard.data.streak_days);
      if (badge) setNewBadge(badge);
    }
  }

  if (queue === null) {
    return <div className="min-h-screen bg-ink flex items-center justify-center text-sand">Loading...</div>;
  }

  if (queue.length === 0 || index >= queue.length) {
    return (
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center gap-4 px-6">
        {newBadge && (
          <div className="text-center mb-2">
            <p className="text-5xl mb-2">{newBadge.emoji}</p>
            <p className="font-display text-2xl text-paper">{newBadge.label} streak!</p>
          </div>
        )}
        <p className="font-display text-2xl text-paper">
          {queue.length === 0 ? 'Nothing due right now.' : 'Session complete.'}
        </p>
        <Link to="/dashboard" className="text-ember">Back to dashboard</Link>
      </div>
    );
  }

  const card = queue[index];

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6">
      <div className="flex items-center gap-3 mb-6">
      <p className="text-sm text-sand">{index + 1} of {queue.length}</p>
      <AmbientSound />
    </div>

      <div
        onClick={() => !revealed && setRevealed(true)}
        className="bg-paper rounded-sm shadow-2xl w-full max-w-lg min-h-[260px] p-10 flex items-center justify-center text-center cursor-pointer"
      >
        <div>
          <p className="font-display text-2xl text-ink">{card.front}</p>
          {revealed && (
            <>
              <div className="w-12 h-px bg-sand mx-auto my-5" />
              <p className="text-lg text-ink/80">{card.back}</p>
            </>
          )}
        </div>
      </div>

      {!revealed && (
        <p className="text-sm text-sand mt-5">Click the card to reveal the answer</p>
      )}

      {revealed && (
        <div className="grid grid-cols-4 gap-2 w-full max-w-lg mt-6">
          {RATINGS.map((r) => (
            <button
              key={r.value}
              onClick={() => handleRate(r.value)}
              className={`py-3 rounded-sm font-medium transition-colors ${r.className}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}