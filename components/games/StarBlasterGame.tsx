"use client";

import { useState } from "react";
import { WordSceneGame, colorFor, type SceneRenderProps } from "./WordSceneGame";
import { pickLetterSequence } from "./bonusLetters";
import { useElapsedTimer } from "./useElapsedTimer";
import { GameTimer } from "./GameTimer";
import type { StageTypingSummary } from "@/lib/typing-engine";
import type { ErrorHandlingMode } from "@/content/levels";
import { useI18n } from "@/context/I18nContext";
import styles from "./StarBlasterGame.module.css";

// Bonus game — see bonusLetters.ts for the letter pool and NinjaFlightGame's
// doc for the shared "never loses" rule. A shooter is usually the genre most
// built around a fail state (dodge-or-die), so this one is deliberately a
// shooting GALLERY instead: every target is stationary and there's nothing
// incoming to dodge. A miss just doesn't pop the next star; it never costs
// a life, and there are none to lose.
const SEQUENCE_LENGTH = 10;
const MAX_COLS = 5;

function starPosition(i: number, total: number) {
  const cols = Math.min(MAX_COLS, total);
  const row = Math.floor(i / cols);
  const col = i % cols;
  const x = cols === 1 ? 150 : 30 + (col / (cols - 1)) * 240;
  const y = 44 + row * 46;
  return { x, y };
}

// Gold, not a finger color — same as the ninja's platforms and the maze's
// corridor: the environment stays in this app's one "done" accent, only the
// player's own avatar (the cannon, below) carries a finger color.
function Star({ x, y, popped }: { x: number; y: number; popped: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`} className={popped ? styles.popped : styles.intact}>
      <path
        d="M0 -10 L2.6 -3.2 L9.5 -3.1 L4 1.3 L6 8 L0 4 L-6 8 L-4 1.3 L-9.5 -3.1 L-2.6 -3.2 Z"
        fill="var(--accent-celebrate)"
      />
    </g>
  );
}

function BlasterScene({ revealed, total }: SceneRenderProps) {
  const stars = Array.from({ length: total }, (_, i) => starPosition(i, total));
  const lastHit = revealed > 0 ? stars[revealed - 1] : null;
  const cannonColor = colorFor(String.fromCharCode(97 + (revealed % 26)));

  return (
    <svg viewBox="0 0 300 200" role="img" aria-label="A cannon blasting stars out of the sky, one per letter">
      {stars.map((s, i) => (
        <Star key={i} x={s.x} y={s.y} popped={i < revealed} />
      ))}

      {/* A brief beam to whichever star was just hit — keyed by `revealed` so
          it re-fires (and re-fades) on every new hit, same retrigger trick
          NinjaFlightGame's hop and MazeGame's step use. */}
      {lastHit && (
        <line
          key={revealed}
          x1="150"
          y1="176"
          x2={lastHit.x}
          y2={lastHit.y}
          stroke={cannonColor}
          strokeWidth="3"
          strokeLinecap="round"
          className={styles.beam}
        />
      )}

      {/* The cannon — stationary; there's nothing to aim or dodge, only fire. */}
      <g transform="translate(150 176)">
        <rect x="-16" y="-4" width="32" height="16" rx="4" fill={cannonColor} />
        <rect x="-6" y="-20" width="12" height="20" rx="3" fill={cannonColor} />
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

export function StarBlasterGame({ unlockedChars, shiftUnlocked, errorHandling, onComplete }: Props) {
  const { t } = useI18n();
  // Lazy initializer — see NinjaFlightGame's identical comment on why
  // Math.random() belongs in a one-time useState initializer, not render.
  const [sequence] = useState(() => pickLetterSequence(SEQUENCE_LENGTH));
  const [finished, setFinished] = useState(false);
  const elapsedMs = useElapsedTimer(finished);

  return (
    <div className="flex flex-col items-center gap-3">
      <GameTimer elapsedMs={elapsedMs} />
      <WordSceneGame
        words={sequence}
        instruction={t("games.starBlaster.instruction")}
        unlockedChars={unlockedChars}
        shiftUnlocked={shiftUnlocked}
        errorHandling={errorHandling}
        // Fires the instant the last letter lands — see CarRaceGame's
        // identical comment for why this, not onComplete, is the real
        // finish moment (onComplete fires seconds later, after the
        // celebration hold).
        onProgress={(fraction) => {
          if (fraction >= 1) setFinished(true);
        }}
        renderScene={(props) => <BlasterScene {...props} />}
        onComplete={onComplete}
      />
    </div>
  );
}
