type BadgeArtProps = {
  label: string;
  size?: number;
  /** Not-yet-earned badges render as a dim silhouette rather than being omitted — a preview of what's ahead. */
  earned?: boolean;
};

// A medal, drawn once in SVG rather than shipped as an image asset — colors
// come from the same --accent-celebrate gold used everywhere else "earned"
// is meant, so it never introduces a color the palette doesn't already own.
export function BadgeArt({ label, size = 72, earned = true }: BadgeArtProps) {
  const ribbon = earned ? "var(--accent-celebrate)" : "var(--border-subtle)";
  const disc = earned ? "var(--accent-celebrate)" : "var(--background-raised)";
  const star = earned ? "var(--background)" : "var(--foreground-muted)";

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={label}>
      <path d="M22 38 L13 60 L24 54 L31 62 L27 40" fill={ribbon} opacity={earned ? 0.9 : 0.4} />
      <path d="M42 38 L51 60 L40 54 L33 62 L37 40" fill={ribbon} opacity={earned ? 0.9 : 0.4} />
      <circle cx="32" cy="27" r="20" fill={disc} stroke={ribbon} strokeWidth="2.5" opacity={earned ? 1 : 0.7} />
      <path
        d="M32 16 L35.6 23.4 43.7 24.6 37.9 30.3 39.3 38.4 32 34.6 24.7 38.4 26.1 30.3 20.3 24.6 28.4 23.4 Z"
        fill={star}
        opacity={earned ? 1 : 0.6}
      />
    </svg>
  );
}
