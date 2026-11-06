import { useState, useMemo } from 'react';

// SM-2 gaps when every card is rated "Good": 1, 6, 15, 38 days
const GAPS = [1, 6, 15, 38];
const SECONDS_PER_CARD = 10;
const DAYS = 30;
const OPTIONS = [5, 10, 20];

function simulate(perDay) {
  const reviews = Array(DAYS + 1).fill(0);
  for (let added = 1; added <= DAYS; added++) {
    let day = added;
    for (const gap of GAPS) {
      day += gap;
      if (day <= DAYS) reviews[day] += perDay;
    }
  }
  return reviews.slice(1);
}

export default function ProjectionCalculator() {
  const [perDay, setPerDay] = useState(10);

  const s = useMemo(() => {
    const reviews = simulate(perDay);
    const daily = reviews.map((r) => r + perDay);
    const total = daily.reduce((a, b) => a + b, 0);
    return {
      daily,
      max: Math.max(...daily),
      cards: perDay * DAYS,
      reviews: reviews.reduce((a, b) => a + b, 0),
      avgMin: Math.max(1, Math.round((total * SECONDS_PER_CARD) / 60 / DAYS)),
      lastDay: daily[DAYS - 1],
      lastMin: Math.max(1, Math.round((daily[DAYS - 1] * SECONDS_PER_CARD) / 60)),
    };
  }, [perDay]);

  return (
    <section className="max-w-5xl mx-auto px-6 py-20">
      <p className="eyebrow">Plan your month</p>
      <h2 className="font-display text-3xl md:text-4xl text-paper mt-2 mb-3">
        What could your next 30 days look like?
      </h2>
      <p className="text-sand max-w-xl mb-8">
        Pick how many new cards you add each day. See how many you will have, and how long daily review takes.
      </p>

      <div className="surface p-6 md:p-8">
        <p className="eyebrow mb-3">New cards per day</p>
        <div className="flex gap-3 mb-8">
          {OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setPerDay(n)}
              className={
                'px-5 py-2 rounded-full border font-semibold transition-colors ' +
                (perDay === n
                  ? 'bg-ember text-ink border-ember'
                  : 'border-white/15 text-sand hover:border-ember hover:text-ember')
              }
            >
              {n}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <Tile label="Cards added in 30 days" value={s.cards} />
          <Tile label="Average daily study time" value={`~${s.avgMin} min`} />
          <Tile label="On day 30 you review" value={`${s.lastDay} cards`} hint={`about ${s.lastMin} min`} />
        </div>

        <p className="eyebrow mb-3">Cards to study each day</p>
        <div className="flex items-end gap-1 h-28">
          {s.daily.map((d, i) => (
            <div
              key={i}
              title={`Day ${i + 1}: ${d} cards`}
              className="flex-1 bg-ember/70 rounded-t-sm"
              style={{ height: `${Math.max(4, (d / s.max) * 100)}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-sand/60 mt-2">
          <span>Day 1</span>
          <span>Day 30</span>
        </div>

        <p className="text-xs text-sand/60 mt-6">
          An estimate, not a promise. It assumes you rate every card Good and spend about 10 seconds per card.
          Real schedules change with how well you remember each one.
        </p>
      </div>
    </section>
  );
}

function Tile({ label, value, hint }) {
  return (
    <div className="surface p-5">
      <p className="eyebrow">{label}</p>
      <p className="font-display text-3xl text-paper mt-2">{value}</p>
      {hint && <p className="text-sm text-sand/60 mt-1">{hint}</p>}
    </div>
  );
}