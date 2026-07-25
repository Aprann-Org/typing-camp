import type { LevelId } from "@/content/levels";

type LevelIconProps = {
  level: LevelId;
  size?: number;
};

// One glyph per level, drawn with currentColor so each just inherits
// whatever text color its chip already has (selected vs. unselected) — no
// separate light/dark or state variant to maintain.
export function LevelIcon({ level, size = 20 }: LevelIconProps) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true } as const;

  if (level === "starter") {
    // A single sprout — first thing to grow.
    return (
      <svg {...common}>
        <path d="M12 21V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 11c0-4 3-6 7-6 0 4-3 6-7 6z" fill="currentColor" opacity="0.85" />
        <path d="M12 15c0-3-2.5-4.5-5.5-4.5 0 3 2.5 4.5 5.5 4.5z" fill="currentColor" opacity="0.6" />
      </svg>
    );
  }

  if (level === "builder") {
    // Two stacked blocks — building on what's already there.
    return (
      <svg {...common}>
        <rect x="5" y="12" width="8" height="7" rx="1.5" fill="currentColor" opacity="0.6" />
        <rect x="11" y="5" width="8" height="7" rx="1.5" fill="currentColor" opacity="0.9" />
      </svg>
    );
  }

  // Flyer — a wing, echoing the Kreyòl level name "Zwazo" (bird).
  return (
    <svg {...common}>
      <path
        d="M3 15c4-1 7-4 8-9 1 5 4 8 9 8-4 1.5-6 1-8-2 0 3-2 5-6 5-1 0-2.5-1-3-2z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}
