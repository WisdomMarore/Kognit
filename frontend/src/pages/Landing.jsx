import WhatsAppButton from '../components/WhatsAppButton';
import HeroPreview from '../components/HeroPreview';
import AnnouncementBar from '../components/AnnouncementBar';
import ProjectionCalculator from '../components/ProjectionCalculator';
import AfterYouJoin from '../components/AfterYouJoin';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

// Keep TRIAL_DAYS in sync with TRIAL_DAYS in backend/.env
const TRIAL_DAYS = 7;
const PRICE = '$4.99';

const CARD = 'shadow-[0_1px_0_0_rgba(201,191,168,0.08)_inset,0_4px_12px_rgba(0,0,0,0.3)]';
const GLOW_BUTTON = 'shadow-[0_8px_24px_rgba(214,138,61,0.25)]';

const AUDIENCES = [
  'Exam revision',
  'University courses',
  'Professional certifications',
  'Interview prep',
  'Languages',
];

const FEATURES = [
  {
    icon: '↻',
    title: 'Review exactly what you need',
    body: "Cards you know well show up less. Cards you're still shaky on come back sooner, so every minute you spend studying goes where it matters.",
  },
  {
    icon: '✦',
    title: 'AI flashcards from anything',
    body: 'Paste notes, upload a PDF, or snap a photo of a textbook page or whiteboard. Kognit writes the flashcards for you.',
  },
  {
    icon: '◎',
    title: 'Two ways to quiz yourself',
    body: 'Recall quizzes make you produce the answer from memory. Multiple-choice quizzes are a quicker check. Neither touches your review schedule.',
  },
  {
    icon: '⚑',
    title: 'Learning goals with a timeline',
    body: 'Set a target date, link a deck, and see how many cards you have reviewed and learned, plus the daily pace you need to finish in time.',
  },
  {
    icon: '▤',
    title: 'Premade decks',
    body: 'Add ready-made decks to your own library in one click, starting with interview preparation. Included with a subscription.',
  },
  {
    icon: '✓',
    title: 'Built for consistency',
    body: 'Streak badges, a calm rain sound while you review, and a study tips page to help you get more from every session.',
  },
];

const SCIENCE = [
  {
    title: 'Retrieval beats rereading',
    body: 'Actively recalling an answer, rather than just rereading notes, is what strengthens memory. This is why Kognit makes you try to answer before revealing the back of a card.',
  },
  {
    title: 'Struggle is a feature, not a bug',
    body: "Learning feels slower when it's effortful, but the research shows effortful recall produces far more durable memory than easy, passive review.",
  },
  {
    title: 'Spacing beats cramming',
    body: "Reviewing material spaced out over days and weeks leads to much stronger long-term retention than one massed session. It's the premise behind Kognit's scheduling.",
  },
  {
    title: 'Forgetting a little is part of learning',
    body: "Reviewing right before you're about to forget something, not right after you learned it, is what makes the memory stick.",
  },
];

const COMPARE = [
  { label: 'Schedules your reviews for you', recall: 'yes', notes: 'no', paper: 'partly' },
  { label: 'Makes you recall the answer', recall: 'yes', notes: 'no', paper: 'yes' },
  { label: 'Writes cards from notes, PDFs and photos', recall: 'yes', notes: 'no', paper: 'no' },
  { label: 'Quizzes you on a whole deck', recall: 'yes', notes: 'no', paper: 'partly' },
  { label: 'Tracks progress toward a goal date', recall: 'yes', notes: 'no', paper: 'no' },
];

