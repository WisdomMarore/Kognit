import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, CheckCircle2, Flame, Clock, ArrowRight, X } from 'lucide-react';
import client from '../api/client';
import AppLayout from '../components/AppLayout';
import StatCard from '../components/StatCard';
import Spinner from '../components/Spinner';
import { getStreakBadge } from '../utils/streak';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [newDeckName, setNewDeckName] = useState('');

  useEffect(() => {
    client.get('/dashboard/')
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load your dashboard. Please log in again.'));
  }, []);

  async function handleCreateDeck(e) {
    e.preventDefault();
    if (!newDeckName.trim()) return;
    const res = await client.post('/decks/', { name: newDeckName });
    setNewDeckName('');
    setData({
      ...data,
      decks: [...data.decks, { deck_id: res.data.id, deck_name: res.data.name, due_count: 0 }],
    });
  }

  async function handleDeleteDeck(e, deckId) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Delete this deck and all its cards? This can't be undone.")) return;
    await client.delete(`/decks/${deckId}/`);
    setData({ ...data, decks: data.decks.filter((d) => d.deck_id !== deckId) });
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-10">
          <p className="text-rose">{error}</p>
        </div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout>
        <div className="flex justify-center py-24"><Spinner /></div>
      </AppLayout>
    );
  }

  const badge = getStreakBadge(data.streak_days);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-8 py-10 space-y-10">

        {data.subscription_status === 'trialing' && (
          <div className="card card-hero flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="icon-tile"><Clock size={18} /></div>
              <div>
                <p className="text-paper font-semibold">
                  {data.trial_days_left} day{data.trial_days_left === 1 ? '' : 's'} left in your free trial
                </p>
                <p className="text-sm text-sand/70 mt-1">
                  Subscribe any time to keep studying without interruption.
                </p>
              </div>
            </div>
            <Link to="/billing" className="pill text-paper">
              Subscribe <ArrowRight size={14} />
            </Link>
          </div>
        )}

        <div>
          <p className="eyebrow">Today</p>
          <h1 className="font-display text-4xl text-paper mt-2">Dashboard</h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Layers} label="Due today" value={data.total_due} />
          <StatCard icon={CheckCircle2} label="Reviewed today" value={data.reviewed_today} />
          <StatCard
            icon={Flame}
            label="Streak"
            title={badge ? badge.label : undefined}
            value={
              <>
                {data.streak_days}d{' '}
                {badge && <span className="text-2xl align-middle">{badge.emoji}</span>}
              </>
            }
          />
        </div>

        <div>
          <p className="eyebrow mb-4">Your decks</p>

          <form onSubmit={handleCreateDeck} className="flex gap-3 mb-5">
            <input
              type="text"
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              placeholder="New deck name"
              className="flex-1 bg-white/[0.03] border border-white/10 text-paper placeholder:text-sand/50 rounded-xl px-4 py-2.5 focus:outline-none focus:border-ember transition-colors"
            />
            <button
              type="submit"
              className="bg-ember text-ink px-5 py-2.5 rounded-full font-semibold hover:bg-ember-dark transition-colors"
            >
              Create
            </button>
          </form>

          {data.decks.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-paper/80">No decks yet</p>
              <p className="text-sm text-sand/60 mt-1">Create one above to get started.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {data.decks.map((deck) => (
                <Link
                  key={deck.deck_id}
                  to={`/decks/${deck.deck_id}`}
                  className="card card-interactive group flex items-center justify-between !py-4"
                >
                  <span className="text-paper font-medium">{deck.deck_name}</span>
                  <div className="flex items-center gap-4">
                    <span className={`eyebrow ${deck.due_count > 0 ? '!text-ember' : ''}`}>
                      {deck.due_count} due
                    </span>
                    <button
                      onClick={(e) => handleDeleteDeck(e, deck.deck_id)}
                      className="text-sand/0 group-hover:text-sand/60 hover:!text-rose transition-colors"
                      title="Delete deck"
                      aria-label="Delete deck"
                    >
                      <X size={16} />
                    </button>
                    <ArrowRight size={16} className="text-sand/40 group-hover:text-ember transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}