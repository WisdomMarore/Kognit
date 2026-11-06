import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  House,
  Target,
  Library,
  CirclePlay,
  Lightbulb,
  Link2,
  CreditCard,
  MessageSquare,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import Logo from './Logo';

const MAIN = [
  { to: '/dashboard', label: 'Dashboard', icon: House, match: ['/dashboard', '/decks'] },
  { to: '/goals', label: 'Goals', icon: Target, match: ['/goals'] },
  { to: '/library', label: 'Premade decks', icon: Library, match: ['/library'] },
];

const RESOURCES = [
  { to: '/study-tips', label: 'Study tips', icon: Lightbulb, match: ['/study-tips'] },
  { to: '/links', label: 'Links', icon: Link2, match: ['/links'] },
];

const BILLING = { to: '/billing', label: 'Billing', icon: CreditCard, match: ['/billing'] };

const ROW = 'flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-left transition-colors';
const IDLE = ' text-sand hover:text-paper hover:bg-ink-2/60';
const ACTIVE = ' bg-ember/10 text-paper';

function isActive(pathname, match) {
  return match.some((m) => pathname === m || pathname.startsWith(m + '/'));
}

export default function AppLayout({ children }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  }

  function renderItem(item) {
    const active = isActive(pathname, item.match);
    const Icon = item.icon;
    return (
      <Link
        key={item.to}
        to={item.to}
        onClick={() => setOpen(false)}
        className={ROW + (active ? ACTIVE : IDLE)}
      >
        <Icon size={18} strokeWidth={1.75} className={active ? 'text-ember' : ''} />
        {item.label}
      </Link>
    );
  }

  return (
    <div className="min-h-screen bg-ink md:flex">
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-ink/90 backdrop-blur border-b border-ink-2">
        <Link to="/dashboard"><Logo /></Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="text-sand hover:text-paper"
        >
          <Menu size={22} />
        </button>
      </header>

      {open && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/60" onClick={() => setOpen(false)} />
      )}

      <aside
        className={
          'fixed inset-y-0 left-0 z-40 w-64 bg-ink border-r border-ink-2 flex flex-col transition-transform ' +
          'md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:translate-x-0 ' +
          (open ? 'translate-x-0' : '-translate-x-full')
        }
      >
        <div className="flex items-center justify-between px-5 pt-6 pb-6">
          <Link to="/dashboard" onClick={() => setOpen(false)}><Logo /></Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="md:hidden text-sand hover:text-paper"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3">
          <div className="space-y-1">{MAIN.map(renderItem)}</div>

          <p className="text-[11px] uppercase tracking-widest text-sand/50 px-3 mt-8 mb-2">
            Resources
          </p>
          <div className="space-y-1">{RESOURCES.map(renderItem)}</div>
        </nav>

        <div className="shrink-0 border-t border-ink-2 px-3 py-3 space-y-1">
          {renderItem(BILLING)}
          <a
            href="https://wa.me/263719518113?text=Kognit%20feedback%3A%20" target="_blank" rel="noopener noreferrer"
            className={ROW + IDLE}
          >
            <MessageSquare size={18} strokeWidth={1.75} />
            Send feedback
          </a>
          <button onClick={handleLogout} className={ROW + IDLE}>
            <LogOut size={18} strokeWidth={1.75} />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
