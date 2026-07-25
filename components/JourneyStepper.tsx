import { Fragment } from "react";
import styles from "./JourneyStepper.module.css";

type JourneyStepperProps = {
  /** 1-indexed current stage, matching STAGE_ORDER position (report is the last value). */
  current: number;
  /** STAGE_ORDER.length, i.e. including the report stage as the finish flag. */
  total: number;
  label: string;
  /**
   * Relative length of each segment, one per dot, from
   * lib/session-progress.ts. Equal-length segments if omitted.
   */
  shares?: number[];
  /**
   * How far through the current stage the child is, 0-1. Partially fills the
   * current segment, so the long stages visibly move instead of sitting still
   * for minutes at a time.
   */
  fraction?: number;
};

// Replaces a flat progress bar with the day's route: a dot per practice
// stage, a line connecting them, and a flag at the end standing in for the
// report stage — the thing a child is walking toward, not a percentage.
//
// Segment i is the walk from dot i to the next dot, i.e. the work of stage i:
// it's full once that stage is done, and partially filled while it's underway.
export function JourneyStepper({ current, total, label, shares, fraction = 0 }: JourneyStepperProps) {
  const dotCount = total - 1;

  return (
    <div className={styles.row} role="img" aria-label={label}>
      {Array.from({ length: dotCount }, (_, i) => {
        const stepNum = i + 1;
        const done = stepNum < current;
        const isCurrent = stepNum === current;
        return (
          <Fragment key={i}>
            <span className={[styles.dot, done ? styles.done : "", isCurrent ? styles.currentDot : ""].filter(Boolean).join(" ")} />
            <span className={styles.line} style={{ flexGrow: shares?.[i] ?? 1 }}>
              <span className={styles.lineFill} style={{ width: `${(done ? 1 : isCurrent ? fraction : 0) * 100}%` }} />
            </span>
          </Fragment>
        );
      })}
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
