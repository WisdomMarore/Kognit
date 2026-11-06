const DECKS = [
  { name: 'Biology: cell structure', due: 12 },
  { name: 'Chemistry: periodic table', due: 8 },
  { name: 'Spanish verbs', due: 4 },
];

function Mini({ label, value }) {
  return (
    <div className="surface p-4 text-left">
      <p className="eyebrow">{label}</p>
      <p className="font-display text-2xl text-paper mt-1">{value}</p>
    </div>
  );
}

export default function HeroPreview() {
  return (
    <div className="relative max-w-3xl mx-auto px-6 pb-20">
      <div className="absolute inset-x-10 top-10 h-40 bg-ember/10 blur-3xl rounded-full" />
      <div className="relative surface p-5 md:p-6 shadow-2xl">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <span className="eyebrow ml-3">Today</span>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Mini label="Due today" value="24" />
          <Mini label="Reviewed" value="18" />
          <Mini label="Streak" value="7d" />
        </div>
        <div className="grid gap-2">
          {DECKS.map((d) => (
            <div key={d.name} className="surface px-4 py-3 flex items-center justify-between text-left">
              <span className="text-paper text-sm font-medium">{d.name}</span>
              <span className="eyebrow !text-ember">{d.due} due</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-sand/50 text-center mt-4">Sample deck shown for illustration.</p>
      </div>
    </div>
  );
}