import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import AppLayout from '../components/AppLayout';
import Spinner from '../components/Spinner';

export default function DeckDetail() {
  const { deckId } = useParams();
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [showGenerate, setShowGenerate] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [showCards, setShowCards] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');

  useEffect(() => {
    client.get(`/decks/${deckId}/`).then((res) => setDeck(res.data));
    client.get(`/decks/${deckId}/cards/`).then((res) => setCards(res.data));
  }, [deckId]);

  async function handleAddCard(e) {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    const res = await client.post(`/decks/${deckId}/cards/`, { front, back });
    setCards([res.data, ...cards]);
    setFront('');
    setBack('');
  }

  async function handleGenerate(e) {
    e.preventDefault();
    setGenError('');
    if (!notesText.trim() && !pdfFile) {
      setGenError('Paste some notes or choose a PDF first.');
      return;
    }
    setGenerating(true);
    try {
      let res;
      if (pdfFile) {
        const formData = new FormData();
        formData.append('file', pdfFile);
        res = await client.post(`/decks/${deckId}/generate/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await client.post(`/decks/${deckId}/generate/`, { text: notesText });
      }
      setCards([...res.data, ...cards]);
      setNotesText('');
      setPdfFile(null);
      setShowGenerate(false);
    } catch (err) {
      setGenError(err.response?.data?.detail || 'Generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  function startEdit(card) {
    setEditingId(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
  }

  async function handleSaveEdit(cardId) {
    const res = await client.patch(`/cards/${cardId}/`, { front: editFront, back: editBack });
    setCards(cards.map((c) => (c.id === cardId ? res.data : c)));
    setEditingId(null);
  }

  async function handleDeleteCard(cardId) {
    if (!window.confirm('Delete this card?')) return;
    await client.delete(`/cards/${cardId}/`);
    setCards(cards.filter((c) => c.id !== cardId));
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-8 py-10">
        <Link to="/dashboard" className="text-sm text-sand hover:text-paper">&larr; Dashboard</Link>

        <div className="flex justify-between items-baseline mt-4 mb-1">
          <h1 className="font-display text-3xl text-paper">{deck ? deck.name : '...'}</h1>
          <div className="flex gap-2">
  <Link
    to={`/decks/${deckId}/quiz-mc`}
    className="border border-white/15 text-sand px-4 py-2 rounded-full font-medium hover:border-ember hover:text-ember"
  >
    Multiple choice
  </Link>
  <Link
    to={`/decks/${deckId}/quiz`}
    className="border border-white/15 text-sand px-4 py-2 rounded-full font-medium hover:border-ember hover:text-ember"
  >
    Quiz me
  </Link>
  <Link
    to={`/decks/${deckId}/review`}
    className="bg-ember text-ink px-4 py-2 rounded-full font-semibold hover:bg-ember-dark"
  >
    Study now
  </Link>
</div>
        </div>
        <p className="text-sm text-sand mb-8">{cards.length} card{cards.length === 1 ? '' : 's'}</p>

        <div className="grid grid-cols-2 gap-2 mb-8">
          <button
            onClick={() => { setShowForm(!showForm); setShowGenerate(false); }}
            className="border border-dashed border-white/15 text-sand rounded-2xl py-3 hover:border-ember hover:text-ember transition-colors"
          >
            + Add a card
          </button>
          <button
            onClick={() => { setShowGenerate(!showGenerate); setShowForm(false); }}
            className="border border-dashed border-white/15 text-sand rounded-2xl py-3 hover:border-ember hover:text-ember transition-colors"
          >
            ✦ Generate from notes
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAddCard} className="surface p-5 mb-8 space-y-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Front</label>
              <textarea
                value={front}
                onChange={(e) => setFront(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 text-paper placeholder:text-sand/50 rounded-sm px-3 py-2 focus:outline-none focus:border-ember"
                rows={2}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Back</label>
              <textarea
                value={back}
                onChange={(e) => setBack(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 text-paper placeholder:text-sand/50 rounded-sm px-3 py-2 focus:outline-none focus:border-ember"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-ember text-ink px-4 py-2 rounded-full font-semibold hover:bg-ember-dark">
                Add card
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-sand/70 px-4 py-2 rounded-full font-medium hover:bg-white/5 hover:text-paper">
                Cancel
              </button>
            </div>
          </form>
        )}

        {showGenerate && (
          <form onSubmit={handleGenerate} className="surface p-5 mb-8 space-y-3">
            {genError && <p className="text-rose text-sm">{genError}</p>}

            <div>
              <label className="block text-sm font-medium text-ink mb-1">Paste your notes</label>
              <textarea
                value={notesText}
                onChange={(e) => { setNotesText(e.target.value); setPdfFile(null); }}
                className="w-full bg-white/[0.04] border border-white/10 text-paper placeholder:text-sand/50 rounded-sm px-3 py-2 focus:outline-none focus:border-ember"
                rows={5}
                placeholder="Paste text from your notes, an article, a textbook chapter..."
                disabled={!!pdfFile}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-sand/40" />
              <span className="text-xs text-ink/50">or</span>
              <div className="flex-1 h-px bg-sand/40" />
            </div>

            <div>
            <label className="block text-sm font-medium text-ink mb-1">Upload a PDF or photo</label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => { setPdfFile(e.target.files[0]); setNotesText(''); }}
              className="w-full text-sm text-ink/70 file:mr-3 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-ink file:text-paper file:font-medium file:cursor-pointer hover:file:bg-ink-2"
            />
            <p className="text-xs text-ink/50 mt-1">A photo of handwritten notes, a textbook page, or a whiteboard all work.</p>
           </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={generating}
                className="bg-ember text-ink px-4 py-2 rounded-full font-semibold hover:bg-ember-dark disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {generating && <Spinner />}
                {generating ? 'Generating...' : 'Generate cards'}
              </button>
              <button type="button" onClick={() => setShowGenerate(false)} className="text-sand/70 px-4 py-2 rounded-full font-medium hover:bg-white/5 hover:text-paper">
                Cancel
              </button>
            </div>
          </form>
        )}

                <button
          onClick={() => setShowCards(!showCards)}
          className="text-sm text-sand hover:text-paper mb-4"
        >
          {showCards ? '▾ Hide cards' : '▸ Show cards'} ({cards.length})
        </button>

        {showCards && (
          <div className="grid gap-3">
            {cards.length === 0 && !showForm && !showGenerate && (
              <p className="text-sand/60 text-sm text-center py-8">No cards yet.</p>
            )}
            {cards.map((card) =>
              editingId === card.id ? (
                <div key={card.id} className="bg-paper p-4 space-y-2">
                  <textarea
                    value={editFront}
                    onChange={(e) => setEditFront(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 text-paper placeholder:text-sand/50 rounded-sm px-3 py-2 focus:outline-none focus:border-ember"
                    rows={2}
                  />
                  <textarea
                    value={editBack}
                    onChange={(e) => setEditBack(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 text-paper placeholder:text-sand/50 rounded-sm px-3 py-2 focus:outline-none focus:border-ember"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(card.id)} className="bg-ember text-ink px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-ember-dark">
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-sand/70 px-3 py-1.5 rounded-full text-sm hover:bg-white/5 hover:text-paper">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div key={card.id} className="surface hover:border-ember/40 transition-colors px-4 py-3 group flex justify-between items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-paper font-medium line-clamp-1">{card.front}</p>
                    <p className="text-sm text-sand line-clamp-2 mt-0.5">{card.back}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => startEdit(card)} className="text-sand/70 hover:text-ember text-sm" title="Edit">
                      ✎
                    </button>
                    <button onClick={() => handleDeleteCard(card.id)} className="text-sand/70 hover:text-rose text-sm" title="Delete">
                      ✕
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}