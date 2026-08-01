import type { DayNumber } from "@/lib/types";
import styles from "./DayPath.module.css";

type DayPathProps = {
  /** Days with real content behind them (see content/days). */
  availableDays: DayNumber[];
  selectedDay: DayNumber;
  onSelect: (day: DayNumber) => void;
  dayLabel: (day: DayNumber) => string;
  comingSoonLabel: string;
};

const ALL_DAYS: DayNumber[] = [1, 2, 3, 4, 5];

// The five-day camp as a path rather than a row of interchangeable chips —
// days without content yet still show as stops on the road ahead, just
// unreachable, so the shape of the week is visible from Day 1 on.
//
// There are no "completed" checkmarks: which days a child has finished isn't
// knowable here (storage is per-machine and they may be on a different
// laptop today — see docs/profile-recovery-plan.md), and a path that showed
// Day 1 unticked to a child on their third day would be worse than a path
// that never claims to know.
export function DayPath({ availableDays, selectedDay, onSelect, dayLabel, comingSoonLabel }: DayPathProps) {
  return (
    <div className={styles.row}>
      {ALL_DAYS.map((day, i) => {
        const available = availableDays.includes(day);
        const isSelected = selectedDay === day;

        return (
          <div className={styles.segment} key={day}>
            <button
              type="button"
              disabled={!available}
              onClick={() => onSelect(day)}
              className={[styles.stop, isSelected ? styles.selected : "", !available ? styles.locked : ""]
                .filter(Boolean)
                .join(" ")}
              aria-label={available ? dayLabel(day) : `${dayLabel(day)} — ${comingSoonLabel}`}
              title={available ? undefined : comingSoonLabel}
            >
              {day}
            </button>
            {i < ALL_DAYS.length - 1 && <span className={styles.line} />}
          </div>
        );
      })}
    </div>
  );
}
