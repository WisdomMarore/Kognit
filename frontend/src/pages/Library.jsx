import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import AppLayout from '../components/AppLayout';
import Spinner from '../components/Spinner';

const CARD_SHADOW = '';

export default function Library() {
  const [data, setData] = useState(null);
  const [category, setCategory] = useState('All');
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    client.get('/library/')
      .then((res) => setData(res.data))
      .catch(() => {
        setMessage('Could not load the library.');
        setData({ can_add: false, decks: [] });
      });
  }, []);

  async function handleAdd(deck) {
    setMessage('');
    setBusyId(deck.id);
    try {
      const res = await client.post('/library/' + deck.id + '/add/');
      setData({
        ...data,
        decks: data.decks.map((d) =>
          d.id === deck.id ? { ...d, added: true, my_deck: res.data.deck } : d
        ),
      });
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Could not add this deck. Please try again.');
    } finally {
      setBusyId(null);
    }
  }

  if (data === null) {
    return (
      <AppLayout>
        <div className="p-10 text-sand">Loading...</div>
      </AppLayout>
    );
  }

  const categories = ['All', ...Array.from(new Set(data.decks.map((d) => d.category)))];
  const shown = category === 'All' ? data.decks : data.decks.filter((d) => d.category === category);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-8 py-10">
        <h1 className="font-display text-3xl text-paper mb-1">Premade decks</h1>
        <p className="text-sand mb-6">Ready-made flashcards you can add to your own decks and study straight away.</p>

        {!data.can_add && (
          <div className="surface surface-hero text-ember text-sm px-4 py-3 mb-6 flex justify-between items-center gap-4">
            <span>Premade decks are included with a paid subscription.</span>
            <Link to="/billing" className="underline font-medium whitespace-nowrap">Subscribe</Link>
          </div>
        )}

        {message && <p className="text-rose text-sm mb-4">{message}</p>}

        {categories.length > 2 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={
                  'px-3 py-1 rounded-full text-xs border transition-colors ' +
                  (category === c
                    ? 'border-ember text-ember bg-ember/10'
                    : 'border-sand/20 text-sand hover:text-paper')
                }
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {shown.length === 0 && (
          <p className="text-sand/60 text-sm text-center py-12">No premade decks yet. Check back soon.</p>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {shown.map((deck) => (
            <div key={deck.id} className={'surface p-6 flex flex-col ' + CARD_SHADOW}>
              <p className="text-xs uppercase tracking-widest text-ember mb-2">{deck.category}</p>
              <h2 className="text-paper font-medium mb-2">{deck.title}</h2>
              <p className="text-sm text-sand flex-1 mb-4">{deck.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-sand/60">
                  {deck.card_count} card{deck.card_count === 1 ? '' : 's'}
                </span>

                {deck.added && (
                  <Link to={'/decks/' + deck.my_deck} className="text-sm text-moss hover:underline">
                    Added. Open deck
                  </Link>
                )}

                {!deck.added && data.can_add && (
                  <button
                    onClick={() => handleAdd(deck)}
                    disabled={busyId === deck.id}
                    className="bg-ember text-ink px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-ember-dark disabled:opacity-60 flex items-center gap-2"
                  >
                    {busyId === deck.id && <Spinner />}
                    {busyId === deck.id ? 'Adding...' : 'Add to my decks'}
                  </button>
                )}

                {!deck.added && !data.can_add && (
                  <Link to="/billing" className="text-sm text-sand hover:text-ember">
                    🔒 Subscribe to unlock
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}