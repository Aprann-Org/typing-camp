import styles from "./JourneyStepper.module.css";

type JourneyStepperProps = {
  /** 1-indexed current stage, matching STAGE_ORDER position (report is the last value). */
  current: number;
  /** STAGE_ORDER.length, i.e. including the report stage as the finish flag. */
  total: number;
  label: string;
};

// Replaces a flat progress bar with the day's route: a dot per practice
// stage, a line connecting them, and a flag at the end standing in for the
// report stage — the thing a child is walking toward, not a percentage.
export function JourneyStepper({ current, total, label }: JourneyStepperProps) {
  const dotCount = total - 1;

  return (
    <div className={styles.row} role="img" aria-label={label}>
      {Array.from({ length: dotCount }, (_, i) => {
        const stepNum = i + 1;
        const done = stepNum < current;
        const isCurrent = stepNum === current;
        return (
          <div className={styles.segment} key={i}>
            <span className={[styles.dot, done ? styles.done : "", isCurrent ? styles.currentDot : ""].filter(Boolean).join(" ")} />
            {i < dotCount - 1 && <span className={[styles.line, done ? styles.lineDone : ""].filter(Boolean).join(" ")} />}
          </div>
        );
      })}
      <span className={[styles.line, current > dotCount ? styles.lineDone : ""].filter(Boolean).join(" ")} />
      <FlagIcon className={[styles.flag, current >= total ? styles.flagReached : ""].filter(Boolean).join(" ")} />
    </div>
  );
}

function FlagIcon({ className }: { className: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 4h11l-2.5 3.5L16 11H5V4z" fill="currentColor" />
    </svg>
  );
}
