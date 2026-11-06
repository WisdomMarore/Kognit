import AppLayout from '../components/AppLayout';

const TIPS = [

    {
    title: 'Study the material first, then build flashcards',
    body: "Flashcards work best as reinforcement, not first exposure. Read or go through the material once to actually understand it, then create or generate cards from it. Cards made from something you already understand are better questions — and reviewing them later does real work, instead of you re-meeting the idea for the first time mid-review.",
  },
  {
    title: 'Generate from focused chunks, not whole textbooks',
    body: "Around 10 pages of notes at a time produces noticeably better flashcards than dumping in a huge document — the AI can stay focused on fewer, more specific ideas instead of spreading thin across hundreds of pages. Break big material into topic-sized chunks and generate a batch at a time; you'll get sharper, more useful cards per chunk.",
  },
  {
    title: 'Trust the schedule, even when it feels too easy',
    body: "When a card shows up and you remember it instantly, that's the system working, not wasted time. Spaced repetition deliberately shows you things right before you'd forget — reviewing too early feels reassuring but teaches you less per minute than reviewing at the edge of forgetting.",
  },
  {
    title: 'Be honest with your ratings',
    body: 'Rating "Good" when you actually struggled just pushes the card further out before you\'re ready, and you\'ll relearn it from scratch later. Rate what actually happened — a genuine "Hard" now saves you a bigger failure down the line.',
  },
  {
    title: 'One fact per card',
    body: 'A card that asks "explain the causes and effects of X" is really several questions bundled into one. If you can\'t answer instantly and completely, split it. Small, specific cards are easier to grade honestly and easier for the algorithm to schedule well.',
  },
  {
    title: 'Review daily, even briefly',
    body: 'A few minutes every day beats a long session once a week. Spaced repetition is built around small, frequent touches — skipping days lets more cards pile up due at once, which makes review feel like a chore instead of a habit.',
  },
  {
    title: 'Write answers in your own words',
    body: "Cards copied verbatim from a textbook test recognition, not recall. Rephrasing an idea into your own words when you create a card forces you to actually understand it first — you'll remember your own phrasing far better than someone else's.",
  },
  {
    title: 'Let AI-generated cards be a starting point',
    body: "Cards generated from your notes or a PDF are a fast first draft, not a final answer. Skim them after generating — merge ones that overlap, split ones that bundle too much together, and edit any that don't match how you'd actually explain the idea.",
  },
];

export default function StudyTips() {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-8 py-10">
        <h1 className="font-display text-3xl text-paper mb-2">Study tips</h1>
        <p className="text-sand mb-10">
          A few ideas to get more out of spaced repetition.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {TIPS.map((tip, i) => (
            <div
              key={tip.title}
              className="surface p-6 "
            >
              <div className="w-7 h-7 rounded-full bg-ember/15 border border-ember/40 text-ember text-sm font-display flex items-center justify-center mb-4">
                {i + 1}
              </div>
              <h2 className="text-paper font-medium mb-2">{tip.title}</h2>
              <p className="text-sm text-sand leading-relaxed">{tip.body}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}