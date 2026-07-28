"use client";

import { useI18n } from "@/context/I18nContext";
import { formatElapsed } from "./useElapsedTimer";
import styles from "./GameTimer.module.css";

/** The live stopwatch readout — see useElapsedTimer for how the number itself is produced. */
export function GameTimer({ elapsedMs }: { elapsedMs: number }) {
  const { t } = useI18n();
  return (
    <p className={styles.timer}>
      {t("common.timeLabel")} {formatElapsed(elapsedMs)}
    </p>
  );
}
