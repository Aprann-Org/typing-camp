"use client";

import type { LevelConfig } from "@/content/levels";
import type { Language } from "@/lib/types";
import type { WeekSummaryDay } from "@/lib/storage";
import { getDayDisplayText } from "@/content/days";
import { useI18n } from "@/context/I18nContext";
import { BadgeArt } from "@/components/BadgeArt";
import { Mascot } from "@/components/Mascot";
import styles from "./WeekSummaryStage.module.css";

type WeekSummaryStageProps = {
  language: Language;
  level: LevelConfig;
  weekSummary: WeekSummaryDay[];
  onDone: () => void;
  /** Overrides the closing button's label — "Finish" right after Day 5's own report, "Back" when reopened later from the start screen. */
  doneLabel?: string;
};

function displayKey(key: string): string {
  return key === " " ? "Space" : key;
}

function formatMinutes(totalSeconds: number): string {
  return String(Math.round(totalSeconds / 60));
}

export function WeekSummaryStage({ language, level, weekSummary, onDone, doneLabel }: WeekSummaryStageProps) {
  const { t } = useI18n();

  // Same dimension ReportStage gates hard numbers on — today's chosen level
  // decides whether WPM/accuracy are shown, extended to the week view for
  // consistency (a Starter week still gets the softer keys/badges framing).
  const showNumbers = level.showWpm;

  const maxWpm = Math.max(...weekSummary.map((d) => d.wpm), 1);
  const totalSeconds = weekSummary.reduce((sum, d) => sum + d.durationSeconds, 0);
  const keysMastered = Array.from(new Set(weekSummary.flatMap((d) => d.keysMastered)));

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <Mascot pose="celebrate" size={64} />
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-foreground">{t("stages.weekSummary.title")}</h2>
        <p className="font-[family-name:var(--font-ui)] text-foreground-muted">{t("stages.weekSummary.subtitle")}</p>
      </div>

      {showNumbers && (
        <>
          <div className={styles.chartBlock}>
            <p className={styles.chartTitle}>{t("stages.weekSummary.wpmChartTitle")}</p>
            <div className={styles.bars} role="img" aria-label={t("stages.weekSummary.wpmChartTitle")}>
              {weekSummary.map((d) => (
                <div key={d.day} className={styles.barColumn}>
                  <span className={styles.barValue}>{d.wpm}</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ height: `${Math.max(6, (d.wpm / maxWpm) * 100)}%` }} />
                  </div>
                  <span className={styles.barDayLabel}>{t("stages.weekSummary.dayLabel", { day: d.day })}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.chartBlock}>
            <p className={styles.chartTitle}>{t("stages.weekSummary.accuracyChartTitle")}</p>
            <div className={styles.bars} role="img" aria-label={t("stages.weekSummary.accuracyChartTitle")}>
              {weekSummary.map((d) => {
                const pct = Math.round(d.accuracy * 100);
                return (
                  <div key={d.day} className={styles.barColumn}>
                    <span className={styles.barValue}>{pct}%</span>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} style={{ height: `${Math.max(6, pct)}%` }} />
                    </div>
                    <span className={styles.barDayLabel}>{t("stages.weekSummary.dayLabel", { day: d.day })}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col items-center gap-1 font-[family-name:var(--font-ui)]">
        <p className="text-sm text-foreground-muted">{t("stages.weekSummary.totalPracticeLabel")}</p>
        <p className="text-lg font-semibold text-foreground">{formatMinutes(totalSeconds)}</p>
      </div>

      <div className="flex max-w-md flex-col gap-1 font-[family-name:var(--font-ui)]">
        <p className="text-sm text-foreground-muted">{t("stages.weekSummary.keysMasteredLabel")}</p>
        <p className="text-foreground">{keysMastered.map(displayKey).join("  ")}</p>
      </div>

      <div className="flex flex-col items-center gap-2 font-[family-name:var(--font-ui)]">
        <p className="text-sm text-foreground-muted">{t("stages.weekSummary.badgesLabel")}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {weekSummary.map((d) => {
            const label = getDayDisplayText(language, d.day)?.badgeLabel ?? d.badgeId ?? "";
            return <BadgeArt key={d.day} label={label} size={56} />;
          })}
        </div>
      </div>

      <button className="btn-primary mt-2 px-8 py-3 text-lg" onClick={onDone}>
        {doneLabel ?? t("stages.weekSummary.finishButton")}
      </button>
    </div>
  );
}
