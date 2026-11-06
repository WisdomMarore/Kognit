export function LogoMark({ className = 'w-10 h-8' }) {
  return (
    <svg viewBox="0 0 64 52" className={className} fill="none" aria-hidden="true">
      <g transform="rotate(-16 29 23)">
        <rect x="10" y="8" width="38" height="30" rx="6" className="fill-ember" opacity="0.45" />
      </g>
      <g transform="rotate(-9 31 25)">
        <rect x="12" y="10" width="38" height="30" rx="6" className="fill-ember" />
      </g>
      <g transform="rotate(-3 37 29)">
        <rect x="18" y="14" width="38" height="30" rx="6" className="fill-ink stroke-ember" strokeWidth="3.5" />
        <line x1="25" y1="25" x2="45" y2="25" className="stroke-paper" strokeWidth="3" strokeLinecap="round" />
        <line x1="25" y1="32" x2="36" y2="32" className="stroke-paper" strokeWidth="3" strokeLinecap="round" />
        <path
          d="M47 30.5 Q47.8 35.2 52.5 36 Q47.8 36.8 47 41.5 Q46.2 36.8 41.5 36 Q46.2 35.2 47 30.5Z"
          className="fill-ember"
        />
      </g>
    </svg>
  );
}

export default function Logo({ size = 'md' }) {
  const large = size === 'lg';
  return (
    <div className="flex items-center gap-2">
      <LogoMark className={large ? 'w-14 h-12' : 'w-10 h-8'} />
      <span className={'font-display font-semibold text-paper leading-none ' + (large ? 'text-4xl' : 'text-2xl')}>
        Kognit
      </span>
    </div>
  );
}
