import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const CARDS = [
  { front: 'What is the powerhouse of the cell?', back: 'The mitochondria' },
  { front: 'What does the STAR method stand for?', back: 'Situation, Task, Action, Result' },
  { front: 'Why does spacing out your reviews help?', back: 'Reviewing just before you forget strengthens the memory far more than cramming.' },
  { front: 'What is retrieval practice?', back: 'Trying to recall an answer from memory instead of rereading it.' },
  { front: 'How much material should you turn into flashcards at once?', back: 'Around 10 pages, so the cards stay focused.' },
];

const RATINGS = [
  { label: 'Again', className: 'bg-rose text-paper hover:opacity-90' },
  { label: 'Hard', className: 'bg-ink-2 text-paper border border-sand/30 hover:border-sand' },
  { label: 'Good', className: 'bg-moss text-paper hover:opacity-90' },
  { label: 'Easy', className: 'bg-ember text-ink hover:bg-ember-dark' },
];

export default function Demo() {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [known, setKnown] = useState(0);

  const done = index >= CARDS.length;

  function rate(label) {
    if (label === 'Good' || label === 'Easy') setKnown(known + 1);
    setRevealed(false);
    setIndex(index + 1);
  }

  function restart() {
    setIndex(0);
    setKnown(0);
    setRevealed(false);
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <header className="max-w-5xl w-full mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/"><Logo /></Link>
        <Link
          to="/register"
          className="bg-ember text-ink px-4 py-2 rounded-full font-semibold text-sm hover:bg-ember-dark"
        >
          Start free trial
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        {!done && (
          <>
            <p className="text-sm text-sand mb-6">Demo · card {index + 1} of {CARDS.length}</p>

            <div
              onClick={() => !revealed && setRevealed(true)}
              className="bg-paper rounded-sm shadow-2xl w-full max-w-lg min-h-[260px] p-10 flex items-center justify-center text-center cursor-pointer"
            >
              <div>
                <p className="font-display text-2xl text-ink">{CARDS[index].front}</p>
                {revealed && (
                  <>
                    <div className="w-12 h-px bg-sand mx-auto my-5" />
                    <p className="text-lg text-ink/80">{CARDS[index].back}</p>
                  </>
                )}
              </div>
            </div>

            {!revealed && <p className="text-sm text-sand mt-5">Click the card to reveal the answer</p>}

            {revealed && (
              <>
                <div className="grid grid-cols-4 gap-2 w-full max-w-lg mt-6">
                  {RATINGS.map((r) => (
                    <button
                      key={r.label}
                      onClick={() => rate(r.label)}
                      className={'py-3 rounded-sm font-medium transition-colors ' + r.className}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-sand/60 mt-4">
                  In Kognit, how you rate each card decides when it comes back.
                </p>
              </>
            )}
          </>
        )}

        {done && (
          <div className="text-center max-w-md">
            <p className="font-display text-3xl text-paper mb-2">
              You knew {known} of {CARDS.length}.
            </p>
            <p className="text-sand mb-8">
              That's the loop. In Kognit, cards you struggle with come back sooner, and cards you know
              come back later. Make your own decks, or let Kognit write them from your notes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/register"
                className="bg-ember text-ink px-6 py-2.5 rounded-full font-semibold hover:bg-ember-dark"
              >
                Start your free trial
              </Link>
              <button
                onClick={restart}
                className="border border-sand/30 text-paper px-6 py-2.5 rounded-full font-medium hover:border-ember hover:text-ember transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}