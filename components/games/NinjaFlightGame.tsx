"use client";

import { useState } from "react";
import { WordSceneGame, colorFor, type SceneRenderProps } from "./WordSceneGame";
import { pickLetterSequence } from "./bonusLetters";
import { useElapsedTimer } from "./useElapsedTimer";
import { GameTimer } from "./GameTimer";
import type { StageTypingSummary } from "@/lib/typing-engine";
import type { ErrorHandlingMode } from "@/content/levels";
import { useI18n } from "@/context/I18nContext";
import styles from "./NinjaFlightGame.module.css";

// A bonus game, not tied to any day's curriculum theme — see PlayScreen,
// which offers it once at least one day is done, and bonusLetters.ts for why
// its letter pool is the full alphabet rather than just what's unlocked so far.
//
// THE NINJA NEVER FALLS. Same rule as Day 4's eagle (see SoarGame's own
// comment) — a miss just doesn't advance the ninja; it never knocks them
// backward or ends the round. This app has no failure/lose state anywhere,
// on purpose, and a game that can be "lost" would be a first.
//
// Letters, not words: WordSceneGame's `words` are just typing targets, and
// nothing requires them to be more than one character — so a run of single
// letters drives the ninja one hop per letter, the same way a word drives
// one piece of a picture in the other games.
const SEQUENCE_LENGTH = 10;

function NinjaScene({ revealed, total }: SceneRenderProps) {
  const progress = total === 0 ? 0 : revealed / total;
  const ninjaX = 24 + progress * 250;
  const ninjaColor = colorFor(String.fromCharCode(97 + (revealed % 26)));

  return (
    <svg viewBox="0 0 300 160" role="img" aria-label="A ninja hopping across platforms toward a goal flag">
      {/* Ground line the platforms sit just above. */}
      <line x1="0" y1="140" x2="300" y2="140" stroke="var(--foreground-muted)" strokeWidth="2" opacity="0.2" />

      {/* One platform per letter, evenly spaced — filled once the ninja has
          landed on it, so progress reads left to right like the path itself. */}
      {Array.from({ length: total }, (_, i) => {
        const x = 20 + (i / Math.max(1, total - 1)) * 250;
        const landed = i < revealed;
        return (
          <rect
            key={i}
            x={x - 12}
            y={128}
            width={24}
            height={10}
            rx={3}
            fill={landed ? "var(--accent-celebrate)" : "var(--background-raised)"}
            opacity={landed ? 0.9 : 0.6}
          />
        );
      })}

      {/* Goal flag at the end of the path. */}
      <g transform="translate(276 90)">
        <line x1="0" y1="0" x2="0" y2="50" stroke="var(--foreground-muted)" strokeWidth="2" />
        <path d="M0 2 L16 8 L0 14 Z" fill={total > 0 && revealed >= total ? "var(--accent-celebrate)" : "var(--foreground-muted)"} />
      </g>

      {/* The ninja: an outer group owning the horizontal position (transitioned
          as ninjaX changes) and an inner group owning the hop, keyed by
          `revealed` so the hop animation re-fires on every landed letter —
          same trick TypingSlots uses to re-trigger its shake, a class toggle
          alone wouldn't replay the same animation twice in a row. */}
      <g className={styles.ninjaTrack} style={{ transform: `translateX(${ninjaX}px)` }}>
        <g key={revealed} className={styles.ninja}>
          <circle cx="0" cy="108" r="11" fill={ninjaColor} />
          <path d="M-11 104 Q0 96 11 104 L11 108 Q0 100 -11 108 Z" fill="var(--background)" />
          <rect x="-7" y="112" width="14" height="16" rx="4" fill="var(--background)" />
        </g>
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

export function NinjaFlightGame({ unlockedChars, shiftUnlocked, errorHandling, onComplete }: Props) {
  const { t } = useI18n();
  // Lazy initializer: Math.random() can't run during render proper (it would
  // differ on every re-render), but a one-time value computed exactly once
  // at mount — the same exception Date.now() gets elsewhere in this app — is
  // the sanctioned way to seed a fresh round.
  const [sequence] = useState(() => pickLetterSequence(SEQUENCE_LENGTH));
  const [finished, setFinished] = useState(false);
  const elapsedMs = useElapsedTimer(finished);

  return (
    <div className="flex flex-col items-center gap-3">
      <GameTimer elapsedMs={elapsedMs} />
      <WordSceneGame
        words={sequence}
        instruction={t("games.ninjaFlight.instruction")}
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
        renderScene={(props) => <NinjaScene {...props} />}
        onComplete={onComplete}
      />
    </div>
  );
}
