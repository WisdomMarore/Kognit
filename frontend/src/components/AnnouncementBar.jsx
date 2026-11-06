import { Link } from 'react-router-dom';

export default function AnnouncementBar() {
  return (
    <div className="bg-white/[0.04] border-b border-white/10 text-center text-xs text-sand py-2 px-4">
      Free trial, no card needed.{' '}
      <Link to="/register" className="text-ember font-semibold hover:underline">Start now &rarr;</Link>
    </div>
  );
}