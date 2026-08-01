"use client";

import type { DayNumber } from "@/lib/types";
import type { LevelConfig } from "@/content/levels";
import { computeKeyMastery, type StageTypingSummary } from "@/lib/typing-engine";
import { MAX_DAY_SCORE, type DayScore } from "@/lib/day-score";
import { useI18n } from "@/context/I18nContext";
import { BadgeArt } from "@/components/BadgeArt";
import { Mascot } from "@/components/Mascot";

// Today only. Nothing here reads past sessions — no streak, no shelf of
// earlier badges — because a child isn't guaranteed the same laptop twice
// and those numbers were misreporting for most of them. Every value below
// comes from the session that just finished. See docs/profile-recovery-plan.md.
//
// The score is shown at every level, unlike WPM and accuracy: it's the number
// the day's competition runs on, and it's framed as points earned rather than
// a percentage kept, so it never reads as a failing grade to a beginner. It
// also isn't saved anywhere a teacher can go looking for it later — hence the
// note above the Done button telling the child to read it out first.
type ReportStageProps = {
  badgeLabel: string;
  day: DayNumber;
  firstName: string;
  level: LevelConfig;
  summary: StageTypingSummary;
  score: DayScore;
  onDone: () => void;
};

function displayKey(key: string): string {
  return key === " " ? "Space" : key;
}

export function ReportStage({ badgeLabel, day, firstName, level, summary, score, onDone }: ReportStageProps) {
  const { t } = useI18n();
  const { mastered, warmingUp } = computeKeyMastery(summary);
  const minutes = Math.floor(score.activeSeconds / 60);
  const seconds = score.activeSeconds % 60;
  // Hard numbers (WPM, accuracy) follow the same level dimension as WPM
  // display in the brief's level table — Starter typists aren't shown
  // either, only the softer "keys mastered / keys warming up" framing.
  const showNumbers = level.showWpm;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <Mascot pose="celebrate" size={64} />
      <h2 className="font-[family-name:var(--font-display)] text-3xl text-foreground">{t("stages.report.title")}</h2>

      <div className="flex flex-col items-center gap-1 font-[family-name:var(--font-ui)]">
        <span className="font-[family-name:var(--font-display)] text-6xl leading-none text-[var(--accent-celebrate)]">
          {score.total}
        </span>
        <span className="text-sm text-foreground-muted">{t("stages.report.scoreLabel", { max: MAX_DAY_SCORE })}</span>
        {/* Name, day and level together, because the score only means
            something next to the level it was earned at — Starter and Flyer
            sessions aren't the same work and shouldn't be ranked together. */}
        <span className="mt-1 text-sm text-foreground">
          {t("stages.report.scoreIdentity", { name: firstName, day, level: t(`levels.${level.id}.name`) })}
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 font-[family-name:var(--font-ui)] text-foreground">
        {showNumbers && (
          <>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-semibold">{score.wpm}</span>
              <span className="text-xs text-foreground-muted">{t("stages.report.wpmLabel")}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-semibold">{Math.round(score.accuracy * 100)}%</span>
              <span className="text-xs text-foreground-muted">{t("stages.report.accuracyLabel")}</span>
            </div>
          </>
        )}
        {/* Volume and time carry no pass/fail reading, so unlike WPM and
            accuracy they're shown at every level. */}
        <div className="flex flex-col items-center">
          <span className="text-2xl font-semibold">{score.charsTyped}</span>
          <span className="text-xs text-foreground-muted">{t("stages.report.charsTypedLabel")}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-semibold">{t("stages.report.timeValue", { minutes, seconds })}</span>
          <span className="text-xs text-foreground-muted">{t("stages.report.timeTypingLabel")}</span>
        </div>
      </div>

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

      <div className="flex flex-col items-center gap-2 font-[family-name:var(--font-ui)]">
        <p className="text-sm text-foreground-muted">{t("stages.report.badgeLabel")}</p>
        <BadgeArt label={badgeLabel} size={88} />
        {/* Gold, not a finger color — this is the one screen where "earned"
            is the meaning being carried, and no finger colors are on it. */}
        <p className="text-lg font-semibold text-[var(--accent-celebrate)]">{badgeLabel}</p>
      </div>

      {/* Deliberately the last thing above the button: the score is gone the
          moment this screen closes, by design. */}
      <p className="max-w-sm rounded-xl border border-border-subtle bg-background-raised px-4 py-3 font-[family-name:var(--font-ui)] text-sm text-foreground">
        {t("stages.report.shareNote")}
      </p>

      <button className="btn-primary px-8 py-3 text-lg" onClick={onDone}>
        {t("stages.report.doneButton")}
      </button>
    </div>
  );
}