const FAQS = [
  {
    q: 'How does the free trial work?',
    a: `You get ${TRIAL_DAYS} days of full access to the study tools, with no card required. Adding premade decks needs a subscription.`,
  },
  {
    q: 'What happens when my trial ends?',
    a: `You'll need a subscription (${PRICE} a month) to keep studying. Your decks and progress are kept.`,
  },
  {
    q: 'How do I pay?',
    a: 'From inside the app, with EcoCash or other local methods through Paynow. It is month to month, and nothing is charged automatically, so there is nothing to cancel.',
  },
  {
    q: 'What can I turn into flashcards?',
    a: 'Pasted text, PDFs, and photos of notes, textbook pages or whiteboards. For the best cards, use around 10 pages at a time.',
  },
  {
    q: 'Are the AI-written cards always correct?',
    a: "No. AI can make mistakes. Skim the cards after generating them and edit or delete anything that's off.",
  },
  {
    q: 'Who can see my notes?',
    a: "Your decks are stored in your account. When you generate cards, the text, PDF or photo you provide is sent to a third-party AI service to write them, so please don't upload anything confidential.",
  },
  {
    q: 'Can I try it without an account?',
    a: 'Yes. The demo lets you flip through a sample deck with no signup. Creating your own decks needs a free account.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-ink">
      <AnnouncementBar />
      <WhatsAppButton />
      <nav className="sticky top-0 z-10 bg-ink/90 backdrop-blur border-b border-ink-2">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Logo />
          <div className="hidden md:flex items-center gap-8 text-sm text-sand">
            <a href="#features" className="hover:text-paper">Features</a>
            <a href="#how-it-works" className="hover:text-paper">How it works</a>
            <a href="#pricing" className="hover:text-paper">Pricing</a>
            <a href="#faq" className="hover:text-paper">FAQ</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-sand hover:text-paper">Log in</Link>
            <Link
              to="/register"
              className="bg-ember text-ink px-4 py-2 rounded-full font-semibold text-sm hover:bg-ember-dark"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute -top-20 left-1/4 w-72 h-72 bg-ember/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-56 h-56 bg-ember/5 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto px-6 pt-16 pb-10 text-center animate-fade-in-up">
          <p className="eyebrow mb-5">Spaced repetition flashcards</p>
          <h1 className="font-display text-5xl md:text-6xl text-paper leading-tight mb-6">
            You learned it last week.<br />Where did it go?
          </h1>
          <p className="text-lg text-sand max-w-xl mx-auto mb-10">
            Kognit uses spaced repetition to show you the right card at the right moment,
            right before you'd forget it. Paste your notes, a PDF or a photo and it writes the flashcards for you.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className={'bg-ember text-ink px-8 py-3 rounded-full font-semibold hover:bg-ember-dark transition-transform hover:-translate-y-0.5 ' + GLOW_BUTTON}
            >
              Start your free trial
            </Link>
            <Link
              to="/demo"
              className="border border-white/15 text-paper px-8 py-3 rounded-full font-medium hover:border-ember hover:text-ember transition-colors"
            >
              Try the demo
            </Link>
          </div>
          <p className="text-sm text-sand/60 mt-4">
            {TRIAL_DAYS} days free. No card required. The demo needs no account.
          </p>
        </div>
        <HeroPreview />
      </section>

      {/* Product visual */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="relative max-w-lg mx-auto">
          <div className="absolute inset-0 bg-ink-2 rounded-sm shadow-xl rotate-3 translate-x-2 translate-y-2" />
          <div className="absolute inset-0 bg-paper/60 rounded-sm shadow-xl -rotate-2 -translate-x-1 translate-y-1" />

          <div className="relative bg-paper rounded-sm shadow-2xl p-12 text-center">
            <p className="text-xs uppercase tracking-widest text-ink/40 mb-4">Front</p>
            <p className="font-display text-2xl text-ink mb-8">What is the powerhouse of the cell?</p>
            <div className="w-12 h-px bg-sand mx-auto mb-8" />
            <p className="text-xs uppercase tracking-widest text-ink/40 mb-2">Back</p>
            <p className="text-lg text-ink/80">The mitochondria</p>
          </div>
        </div>
      </section>

      {/* Made for */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <p className="text-center text-sm text-sand/70 mb-5">Made for learners preparing for</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {AUDIENCES.map((a) => (
            <div
              key={a}
              className="bg-ink-2/60 border border-sand/10 rounded-sm px-4 py-4 text-sm text-sand text-center"
            >
              {a}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-ink-2">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <SectionHeading
            title="Everything you need to study properly"
            sub="Kognit is built around how memory actually works."
          />
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-10">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4">
                <div className="w-9 h-9 shrink-0 rounded-full bg-ember/15 border border-ember/40 text-ember flex items-center justify-center text-sm">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-paper font-medium mb-1">{f.title}</h3>
                  <p className="text-sm text-sand">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-ink-2">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <SectionHeading title="How it works" />
          <div className="grid sm:grid-cols-2 gap-5">
            <StepTile number="1" title="Add your material" body="Paste notes, upload a PDF or photo, type cards yourself, or add a premade deck.">
              <VisualAdd />
            </StepTile>
            <StepTile number="2" title="Get your flashcards" body="Kognit writes focused cards from your material. Skim them and edit anything you like.">
              <VisualGenerate />
            </StepTile>
            <StepTile number="3" title="Review daily" body="A few minutes a day. Kognit tells you exactly what's due, and you rate how well you remembered.">
              <VisualReview />
            </StepTile>
            <StepTile number="4" title="Track your goals" body="Set a target date and watch your progress toward it, with the daily pace you need.">
              <VisualGoal />
            </StepTile>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <ProjectionCalculator />
      <section className="border-t border-ink-2">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <SectionHeading
            title="How it compares"
            sub="See how Kognit compares to common ways of studying."
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px] border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="text-left font-normal py-3 pr-4" />
                  <th className="py-3 px-4 text-paper font-medium bg-ember/10 border-x border-t border-ember/40 rounded-t-sm">
                    Kognit
                  </th>
                  <th className="py-3 px-4 text-sand font-normal">Rereading notes</th>
                  <th className="py-3 px-4 text-sand font-normal">Paper flashcards</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => {
                  const last = i === COMPARE.length - 1;
                  return (
                    <tr key={row.label}>
                      <td className="py-3 pr-4 text-sand border-t border-sand/10">{row.label}</td>
                      <td
                        className={
                          'py-3 px-4 text-center bg-ember/10 border-x border-t border-ember/40 ' +
                          (last ? 'border-b rounded-b-sm' : '')
                        }
                      >
                        <Mark value={row.recall} />
                      </td>
                      <td className="py-3 px-4 text-center border-t border-sand/10"><Mark value={row.notes} /></td>
                      <td className="py-3 px-4 text-center border-t border-sand/10"><Mark value={row.paper} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-sand/50 mt-4">✓ yes &nbsp; – partly &nbsp; ✕ no</p>
        </div>
      </section>

      {/* Science */}
      <section className="border-t border-ink-2">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <SectionHeading
            title="Why this actually works"
            sub={
              <>
                Kognit is built on decades of cognitive science research, summarized in{' '}
                <em>Make It Stick: The Science of Successful Learning</em> by Peter C. Brown,
                Henry Roediger, and Mark McDaniel.
              </>
            }
          />
          <div className="grid md:grid-cols-2 gap-4">
            {SCIENCE.map((s) => (
              <div
                key={s.title}
                className={'bg-ink-2 rounded-sm p-6 transition-transform hover:-translate-y-1 ' + CARD}
              >
                <h3 className="text-paper font-medium mb-2">{s.title}</h3>
                <p className="text-sm text-sand">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-ink-2">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <SectionHeading
            title="Simple pricing"
            sub={`Try everything free for ${TRIAL_DAYS} days. Subscribe when you're ready to keep going.`}
          />
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <PlanCard
              name="Free trial"
              price="$0"
              period={'for ' + TRIAL_DAYS + ' days'}
              blurb="No card required. Full access to the study tools."
              perks={[
                { text: 'Unlimited decks and cards', included: true },
                { text: 'AI flashcards from notes, PDFs and photos', included: true },
                { text: 'Daily spaced-repetition review', included: true },
                { text: 'Recall and multiple-choice quizzes', included: true },
                { text: 'Learning goals with a timeline', included: true },
                { text: 'Streaks and study tips', included: true },
                { text: 'Add premade decks to your library', included: false },
              ]}
              ctaLabel="Start free trial"
              ctaNote="Takes 30 seconds."
            />
            <PlanCard
              highlight
              name="Subscriber"
              price={PRICE}
              period="per month"
              blurb="Keep studying after your trial, and unlock premade decks."
              perks={[
                { text: 'Everything in the free trial, with no time limit', included: true },
                { text: 'Add premade decks, starting with interview prep', included: true },
                { text: 'Keep all your decks, cards and progress', included: true },
                { text: 'Pay month to month. Nothing is charged automatically', included: true },
                { text: 'Pay with EcoCash or other local methods through Paynow', included: true },
              ]}
              ctaLabel="Get started"
              ctaNote="Create your account, then subscribe from inside the app."
            />
          </div>
          <p className="text-xs text-sand/50 text-center mt-8 max-w-md mx-auto">
            After your trial ends you'll need a subscription to keep studying. Your decks and progress are kept.
          </p>
        </div>
      </section>

      <AfterYouJoin />
      {/* FAQ */}
      <section id="faq" className="border-t border-ink-2">
        <div className="max-w-2xl mx-auto px-6 py-20">
          <SectionHeading title="Questions" />
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group bg-ink-2 rounded-sm border border-sand/10">
                <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden flex justify-between items-center gap-4 px-5 py-4 text-sm text-paper">
                  {f.q}
                  <span className="text-sand/60 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="px-5 pb-4 text-sm text-sand">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="relative overflow-hidden bg-ink-2 border border-sand/10 rounded-sm px-6 py-16 text-center">
          <div className="absolute -bottom-20 right-1/3 w-64 h-64 bg-ember/10 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-3xl text-paper mb-6">Ready to remember more?</h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/register"
                className={'bg-ember text-ink px-8 py-3 rounded-full font-semibold hover:bg-ember-dark transition-transform hover:-translate-y-0.5 ' + GLOW_BUTTON}
              >
                Start your free trial
              </Link>
              <Link
                to="/demo"
                className="border border-white/15 text-paper px-8 py-3 rounded-full font-medium hover:border-ember hover:text-ember transition-colors"
              >
                Try the demo
              </Link>
            </div>
            <p className="text-sm text-sand/60 mt-4">{TRIAL_DAYS} days free. No card required.</p>
          </div>
        <HeroPreview />
        </div>
      </section>

      <footer className="border-t border-ink-2">
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-8">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            <div>
              <Logo />
              <p className="text-sm text-sand mt-3 max-w-xs">
                Spaced repetition flashcards, done simply. Remember what you learn.
              </p>
            </div>

            <div>
              <p className="text-sm text-paper font-medium mb-3">Product</p>
              <ul className="space-y-2 text-sm text-sand">
                <li><a href="#features" className="hover:text-paper">Features</a></li>
                <li><a href="#pricing" className="hover:text-paper">Pricing</a></li>
                <li><Link to="/demo" className="hover:text-paper">Try the demo</Link></li>
                <li><Link to="/login" className="hover:text-paper">Log in</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-sm text-paper font-medium mb-3">Contact</p>
              <ul className="space-y-2 text-sm text-sand">
                <li><a href="https://wa.me/263719518113" target="_blank" rel="noopener noreferrer" className="hover:text-paper">WhatsApp: +263 71 951 8113</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-ink-2 pt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-sand/50">
            <p>© 2026 Kognit. All rights reserved.</p>
            <p>Made in Zimbabwe 🇿🇼</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({ title, sub }) {
  return (
    <div className="text-center mb-12">
      <h2 className="font-display text-2xl text-paper mb-2">{title}</h2>
      {sub && <p className="text-sand max-w-xl mx-auto">{sub}</p>}
    </div>
  );
}

function Mark({ value }) {
  if (value === 'yes') return <span className="text-moss">✓</span>;
  if (value === 'partly') return <span className="text-sand/60">–</span>;
  return <span className="text-rose">✕</span>;
}

function StepTile({ number, title, body, children }) {
  return (
    <div className={'bg-ink-2 rounded-sm p-5 ' + CARD}>
      <div className="h-28 bg-ink rounded-sm mb-5 flex items-center justify-center overflow-hidden">
        {children}
      </div>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-5 h-5 rounded-full bg-ember text-ink text-xs font-medium flex items-center justify-center">
          {number}
        </span>
        <h3 className="text-paper font-medium text-sm">{title}</h3>
      </div>
      <p className="text-sm text-sand">{body}</p>
    </div>
  );
}

function VisualAdd() {
  return (
    <div className="flex items-end gap-3">
      <div className="w-14 h-[72px] bg-paper rounded-sm p-2 space-y-1.5">
        <div className="h-1 bg-ink/30 rounded" />
        <div className="h-1 bg-ink/30 rounded w-3/4" />
        <div className="h-1 bg-ink/30 rounded" />
        <div className="h-1 bg-ink/30 rounded w-1/2" />
      </div>
      <div className="w-16 h-12 bg-paper/80 rounded-sm -rotate-6" />
    </div>
  );
}

function VisualGenerate() {
  return (
    <div className="relative w-24 h-16">
      <div className="absolute inset-0 bg-ember/30 rounded-sm rotate-6" />
      <div className="absolute inset-0 bg-paper rounded-sm -rotate-3 flex items-center justify-center text-ember text-xl">
        ✦
      </div>
    </div>
  );
}

function VisualReview() {
  const pills = [
    ['Again', 'bg-rose text-paper'],
    ['Hard', 'bg-ink-2 text-paper border border-sand/30'],
    ['Good', 'bg-moss text-paper'],
    ['Easy', 'bg-ember text-ink'],
  ];
  return (
    <div className="flex gap-1.5">
      {pills.map(([label, style]) => (
        <span key={label} className={'text-[10px] px-2 py-1 rounded-sm ' + style}>{label}</span>
      ))}
    </div>
  );
}

function VisualGoal() {
  return (
    <div className="w-40">
      <div className="flex justify-between text-[10px] text-sand mb-1.5">
        <span>Exam revision</span>
        <span>62%</span>
      </div>
      <div className="h-1.5 bg-ink-2 rounded-full overflow-hidden">
        <div className="h-full w-[62%] bg-ember rounded-full" />
      </div>
      <p className="text-[10px] text-sand/60 mt-1.5">12 days left</p>
    </div>
  );
}

function PlanCard({ name, price, period, blurb, perks, ctaLabel, ctaNote, highlight }) {
  const frame = highlight
    ? 'border border-ember/60 shadow-[0_8px_32px_rgba(214,138,61,0.15)]'
    : 'border border-sand/10 ' + CARD;

  const button = highlight
    ? 'bg-ember text-ink hover:bg-ember-dark'
    : 'border border-sand/30 text-paper hover:border-ember hover:text-ember';

  return (
    <div className={'relative bg-ink-2 rounded-sm p-8 flex flex-col ' + frame}>
      {highlight && (
        <span className="absolute -top-3 left-8 bg-ember text-ink text-xs font-medium px-3 py-1 rounded-full">
          Recommended
        </span>
      )}

      <h3 className="text-paper font-medium mb-4">{name}</h3>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="font-display text-5xl text-paper">{price}</span>
        <span className="text-sand text-sm">{period}</span>
      </div>
      <p className="text-sm text-sand mb-6">{blurb}</p>

      <ul className="space-y-3 mb-8 flex-1">
        {perks.map((perk) => (
          <li
            key={perk.text}
            className={'flex items-start gap-3 text-sm ' + (perk.included ? 'text-sand' : 'text-sand/40')}
          >
            <span className={perk.included ? 'text-ember' : 'text-sand/40'}>
              {perk.included ? '✓' : '–'}
            </span>
            {perk.text}
          </li>
        ))}
      </ul>

      <Link
        to="/register"
        className={'block text-center py-2.5 rounded-sm font-medium transition-colors ' + button}
      >
        {ctaLabel}
      </Link>
      <p className="text-xs text-sand/50 text-center mt-2">{ctaNote}</p>
    </div>
  );
}
