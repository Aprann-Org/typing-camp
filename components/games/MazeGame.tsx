"use client";

import { useState } from "react";
import { WordSceneGame, colorFor, type SceneRenderProps } from "./WordSceneGame";
import { pickLetterSequence } from "./bonusLetters";
import { useElapsedTimer } from "./useElapsedTimer";
import { GameTimer } from "./GameTimer";
import type { StageTypingSummary } from "@/lib/typing-engine";
import type { ErrorHandlingMode } from "@/content/levels";
import { useI18n } from "@/context/I18nContext";
import styles from "./MazeGame.module.css";

// Bonus game — see bonusLetters.ts for the letter pool and NinjaFlightGame's
// doc for the shared "never loses" rule this app's games all follow: a miss
// just doesn't advance the explorer along the corridor, it never sends them
// backward or ends the round.
const SEQUENCE_LENGTH = 10;

const ROW_Y = [60, 150];

/** Waypoint for step `i` of `total`, snaking left-right-left across two rows. */
function waypoint(i: number, total: number) {
  const cols = Math.max(1, Math.ceil(total / 2));
  const row = Math.floor(i / cols) % 2;
  const posInRow = i % cols;
  const col = row === 0 ? posInRow : cols - 1 - posInRow;
  const x = cols === 1 ? 150 : 30 + (col / (cols - 1)) * 240;
  return { x, y: ROW_Y[row] };
}

type MazeSceneProps = SceneRenderProps & { sequence: string[] };

function MazeScene({ revealed, total, sequence }: MazeSceneProps) {
  const points = Array.from({ length: total }, (_, i) => waypoint(i, total));
  const current = points[Math.min(revealed, points.length - 1)] ?? { x: 30, y: ROW_Y[0] };
  const currentLetter = sequence[Math.min(revealed, sequence.length - 1)] ?? "a";
  const explorerColor = colorFor(currentLetter);

  const toPolyline = (pts: { x: number; y: number }[]) => pts.map((p) => `${p.x},${p.y}`).join(" ");
  const traveled = points.slice(0, Math.max(1, revealed + 1));

  return (
    <svg viewBox="0 0 300 200" role="img" aria-label="An explorer moving through a maze corridor toward the exit door">
      {/* The full corridor, drawn once — walls don't move, only how much of
          the path has been walked does. */}
      {points.length > 1 && (
        <polyline
          points={toPolyline(points)}
          fill="none"
          stroke="var(--background-raised)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* The traveled portion, overlaid in the same accent every other bonus
          game uses for "done so far" (see NinjaFlightGame). */}
      {traveled.length > 1 && (
        <polyline
          points={toPolyline(traveled)}
          fill="none"
          stroke="var(--accent-celebrate)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
      )}

      {/* Exit door at the final waypoint. */}
      {points.length > 0 && (
        <g transform={`translate(${points[points.length - 1].x} ${points[points.length - 1].y})`}>
          <rect
            x="-11"
            y="-26"
            width="22"
            height="34"
            rx="4"
            fill={revealed >= total ? "var(--accent-celebrate)" : "var(--background)"}
            stroke="var(--foreground-muted)"
            strokeWidth="2"
          />
        </g>
      )}

      {/* The explorer: outer group owns the 2D position (transitioned as the
          waypoint changes), inner group owns a step-bounce keyed by
          `revealed` so it re-fires every step — see NinjaFlightGame's
          identical two-group split for why a single element can't own both
          a position transition and a keyframe at once. */}
      <g className={styles.explorerTrack} style={{ transform: `translate(${current.x}px, ${current.y}px)` }}>
        <g key={revealed} className={styles.explorer}>
          <rect x="-11" y="-11" width="22" height="22" rx="6" fill={explorerColor} />
          <circle cx="-4" cy="-2" r="2.5" fill="var(--background)" />
          <circle cx="4" cy="-2" r="2.5" fill="var(--background)" />
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

export function MazeGame({ unlockedChars, shiftUnlocked, errorHandling, onComplete }: Props) {
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
        instruction={t("games.mazeRunner.instruction")}
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
        renderScene={(props) => <MazeScene {...props} sequence={sequence} />}
        onComplete={onComplete}
      />
    </div>
  );
}
