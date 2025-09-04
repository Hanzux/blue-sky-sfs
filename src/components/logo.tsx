import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn('fill-primary', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
            <feOffset in="blur" dx="2" dy="2" result="offsetBlur"/>
            <feMerge>
                <feMergeNode in="offsetBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#skyGradient)" />
      <path
        d="M 60 40 A 20 20 0 0 0 40 60 L 75 60 A 15 15 0 0 0 60 40"
        fill="white"
        opacity="0.9"
        filter="url(#shadow)"
      />
      <circle cx="35" cy="55" r="15" fill="white" opacity="0.9" filter="url(#shadow)" />
      <circle cx="70" cy="50" r="25" fill="hsl(var(--accent))" />
    </svg>
  );
}
