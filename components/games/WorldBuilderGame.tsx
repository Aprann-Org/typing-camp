"use client";

import { WordSceneGame, colorFor, type SceneRenderProps } from "./WordSceneGame";
import type { StageTypingSummary } from "@/lib/typing-engine";
import type { ErrorHandlingMode } from "@/content/levels";
import { useI18n } from "@/context/I18nContext";
import styles from "./WordSceneGame.module.css";

// Day 3 — "Made to Create" (Genesis 1:1, 1:27). Mirrors the day's Scratch
// project, "Imagine a World."
//
// The mechanic IS the theology here, which is why this scene is the most
// literal of the four: the child types a word and that thing exists. Genesis
// 1 is God speaking and a world appearing; the child says it (by typing) and
// it appears. Nothing else needed to carry the lesson.
//
// Every word is fully typeable with Day 3's unlocked keys — no guided
// characters at all — so this is also the first game where the child builds
// something entirely under their own power.
//
// Word order is the order things appear; SVG document order below is
// back-to-front instead, so the scene layers correctly no matter what.
const WORDS = ["lalin", "nwaj", "pye", "kay", "dlo", "moun"];
const LALIN = 0;
const NWAJ = 1;
const PYE = 2;
const KAY = 3;
const DLO = 4;
const MOUN = 5;

function WorldScene({ revealed }: SceneRenderProps) {
  const shown = (i: number) => `${styles.part} ${revealed > i ? styles.partVisible : ""}`;
  const paint = (i: number) => colorFor(WORDS[i][0]);

  return (
    <svg viewBox="0 0 300 200" role="img" aria-label="A world appearing one word at a time">
      {/* Ground line is always there — the empty stage before anything is
          spoken, not part of what the child creates. */}
      <line x1="0" y1="168" x2="300" y2="168" stroke="var(--foreground-muted)" strokeWidth="2" opacity="0.3" />

      {/* lalin (moon) */}
      <g className={shown(LALIN)}>
        <circle cx="248" cy="42" r="18" fill={paint(LALIN)} />
        <circle cx="240" cy="36" r="15" fill="var(--background)" />
      </g>

      {/* nwaj (cloud) */}
      <g className={shown(NWAJ)}>
        <ellipse cx="72" cy="46" rx="26" ry="13" fill={paint(NWAJ)} opacity="0.85" />
        <ellipse cx="94" cy="50" rx="18" ry="10" fill={paint(NWAJ)} opacity="0.85" />
      </g>

      {/* dlo (water) — behind the things standing on the shore */}
      <g className={shown(DLO)}>
        <path
          d="M0 168 Q30 160 60 168 Q90 176 120 168 L120 200 L0 200 Z"
          fill={paint(DLO)}
          opacity="0.75"
        />
      </g>

      {/* pye (tree) */}
      <g className={shown(PYE)}>
        <rect x="196" y="128" width="7" height="40" fill={paint(PYE)} opacity="0.75" />
        <circle cx="199" cy="120" r="22" fill={paint(PYE)} />
      </g>

      {/* kay (house) */}
      <g className={shown(KAY)}>
        <rect x="130" y="130" width="46" height="38" fill={paint(KAY)} opacity="0.9" />
        <path d="M124 130 L153 106 L182 130 Z" fill={paint(KAY)} />
        <rect x="146" y="146" width="14" height="22" fill="var(--background)" opacity="0.55" />
      </g>

      {/* moun (person) — stands on dry ground to the right of the tree. The
          water occupies x 0-120, so the obvious left-hand spot would put the
          child's person up to their waist in it. */}
      <g className={shown(MOUN)}>
        <circle cx="252" cy="138" r="8" fill={paint(MOUN)} />
        <path d="M252 146 L252 164" stroke={paint(MOUN)} strokeWidth="4.5" strokeLinecap="round" />
        <path d="M252 152 L242 160 M252 152 L262 160" stroke={paint(MOUN)} strokeWidth="4" strokeLinecap="round" />
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

export function WorldBuilderGame({ unlockedChars, shiftUnlocked, errorHandling, onComplete }: Props) {
  const { t } = useI18n();
  return (
    <WordSceneGame
      words={WORDS}
      instruction={t("games.day3WorldBuilder.instruction")}
      unlockedChars={unlockedChars}
      shiftUnlocked={shiftUnlocked}
      errorHandling={errorHandling}
      renderScene={(props) => <WorldScene {...props} />}
      onComplete={onComplete}
    />
  );
}
