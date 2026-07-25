"use client";

import { WordSceneGame, colorFor, type SceneRenderProps } from "./WordSceneGame";
import type { StageTypingSummary } from "@/lib/typing-engine";
import type { ErrorHandlingMode } from "@/content/levels";
import { useI18n } from "@/context/I18nContext";
import styles from "./FindTheSheepGame.module.css";

// Day 5 — "The One Who Seeks You" (Luke 15:3-7, John 10:11). Mirrors the
// day's Scratch project, "Chase Game."
//
// THE SHEEP IS ALWAYS FOUND. The pastoral doc is explicit that the gospel
// "turns the chase around" — God does the seeking, the child is the one
// sought, and "He won't stop until He finds the one lost sheep." A chase the
// child could lose would invert the point of the entire week, so the last
// word always reveals the sheep no matter how the typing went.
//
// The shepherd walks right across the scene, searching one hiding place per
// word. The sheep is behind the last one.
const WORDS = ["chache", "bwa", "wout", "jaden", "jwenn", "mouton"];

// x positions of the hiding places the shepherd checks, in order.
const SPOTS = [58, 106, 154, 202, 250];

function SheepScene({ revealed, total }: SceneRenderProps) {
  const found = revealed >= total;
  // The shepherd stands at the spot currently being searched, then walks to
  // the sheep on the final word.
  const shepherdX = found ? SPOTS[SPOTS.length - 1] - 30 : SPOTS[Math.min(revealed, SPOTS.length - 1)] - 30;
  const paint = (i: number) => colorFor(WORDS[i][0]);

  return (
    <svg viewBox="0 0 300 200" role="img" aria-label="A shepherd searching for one lost sheep">
      <line x1="0" y1="168" x2="300" y2="168" stroke="var(--foreground-muted)" strokeWidth="2" opacity="0.3" />

      {/* Hiding places. Each one the shepherd has already checked lights up,
          so the child can see the search actually progressing. */}
      {SPOTS.map((x, i) => (
        <ellipse
          key={x}
          cx={x}
          cy={158}
          rx="17"
          ry="12"
          fill={revealed > i ? paint(Math.min(i, WORDS.length - 1)) : "var(--foreground-muted)"}
          opacity={revealed > i ? 0.55 : 0.22}
          className={styles.spot}
        />
      ))}

      {/* The lost sheep — hidden until found, then unmistakable. */}
      <g className={`${styles.sheep} ${found ? styles.sheepFound : ""}`}>
        <ellipse cx={SPOTS[SPOTS.length - 1]} cy="146" rx="14" ry="10" fill="#F2E9DC" />
        <circle cx={SPOTS[SPOTS.length - 1] + 12} cy="140" r="6" fill="#F2E9DC" />
        <circle cx={SPOTS[SPOTS.length - 1] + 14} cy="139" r="1.6" fill="var(--background)" />
        <path d={`M${SPOTS[SPOTS.length - 1] - 6} 156 L${SPOTS[SPOTS.length - 1] - 6} 164`}
          stroke="#F2E9DC" strokeWidth="3" strokeLinecap="round" />
        <path d={`M${SPOTS[SPOTS.length - 1] + 6} 156 L${SPOTS[SPOTS.length - 1] + 6} 164`}
          stroke="#F2E9DC" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* The shepherd. */}
      <g className={styles.shepherd} style={{ transform: `translateX(${shepherdX}px)` }}>
        <circle cx="0" cy="126" r="9" fill={paint(0)} />
        <path d="M0 135 L0 162" stroke={paint(0)} strokeWidth="5" strokeLinecap="round" />
        <path d="M0 142 L-11 152 M0 142 L11 150" stroke={paint(0)} strokeWidth="4" strokeLinecap="round" />
        {/* crook */}
        <path d="M14 118 L14 164 M14 118 Q22 114 22 122" fill="none" stroke={paint(0)} strokeWidth="3"
          strokeLinecap="round" opacity="0.8" />
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

export function FindTheSheepGame({ unlockedChars, shiftUnlocked, errorHandling, onComplete }: Props) {
  const { t } = useI18n();
  return (
    <WordSceneGame
      words={WORDS}
      instruction={t("games.day5FindTheSheep.instruction")}
      unlockedChars={unlockedChars}
      shiftUnlocked={shiftUnlocked}
      errorHandling={errorHandling}
      renderScene={(props) => <SheepScene {...props} />}
      onComplete={onComplete}
    />
  );
}
