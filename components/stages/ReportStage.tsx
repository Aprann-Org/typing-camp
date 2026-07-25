"use client";

import type { LevelConfig } from "@/content/levels";
import { computeKeyMastery, type StageTypingSummary } from "@/lib/typing-engine";
import { useI18n } from "@/context/I18nContext";

type ReportStageProps = {
  badgeLabel: string;
  level: LevelConfig;
  summary: StageTypingSummary;
  wpm: number;
  accuracy: number;
  streak: number;
  onDone: () => void;
};

function displayKey(key: string): string {
  return key === " " ? "Space" : key;
}

export function ReportStage({ badgeLabel, level, summary, wpm, accuracy, streak, onDone }: ReportStageProps) {
  const { t } = useI18n();
  const { mastered, warmingUp } = computeKeyMastery(summary);
  // Hard numbers (WPM, accuracy) follow the same level dimension as WPM
  // display in the brief's level table — Starter typists aren't shown
  // either, only the softer "keys mastered / keys warming up" framing.
  const showNumbers = level.showWpm;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <h2 className="font-[family-name:var(--font-display)] text-3xl text-foreground">{t("stages.report.title")}</h2>

      {showNumbers && (
        <div className="flex gap-8 font-[family-name:var(--font-ui)] text-foreground">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-semibold">{wpm}</span>
            <span className="text-xs text-foreground-muted">{t("stages.report.wpmLabel")}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-semibold">{Math.round(accuracy * 100)}%</span>
            <span className="text-xs text-foreground-muted">{t("stages.report.accuracyLabel")}</span>
          </div>
        </div>
      )}

      <div className="flex max-w-md flex-col gap-3 font-[family-name:var(--font-ui)]">
        <div>
          <p className="text-sm text-foreground-muted">{t("stages.report.keysMasteredLabel")}</p>
          <p className="text-foreground">{mastered.length > 0 ? mastered.map(displayKey).join("  ") : "—"}</p>
        </div>
        <div>
          <p className="text-sm text-foreground-muted">{t("stages.report.keysWarmingUpLabel")}</p>
          <p className="text-foreground">
            {warmingUp.length > 0 ? warmingUp.map(displayKey).join("  ") : t("stages.report.noWeakKeys")}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 font-[family-name:var(--font-ui)]">
        <p className="text-sm text-foreground-muted">{t("stages.report.badgeLabel")}</p>
        <p className="text-lg font-semibold text-[var(--finger-left-index)]">{badgeLabel}</p>
      </div>

      <div className="flex flex-col items-center gap-1 font-[family-name:var(--font-ui)]">
        <p className="text-sm text-foreground-muted">{t("stages.report.streakLabel")}</p>
        <p className="text-lg font-semibold text-foreground">{streak}</p>
      </div>

      <button
        className="mt-2 rounded-full bg-[var(--finger-left-index)] px-8 py-3 font-[family-name:var(--font-ui)] text-lg font-semibold text-[#14162a]"
        onClick={onDone}
      >
        {t("stages.report.doneButton")}
      </button>
    </div>
  );
}
