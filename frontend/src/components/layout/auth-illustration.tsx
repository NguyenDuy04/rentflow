export function AuthIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 520"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      className={className}>
      <defs>
        <linearGradient id="authBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(168 68% 30%)" />
          <stop offset="100%" stopColor="hsl(168 82% 14%)" />
        </linearGradient>
        <pattern id="authDots" width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.4" fill="white" fillOpacity="0.14" />
        </pattern>
      </defs>

      <rect width="400" height="520" fill="url(#authBg)" />
      <rect width="400" height="520" fill="url(#authDots)" />

      <circle cx="330" cy="90" r="140" fill="hsl(36 79% 57%)" fillOpacity="0.16" />
      <circle cx="30" cy="460" r="160" fill="black" fillOpacity="0.14" />

      {/* Scattered "room card" cluster */}
      <g>
        <rect
          x="55" y="190" width="82" height="104" rx="16"
          fill="white" fillOpacity="0.10"
          transform="rotate(-7 96 242)"
        />
        <rect
          x="150" y="150" width="94" height="126" rx="16"
          fill="white" fillOpacity="0.16"
          transform="rotate(4 197 213)"
        />
        <rect
          x="253" y="196" width="78" height="98" rx="16"
          fill="hsl(36 79% 57%)"
          transform="rotate(-4 292 245)"
        />
        <rect
          x="100" y="288" width="72" height="92" rx="16"
          fill="white" fillOpacity="0.14"
          transform="rotate(7 136 334)"
        />
        <rect
          x="196" y="300" width="66" height="84" rx="16"
          fill="white" fillOpacity="0.92"
          transform="rotate(-5 229 342)"
        />
      </g>

      {/* window cross on the amber card */}
      <g stroke="hsl(30 45% 18%)" strokeOpacity="0.4" strokeWidth="2.5" strokeLinecap="round">
        <line x1="292" y1="214" x2="292" y2="278" />
        <line x1="270" y1="246" x2="314" y2="246" />
      </g>

      {/* small "check" mark on the light card, suggesting a paid/settled bill */}
      <path
        d="M212 340 L224 352 L248 326"
        stroke="hsl(168 76% 24%)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* two soft accent dots for balance */}
      <circle cx="72" cy="150" r="5" fill="white" fillOpacity="0.5" />
      <circle cx="332" cy="330" r="4" fill="hsl(36 79% 57%)" />
    </svg>
  );
}
