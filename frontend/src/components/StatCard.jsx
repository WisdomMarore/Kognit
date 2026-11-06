export default function StatCard({ icon: Icon, label, value, title }) {
  return (
    <div className="card card-interactive" title={title}>
      <div className="icon-tile"><Icon size={18} /></div>
      <p className="eyebrow mt-5">{label}</p>
      <p className="font-display text-4xl text-paper mt-2">{value}</p>
    </div>
  );
}