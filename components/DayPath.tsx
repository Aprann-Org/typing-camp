import type { DayNumber } from "@/lib/types";
import styles from "./DayPath.module.css";

type DayPathProps = {
  /** Days with real content behind them (currently just Day 1 — see content/days). */
  availableDays: DayNumber[];
  selectedDay: DayNumber;
  lastCompletedDay: DayNumber | null;
  onSelect: (day: DayNumber) => void;
  dayLabel: (day: DayNumber) => string;
  comingSoonLabel: string;
};

const ALL_DAYS: DayNumber[] = [1, 2, 3, 4, 5];

// The five-day camp as a path rather than a row of interchangeable chips —
// days without content yet (2-5, at this build checkpoint) still show as
// stops on the road ahead, just unreachable, so the shape of the week is
// visible from Day 1 on.
export function DayPath({ availableDays, selectedDay, lastCompletedDay, onSelect, dayLabel, comingSoonLabel }: DayPathProps) {
  return (
    <div className={styles.row}>
      {ALL_DAYS.map((day, i) => {
        const available = availableDays.includes(day);
        const done = lastCompletedDay !== null && day <= lastCompletedDay;
        const isSelected = selectedDay === day;

        return (
          <div className={styles.segment} key={day}>
            <button
              type="button"
              disabled={!available}
              onClick={() => onSelect(day)}
              className={[styles.stop, done ? styles.done : "", isSelected ? styles.selected : "", !available ? styles.locked : ""]
                .filter(Boolean)
                .join(" ")}
              aria-label={available ? dayLabel(day) : `${dayLabel(day)} — ${comingSoonLabel}`}
              title={available ? undefined : comingSoonLabel}
            >
              {done ? <CheckIcon /> : day}
            </button>
            {i < ALL_DAYS.length - 1 && <span className={[styles.line, done ? styles.lineDone : ""].filter(Boolean).join(" ")} />}
          </div>
        );
      })}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12.5 9.5 18 20 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
