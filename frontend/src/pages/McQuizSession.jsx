import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';

export default function McQuizSession() {
  const { deckId } = useParams();
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [correct, setCorrect] = useState(0);

  useEffect(() => {
    client.get(`/decks/${deckId}/quiz-mc/`)
      .then((res) => setQuestions(res.data.questions))
      .catch((err) => setError(err.response?.data?.detail || 'Could not load the quiz.'));
  }, [deckId]);

  function handleSelect(option) {
    if (selected !== null) return; // already answered this question
    setSelected(option);
    if (option === questions[index].correct_answer) {
      setCorrect(correct + 1);
    }
  }

  function handleNext() {
    setSelected(null);
    setIndex(index + 1);
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sand">{error}</p>
        <Link to={`/decks/${deckId}`} className="text-ember">Back to deck</Link>
      </div>
    );
  }

  if (questions === null) {
    return <div className="min-h-screen bg-ink flex items-center justify-center text-sand">Generating quiz...</div>;
  }

  if (index >= questions.length) {
    const pct = Math.round((correct / questions.length) * 100);
    return (
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6">
        <p className="font-display text-3xl text-paper mb-2">{correct} / {questions.length}</p>
        <p className="text-sand mb-8">{pct}% correct</p>
        <Link to={`/decks/${deckId}`} className="bg-ember text-ink px-5 py-2.5 rounded-full font-semibold hover:bg-ember-dark">
          Back to deck
        </Link>
      </div>
    );
  }

  const q = questions[index];

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6">
      <p className="text-sm text-sand mb-6">{index + 1} of {questions.length}</p>

      <div className="bg-paper rounded-sm shadow-2xl w-full max-w-lg p-8">
        <p className="font-display text-xl text-ink mb-6">{q.question}</p>

        <div className="space-y-2">
          {q.options.map((option) => {
            const isCorrect = option === q.correct_answer;
            const isSelected = option === selected;
            let style = 'border-sand/40 hover:border-ink/40';
            if (selected !== null) {
              if (isCorrect) style = 'border-moss bg-moss/10 text-moss';
              else if (isSelected) style = 'border-rose bg-rose/10 text-rose';
              else style = 'border-sand/20 opacity-50';
            }
            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`w-full text-left border rounded-sm px-4 py-2.5 text-ink transition-colors ${style}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <button
            onClick={handleNext}
            className="w-full mt-6 bg-ink text-paper py-2.5 rounded-sm font-medium hover:bg-ink-2"
          >
            {index + 1 >= questions.length ? 'See results' : 'Next question'}
          </button>
        )}
      </div>
    </div>
  );
}