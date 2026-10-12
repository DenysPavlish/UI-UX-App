const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
};

export function StarIcon({ filled = false }) {
  return (
    <svg {...base} fill={filled ? 'currentColor' : 'none'}>
      <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
    </svg>
  );
}

export function SunIcon() {
  return (
    <svg {...base}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <svg {...base}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
    </svg>
  );
}

export function FilterIcon() {
  return (
    <svg {...base}>
      <path d="M3 5h18M6 12h12M10 19h4" />
    </svg>
  );
}

export function ChevronLeftIcon() {
  return (
    <svg {...base}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon() {
  return (
    <svg {...base}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function ChevronDownIcon() {
  return (
    <svg {...base}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ExternalIcon() {
  return (
    <svg {...base}>
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

export function CommentIcon() {
  return (
    <svg {...base}>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
    </svg>
  );
}

/** Знак застосунку: три зростаючі стовпчики, як індикатор рівня сигналу. */
export function BrandMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect x="4" y="18" width="6" height="10" rx="1.5" fill="currentColor" opacity="0.45" />
      <rect x="13" y="12" width="6" height="16" rx="1.5" fill="currentColor" opacity="0.72" />
      <rect x="22" y="5" width="6" height="23" rx="1.5" fill="currentColor" />
    </svg>
  );
}
