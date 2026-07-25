"use client";

import { WordSceneGame, colorFor, type SceneRenderProps } from "./WordSceneGame";
import type { StageTypingSummary } from "@/lib/typing-engine";
import type { ErrorHandlingMode } from "@/content/levels";
import { useI18n } from "@/context/I18nContext";
import styles from "./SoarGame.module.css";

// Day 4 — "Soar on Wings" (Isaiah 40:31). Mirrors the day's Scratch project,
// "Make It Fly."
//
// THE BIRD NEVER FALLS. This is the whole design constraint and it is worth
// stating plainly, because the obvious version of a flying game — hold your
// speed up or you sink — is exactly wrong here. Isaiah 40:31 is a promise to
// the weary, and the brief's rule is never to show a child a failing score.
// A slower typist reaches the same sky, later. There is no timer, nothing
// decays, and altitude only ever increases.
//
// Height is driven straight off words completed, so the eagle's position is
// a pure function of progress and cannot drift out of sync with the text.
const WORDS = ["vole", "van", "wo", "leve", "nwaj", "kouraj"];

function SoarScene({ revealed, total }: SceneRenderProps) {
  // 0 at the hilltops, 1 above the clouds.
  const progress = total === 0 ? 0 : revealed / total;
  const birdY = 150 - progress * 116;
  const wingColor = colorFor(WORDS[Math.min(revealed, WORDS.length - 1)][0]);

  return (
    <svg viewBox="0 0 300 200" role="img" aria-label="An eagle rising higher with every word">
      {/* Clouds sit at fixed heights so the child can see the bird pass them. */}
      <ellipse cx="70" cy="92" rx="30" ry="12" fill="var(--foreground-muted)" opacity="0.18" />
      <ellipse cx="228" cy="64" rx="34" ry="13" fill="var(--foreground-muted)" opacity="0.14" />

      {/* Hills — the ground being left behind. */}
      <path d="M0 200 L0 170 Q54 142 108 170 Q162 196 216 166 Q258 144 300 168 L300 200 Z"
        fill="var(--foreground-muted)" opacity="0.22" />

      {/* The eagle. translateY is transitioned, not animated on a loop, so
          prefers-reduced-motion only has to switch the transition off. */}
      <g className={styles.bird} style={{ transform: `translateY(${birdY}px)` }}>
        <path d="M150 0 Q132 -12 112 -6 Q132 2 144 6 Z" fill={wingColor} />
        <path d="M150 0 Q168 -12 188 -6 Q168 2 156 6 Z" fill={wingColor} />
        <ellipse cx="150" cy="4" rx="8" ry="5" fill={wingColor} opacity="0.85" />
      </g>
    </svg>
  );
}

type Props = {
  unlockedChars: ReadonlySet<string>;
  shiftUnlocked: boolean;
  errorHandling: ErrorHandlingMode;
  onComplete: (summary: StageTypingSummary) => void;
};

export function SoarGame({ unlockedChars, shiftUnlocked, errorHandling, onComplete }: Props) {
  const { t } = useI18n();
  return (
    <WordSceneGame
      words={WORDS}
      instruction={t("games.day4Soar.instruction")}
      unlockedChars={unlockedChars}
      shiftUnlocked={shiftUnlocked}
      errorHandling={errorHandling}
      renderScene={(props) => <SoarScene {...props} />}
      onComplete={onComplete}
    />
  );
}
