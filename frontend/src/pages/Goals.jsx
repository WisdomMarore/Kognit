import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import AppLayout from '../components/AppLayout';
import Spinner from '../components/Spinner';

const CARD_SHADOW = '';

const GROUPS = [
  { key: 'overdue', label: 'Overdue', tone: 'text-rose', dot: 'bg-rose' },
  { key: 'week', label: 'This week', tone: 'text-ember', dot: 'bg-ember' },
  { key: 'month', label: 'Next 30 days', tone: 'text-sand', dot: 'bg-sand' },
  { key: 'later', label: 'Later', tone: 'text-sand', dot: 'bg-sand/60' },
];

function todayStr() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function daysUntil(dateStr) {
  const target = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function groupOf(goal) {
  const d = daysUntil(goal.target_date);
  if (d < 0) return 'overdue';
  if (d <= 7) return 'week';
  if (d <= 30) return 'month';
  return 'later';
}

function byDate(a, b) {
  return a.target_date.localeCompare(b.target_date);
}

export default function Goals() {
  const [goals, setGoals] = useState(null);
  const [decks, setDecks] = useState([]);
  const [tab, setTab] = useState('active');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [deckId, setDeckId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    client.get('/goals/')
      .then((res) => setGoals(res.data))
      .catch(() => {
        setError('Could not load your goals.');
        setGoals([]);
      });
    client.get('/decks/').then((res) => setDecks(res.data)).catch(() => {});
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    if (!title.trim() || !targetDate) {
      setError('Give your goal a name and a target date.');
      return;
    }
    setSaving(true);
    try {
      const res = await client.post('/goals/', {
        title,
        description,
        target_date: targetDate,
        deck: deckId || null,
      });
      setGoals([...goals, res.data]);
      setTitle('');
      setDescription('');
      setTargetDate('');
      setDeckId('');
      setShowForm(false);
      setTab('active');
    } catch (err) {
      setError('Could not save the goal. Please check the details and try again.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleDone(goal) {
    const res = await client.patch('/goals/' + goal.id + '/', { completed: !goal.completed });
    setGoals(goals.map((g) => (g.id === goal.id ? res.data : g)));
    setOpenId(null);
  }

  async function handleDelete(goal) {
    if (!window.confirm('Delete this goal?')) return;
    await client.delete('/goals/' + goal.id + '/');
    setGoals(goals.filter((g) => g.id !== goal.id));
    setOpenId(null);
  }

  if (goals === null) {
    return (
      <AppLayout>
        <div className="p-10 text-sand">Loading...</div>
      </AppLayout>
    );
  }

  const q = query.trim().toLowerCase();
  const matches = (g) => !q || g.title.toLowerCase().includes(q) || (g.deck_name || '').toLowerCase().includes(q);

  const active = goals.filter((g) => !g.completed).sort(byDate);
  const done = goals.filter((g) => g.completed).sort(byDate).reverse();
  const overdueCount = active.filter((g) => groupOf(g) === 'overdue').length;
  const weekCount = active.filter((g) => groupOf(g) === 'week').length;

  const visibleActive = active.filter(matches);
  const visibleDone = done.filter(matches);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-8 py-10">
        <div className="flex justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl text-paper mb-1">Learning goals</h1>
            <p className="text-sand">Set a target, link a deck, and see what it takes to get there.</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-ember text-ink px-4 py-2 rounded-full font-semibold text-sm hover:bg-ember-dark whitespace-nowrap"
            >
              + New goal
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleAdd} className="surface p-5 mb-8 space-y-3">
            {error && <p className="text-rose text-sm">{error}</p>}

            <div>
              <label className="block text-sm font-medium text-ink mb-1">Goal</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Finish IGCSE ICT revision"
                className="w-full bg-white/[0.04] border border-white/10 text-paper placeholder:text-sand/50 rounded-sm px-3 py-2 focus:outline-none focus:border-ember"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Target date</label>
                <input
                  type="date"
                  value={targetDate}
                  min={todayStr()}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 text-paper placeholder:text-sand/50 rounded-sm px-3 py-2 focus:outline-none focus:border-ember"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Deck (optional)</label>
                <select
                  value={deckId}
                  onChange={(e) => setDeckId(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 text-paper placeholder:text-sand/50 rounded-sm px-3 py-2 focus:outline-none focus:border-ember"
                >
                  <option value="">No deck</option>
                  {decks.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">Notes (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-white/[0.04] border border-white/10 text-paper placeholder:text-sand/50 rounded-sm px-3 py-2 focus:outline-none focus:border-ember"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-ember text-ink px-4 py-2 rounded-full font-semibold hover:bg-ember-dark disabled:opacity-60 flex items-center gap-2"
              >
                {saving && <Spinner />}
                {saving ? 'Saving...' : 'Save goal'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sand/70 px-4 py-2 rounded-full font-medium hover:bg-white/5 hover:text-paper"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {!showForm && error && <p className="text-rose text-sm mb-4">{error}</p>}

        {goals.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <Tile label="Active" value={active.length} />
            <Tile label="Overdue" value={overdueCount} tone={overdueCount > 0 ? 'text-rose' : 'text-ember'} />
            <Tile label="Due in 7 days" value={weekCount} />
            <Tile label="Completed" value={done.length} tone="text-moss" />
          </div>
        )}

        {goals.length > 0 && (
          <div className="flex items-end gap-6 border-b border-sand/10 mb-6">
            {[
              ['active', 'Active', active.length],
              ['done', 'Completed', done.length],
            ].map(([key, label, n]) => (
              <button
                key={key}
                onClick={() => { setTab(key); setOpenId(null); }}
                className={
                  'pb-2 text-sm -mb-px border-b-2 transition-colors ' +
                  (tab === key ? 'border-ember text-paper' : 'border-transparent text-sand hover:text-paper')
                }
              >
                {label} <span className="text-sand/50">({n})</span>
              </button>
            ))}

            {goals.length > 5 && (
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search goals"
                className="ml-auto mb-2 w-40 bg-ink-2 border border-sand/20 text-paper placeholder:text-sand/50 text-sm rounded-sm px-3 py-1.5 focus:outline-none focus:border-ember"
              />
            )}
          </div>
        )}

        {goals.length === 0 && (
          <p className="text-sand/60 text-sm text-center py-12">
            No goals yet. Add one to start your timeline.
          </p>
        )}

        {tab === 'active' && goals.length > 0 && (
          <>
            {visibleActive.length === 0 && (
              <p className="text-sand/60 text-sm text-center py-8">
                {q ? 'No goals match your search.' : 'No active goals. Nice work, or add a new one.'}
              </p>
            )}

            {GROUPS.map((group) => {
              const items = visibleActive.filter((g) => groupOf(g) === group.key);
              if (items.length === 0) return null;
              return (
                <section key={group.key} className="mb-8">
                  <h2 className={'text-xs uppercase tracking-widest mb-3 ' + group.tone}>
                    {group.label} <span className="text-sand/50">({items.length})</span>
                  </h2>
                  <ol className="border-l border-sand/20 ml-2">
                    {items.map((goal) => (
                      <GoalRow
                        key={goal.id}
                        goal={goal}
                        dot={group.dot}
                        open={openId === goal.id}
                        onToggleOpen={() => setOpenId(openId === goal.id ? null : goal.id)}
                        onToggleDone={toggleDone}
                        onDelete={handleDelete}
                      />
                    ))}
                  </ol>
                </section>
              );
            })}
          </>
        )}

        {tab === 'done' && goals.length > 0 && (
          <>
            {visibleDone.length === 0 && (
              <p className="text-sand/60 text-sm text-center py-8">
                {q ? 'No goals match your search.' : 'Nothing completed yet.'}
              </p>
            )}
            {visibleDone.length > 0 && (
              <ol className="border-l border-sand/20 ml-2">
                {visibleDone.map((goal) => (
                  <GoalRow
                    key={goal.id}
                    goal={goal}
                    dot="bg-moss"
                    open={openId === goal.id}
                    onToggleOpen={() => setOpenId(openId === goal.id ? null : goal.id)}
                    onToggleDone={toggleDone}
                    onDelete={handleDelete}
                  />
                ))}
              </ol>
            )}
          </>
        )}

        <p className="text-xs text-sand/50 mt-6">
          A card counts as reviewed after one correct recall, and learned after two in a row.
        </p>
      </div>
    </AppLayout>
  );
}

function Tile({ label, value, tone }) {
  return (
    <div className={'surface px-4 py-3 ' + CARD_SHADOW}>
      <p className="text-xs text-sand">{label}</p>
      <p className={'font-display text-2xl ' + (tone || 'text-ember')}>{value}</p>
    </div>
  );
}

function GoalRow({ goal, dot, open, onToggleOpen, onToggleDone, onDelete }) {
  const days = daysUntil(goal.target_date);
  const hasCards = goal.deck && goal.total_cards > 0;
  const remaining = goal.total_cards - goal.learned_cards;
  const pct = hasCards ? Math.round((goal.learned_cards / goal.total_cards) * 100) : 0;
  const startedPct = hasCards ? Math.round((goal.started_cards / goal.total_cards) * 100) : 0;

  let dueLabel;
  let dueClass;
  if (goal.completed) {
    dueLabel = 'Completed';
    dueClass = 'text-moss';
  } else if (days < 0) {
    dueLabel = Math.abs(days) + (Math.abs(days) === 1 ? ' day overdue' : ' days overdue');
    dueClass = 'text-rose';
  } else if (days === 0) {
    dueLabel = 'Due today';
    dueClass = 'text-ember';
  } else {
    dueLabel = days + (days === 1 ? ' day left' : ' days left');
    dueClass = days <= 7 ? 'text-ember' : 'text-sand';
  }

  const pace = !goal.completed && hasCards && remaining > 0 && days > 0
    ? Math.ceil(remaining / days)
    : null;

  return (
    <li className="relative pl-8 pb-3 last:pb-0">
      <span className={'absolute -left-[7.5px] top-4 w-3.5 h-3.5 rounded-full border-2 border-ink ' + dot} />

      <div
        className={
          'surface overflow-hidden ' + CARD_SHADOW + (goal.completed ? ' opacity-60' : '')
        }
      >
        <button
          onClick={onToggleOpen}
          aria-expanded={open}
          className="w-full text-left px-4 py-3 flex items-center justify-between gap-4 hover:bg-ink-2/60 transition-colors"
        >
          <div className="min-w-0 flex-1">
            <p className={'text-paper font-medium truncate ' + (goal.completed ? 'line-through' : '')}>
              {goal.title}
            </p>
            <p className="text-xs text-sand/60 mt-0.5 truncate">
              {formatDate(goal.target_date)}
              {goal.deck_name ? ' · ' + goal.deck_name : ''}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {hasCards && !goal.completed && <span className="text-xs text-sand">{pct}%</span>}
            <span className={'text-xs whitespace-nowrap ' + dueClass}>{dueLabel}</span>
            <span className="text-sand/50 text-xs">{open ? '▾' : '▸'}</span>
          </div>
        </button>

        {hasCards && (
          <div className="h-1 bg-ink relative">
            <div className="absolute inset-y-0 left-0 bg-ember/40" style={{ width: startedPct + '%' }} />
            <div className="absolute inset-y-0 left-0 bg-ember" style={{ width: pct + '%' }} />
          </div>
        )}

        {open && (
          <div className="px-4 pb-4 pt-3 border-t border-sand/10">
            {goal.description && <p className="text-sm text-sand mb-3">{goal.description}</p>}

            {goal.deck && (
              <div className="text-xs text-sand mb-3">
                <p>
                  {goal.total_cards > 0
                    ? goal.started_cards + ' reviewed · ' + goal.learned_cards + ' learned · ' + goal.total_cards + ' total'
                    : 'No cards in this deck yet'}
                </p>
                {pace && (
                  <p className="text-sand/70 mt-1">
                    About {pace} card{pace === 1 ? '' : 's'} a day to finish in time.
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-4 text-xs">
              {goal.deck && !goal.completed && (
                <Link to={'/decks/' + goal.deck + '/review'} className="text-ember hover:underline">
                  Study now
                </Link>
              )}
              <button onClick={() => onToggleDone(goal)} className="text-sand hover:text-paper">
                {goal.completed ? 'Reopen' : 'Mark done'}
              </button>
              <button onClick={() => onDelete(goal)} className="text-sand/60 hover:text-rose">
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}