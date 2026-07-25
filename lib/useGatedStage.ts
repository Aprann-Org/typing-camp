"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { passesAccuracyGate, type StageTypingSummary } from "./typing-engine";

// Capped so a genuinely struggling child isn't stuck retrying forever in a
// 20-minute block — after this many retries, let the stage pass regardless
// and let the Report stage's honest "keys still warming up" framing carry
// the signal instead.
const MAX_RETRIES = 2;

const RETRY_ACKNOWLEDGE_MS = 1600;

/**
 * Shared accuracy-gate + retry policy for New Keys / Word Build / Theme
 * Challenge (Builder 85%, Flyer 95%, Starter has no gate). On a miss,
 * shows a brief acknowledgment, then increments `attempt` so the calling
 * stage regenerates/replays its content queue. Only the FINAL (passing, or
 * final-after-cap) attempt's summary is ever reported upward — a failed
 * attempt's stats don't get merged into the session total, since that
 * would unfairly tank the score for a child who then went on to pass.
 */
export function useGatedStage(accuracyGate: number | null, onPass: (summary: StageTypingSummary) => void) {
  const [attempt, setAttempt] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onPassRef = useRef(onPass);
  onPassRef.current = onPass;

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const submitAttempt = useCallback(
    (summary: StageTypingSummary) => {
      if (passesAccuracyGate(summary, accuracyGate) || attempt >= MAX_RETRIES) {
        onPassRef.current(summary);
        return;
      }
      setRetrying(true);
      timerRef.current = setTimeout(() => {
        setRetrying(false);
        setAttempt((a) => a + 1);
      }, RETRY_ACKNOWLEDGE_MS);
    },
    [accuracyGate, attempt]
  );

  return { attempt, retrying, submitAttempt };
}
