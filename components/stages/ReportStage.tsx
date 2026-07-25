"use client";

import type { LevelConfig } from "@/content/levels";
import type { Profile } from "@/lib/types";
import { computeKeyMastery, type StageTypingSummary } from "@/lib/typing-engine";
import { getEarnedBadges } from "@/lib/storage";
import { getDayDisplayText } from "@/content/days";
import { useI18n } from "@/context/I18nContext";
import { BadgeArt } from "@/components/BadgeArt";
import { Mascot } from "@/components/Mascot";

type ReportStageProps = {
  profile: Profile;
  badgeId: string | null;
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

export function ReportStage({ profile, badgeId, badgeLabel, level, summary, wpm, accuracy, streak, onDone }: ReportStageProps) {
  const { t } = useI18n();
  const { mastered, warmingUp } = computeKeyMastery(summary);
  // Hard numbers (WPM, accuracy) follow the same level dimension as WPM
  // display in the brief's level table — Starter typists aren't shown
  // either, only the softer "keys mastered / keys warming up" framing.
  const showNumbers = level.showWpm;

  const earnedBadges = getEarnedBadges(profile);
  // Everything but today's own badge (that one already gets the large medal
  // above) — only worth a shelf once there's a second one to show.
  const shelfBadges = earnedBadges.filter((b) => b.badgeId !== badgeId);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <Mascot pose="celebrate" size={64} />
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

      <div className="flex flex-col items-center gap-2 font-[family-name:var(--font-ui)]">
        <p className="text-sm text-foreground-muted">{t("stages.report.badgeLabel")}</p>
        <BadgeArt label={badgeLabel} size={88} />
        {/* Gold, not a finger color — this is the one screen where "earned"
            is the meaning being carried, and no finger colors are on it. */}
        <p className="text-lg font-semibold text-[var(--accent-celebrate)]">{badgeLabel}</p>
      </div>

      {shelfBadges.length > 0 && (
        <div className="flex flex-col items-center gap-2 font-[family-name:var(--font-ui)]">
          <p className="text-sm text-foreground-muted">{t("stages.report.badgeShelfLabel")}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {shelfBadges.map((b) => {
              const label = getDayDisplayText(profile.language, b.day)?.badgeLabel ?? b.badgeId;
              return <BadgeArt key={b.day} label={label} size={44} />;
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-1 font-[family-name:var(--font-ui)]">
        <p className="text-sm text-foreground-muted">{t("stages.report.streakLabel")}</p>
        <p className="text-lg font-semibold text-foreground">{streak}</p>
      </div>

      <button className="btn-primary mt-2 px-8 py-3 text-lg" onClick={onDone}>
        {t("stages.report.doneButton")}
      </button>
    </div>
  );
}
