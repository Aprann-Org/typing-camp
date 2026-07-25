"use client";

import { WordSceneGame, colorFor, type SceneRenderProps } from "./WordSceneGame";
import type { StageTypingSummary } from "@/lib/typing-engine";
import type { ErrorHandlingMode } from "@/content/levels";
import { useI18n } from "@/context/I18nContext";
import styles from "./WordSceneGame.module.css";

// Day 2 — "Wonderfully Made" (Psalm 139:13-14). Mirrors the day's Scratch
// project, "Animate a Character."
//
// Each word NAMES the part it adds, so the connection is immediate for a
// child who reads little: type "je" and eyes appear. The figure starts as a
// bare outline and finishes complete — the object lesson is that every
// detail arrived on purpose, one deliberate choice at a time, which is the
// pastoral doc's "He designed them with intention."
//
// Order builds face -> body -> limbs so the drawing never looks broken
// mid-way (limbs before a torso reads as a mistake, not a work in progress).
const WORDS = ["je", "bouch", "cheve", "rad", "men", "pye"];

function CharacterScene({ revealed }: SceneRenderProps) {
  const shown = (i: number) => `${styles.part} ${revealed > i ? styles.partVisible : ""}`;
  const paint = (i: number) => colorFor(WORDS[i][0]);

  return (
    <svg viewBox="0 0 300 200" role="img" aria-label="A character being built piece by piece">
      {/* Always-present outline, so the child is adding to someone rather
          than conjuring them from nothing. */}
      <circle cx="150" cy="62" r="30" fill="none" stroke="var(--foreground-muted)" strokeWidth="2" opacity="0.35" />

      {/* rad (clothes / torso) — drawn before the limbs it anchors */}
      <g className={shown(3)}>
        <path d="M126 96 L174 96 L182 152 L118 152 Z" fill={paint(3)} opacity="0.9" />
      </g>

      {/* cheve (hair) */}
      <g className={shown(2)}>
        <path d="M120 50 Q150 18 180 50 Q150 36 120 50 Z" fill={paint(2)} />
      </g>

      {/* je (eyes) */}
      <g className={shown(0)}>
        <circle cx="139" cy="58" r="4.5" fill={paint(0)} />
        <circle cx="161" cy="58" r="4.5" fill={paint(0)} />
      </g>

      {/* bouch (mouth) */}
      <g className={shown(1)}>
        <path d="M138 74 Q150 84 162 74" fill="none" stroke={paint(1)} strokeWidth="3.5" strokeLinecap="round" />
      </g>

      {/* men (hands / arms) */}
      <g className={shown(4)}>
        <path d="M126 104 L98 128" stroke={paint(4)} strokeWidth="5" strokeLinecap="round" />
        <path d="M174 104 L202 128" stroke={paint(4)} strokeWidth="5" strokeLinecap="round" />
        <circle cx="95" cy="132" r="6" fill={paint(4)} />
        <circle cx="205" cy="132" r="6" fill={paint(4)} />
      </g>

      {/* pye (feet / legs) */}
      <g className={shown(5)}>
        <path d="M136 152 L132 182" stroke={paint(5)} strokeWidth="5" strokeLinecap="round" />
        <path d="M164 152 L168 182" stroke={paint(5)} strokeWidth="5" strokeLinecap="round" />
        <path d="M132 182 L120 182" stroke={paint(5)} strokeWidth="5" strokeLinecap="round" />
        <path d="M168 182 L180 182" stroke={paint(5)} strokeWidth="5" strokeLinecap="round" />
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

export function CharacterBuilderGame({ unlockedChars, shiftUnlocked, errorHandling, onComplete }: Props) {
  const { t } = useI18n();
  return (
    <WordSceneGame
      words={WORDS}
      instruction={t("games.day2CharacterBuilder.instruction")}
      unlockedChars={unlockedChars}
      shiftUnlocked={shiftUnlocked}
      errorHandling={errorHandling}
      renderScene={(props) => <CharacterScene {...props} />}
      onComplete={onComplete}
    />
  );
}
