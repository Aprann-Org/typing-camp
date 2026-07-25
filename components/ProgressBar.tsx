type ProgressBarProps = {
  current: number;
  total: number;
  label: string;
};

// A stage progress bar, deliberately not a countdown clock — kids should
// see how far through the session they are, not how much time is left.
export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, Math.round((current / total) * 100)));
  return (
    <div className="w-full max-w-2xl">
      <div className="mb-1 font-[family-name:var(--font-ui)] text-xs text-foreground-muted">{label}</div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-background-raised">
        <div
          className="h-full rounded-full bg-[var(--accent-action)] transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
