import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizSession() {
  const { deckId } = useParams();
  const [queue, setQueue] = useState(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [missed, setMissed] = useState([]);

  useEffect(() => {
    client.get(`/decks/${deckId}/cards/`).then((res) => setQueue(shuffle(res.data)));
  }, [deckId]);

  function handleAnswer(gotIt) {
    if (gotIt) {
      setCorrect(correct + 1);
    } else {
      setMissed([...missed, queue[index]]);
    }
    setRevealed(false);
    setIndex(index + 1);
  }

  function handleRetry() {
    setQueue(shuffle(queue));
    setIndex(0);
    setRevealed(false);
    setCorrect(0);
    setMissed([]);
  }

  if (queue === null) {
    return <div className="min-h-screen bg-ink flex items-center justify-center text-sand">Loading...</div>;
  }

  if (queue.length === 0) {
    return (
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center gap-4">
        <p className="font-display text-2xl text-paper">No cards to quiz yet.</p>
        <Link to={`/decks/${deckId}`} className="text-ember">Back to deck</Link>
      </div>
    );
  }

  if (index >= queue.length) {
    const pct = Math.round((correct / queue.length) * 100);
    return (
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6">
        <p className="font-display text-3xl text-paper mb-2">{correct} / {queue.length}</p>
        <p className="text-sand mb-8">{pct}% correct</p>

        {missed.length > 0 && (
          <div className="bg-paper rounded-sm p-5 w-full max-w-md mb-8">
            <p className="text-sm font-medium text-ink mb-2">Missed:</p>
            <ul className="space-y-1">
              {missed.map((c) => (
                <li key={c.id} className="text-sm text-ink/70 line-clamp-1">{c.front}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={handleRetry} className="bg-ember text-ink px-5 py-2.5 rounded-full font-semibold hover:bg-ember-dark">
            Retry quiz
          </button>
          <Link to={`/decks/${deckId}`} className="text-sand px-5 py-2.5 rounded-sm font-medium hover:text-paper">
            Back to deck
          </Link>
        </div>
      </div>
    );
  }

  const card = queue[index];

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6">
      <p className="text-sm text-sand mb-6">{index + 1} of {queue.length}</p>

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
        <div className="grid grid-cols-2 gap-3 w-full max-w-lg mt-6">
          <button onClick={() => handleAnswer(false)} className="bg-rose text-paper py-3 rounded-sm font-medium hover:opacity-90">
            Missed it
          </button>
          <button onClick={() => handleAnswer(true)} className="bg-moss text-paper py-3 rounded-sm font-medium hover:opacity-90">
            Got it
          </button>
        </div>
      )}
    </div>
  );
}