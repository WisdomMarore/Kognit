const STEPS = [
  { n: '01', title: 'Pay securely', body: 'Choose EcoCash or another method through Paynow.' },
  { n: '02', title: 'Access switches on', body: 'As soon as the payment is confirmed, your subscription is active.' },
  { n: '03', title: 'Build your first deck', body: 'Paste notes, upload a PDF, or snap a photo of a page.' },
  { n: '04', title: 'Start your daily review', body: 'Kognit shows you exactly which cards are due today.' },
];

function Step({ s }) {
  return (
    <div className="surface p-6">
      <p className="font-display text-5xl text-ember/80">{s.n}</p>
      <p className="text-paper font-semibold mt-4">{s.title}</p>
      <p className="text-sm text-sand mt-2">{s.body}</p>
    </div>
  );
}

export default function AfterYouJoin() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-20">
      <p className="eyebrow">After you subscribe</p>
      <h2 className="font-display text-3xl md:text-4xl text-paper mt-2 mb-10">What happens next</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => <Step key={s.n} s={s} />)}
      </div>
    </section>
  );
}