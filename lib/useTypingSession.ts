"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  calculateAccuracy,
  createTypingState,
  processBackspace,
  processKeystroke,
  type LockedKeyConfig,
  type TypingState,
} from "./typing-engine";
import type { ErrorHandlingMode } from "@/content/levels";
import { calculateWpm } from "./wpm";
import { playCompleteChime, playCorrectTone, playIncorrectTone } from "./sound";

type Action = { type: "key"; char: string } | { type: "backspace" } | { type: "reset"; target: string };

function makeReducer(locked: LockedKeyConfig, errorHandling: ErrorHandlingMode) {
  return function reducer(state: TypingState, action: Action): TypingState {
    switch (action.type) {
      case "key":
        return processKeystroke(state, action.char, locked, errorHandling);
      case "backspace":
        return processBackspace(state);
      case "reset":
        return createTypingState(action.target, locked);
    }
  };
}

export type UseTypingSessionOptions = {
  target: string;
  /**
   * Required, not defaulted — every stage must decide explicitly whether
   * locked characters are pre-filled (Verse Builder) or typed-but-unscored
   * (guided mode). Defaulting this is how a stage whose target is mostly
   * locked ends up completing itself with zero keystrokes.
   */
  locked: LockedKeyConfig;
  errorHandling: ErrorHandlingMode;
  soundEnabled?: boolean;
  onComplete?: (state: TypingState) => void;
};

/**
 * Drives one typing target through the pure engine. Keystroke-critical
 * state lives in its own useReducer here, isolated from WPM (sampled off a
 * low-frequency timer, never recomputed inside the dispatch path) so the
 * 60ms keystroke feedback flash never waits on anything else — see the
 * project plan's perf notes.
 */
export function useTypingSession({
  target,
  locked,
  errorHandling,
  soundEnabled = false,
  onComplete,
}: UseTypingSessionOptions) {
  const reducer = useMemo(() => makeReducer(locked, errorHandling), [locked, errorHandling]);
  const [state, dispatch] = useReducer(reducer, undefined, () => createTypingState(target, locked));
  const [wpm, setWpm] = useState(0);
  const completedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const onCompleteRef = useRef(onComplete);
  const soundEnabledRef = useRef(soundEnabled);
  const eventIdsRef = useRef({ correct: 0, miss: 0 });
  // Consecutive-correct counter feeding the pitch ladder in sound.ts. Lives
  // here (not in the pure engine) since it's a presentation detail, not
  // scoring — resets on any miss or on a fresh target.
  const comboRef = useRef(0);

  // Refs are written here (never read during render), in an effect that
  // runs after every commit — this is what keeps onComplete/soundEnabled
  // fresh for the effects below without adding them as dependencies, without
  // the "write a ref during render" anti-pattern a plain body assignment
  // would be. Declared first so the effects below always see this render's
  // values (same-commit effects run in declaration order).
  useEffect(() => {
    onCompleteRef.current = onComplete;
    soundEnabledRef.current = soundEnabled;
  });

  // Resetting on a genuinely new target, but not on a mid-target
  // locked/errorHandling change — compared during render via a piece of
  // state (React's own "adjusting state when a prop changes" pattern)
  // rather than via an effect, so the reset lands in the same commit as the
  // target change instead of flashing the old target's finished state for
  // one extra render. Deliberately state, not a ref: refs can't be read or
  // written during render at all (see the ref-only effect below for the
  // parts of this reset that genuinely are refs).
  const [prevTarget, setPrevTarget] = useState(target);
  if (prevTarget !== target) {
    setPrevTarget(target);
    dispatch({ type: "reset", target });
    setWpm(0);
  }

  // The ref-held half of the same reset. Refs may only be touched in an
  // effect/handler, never during render, so this can't join the block
  // above — but it's still keyed on the same `target` change. Without
  // zeroing eventIdsRef here, the first keystroke on a genuinely new target
  // would compare against the previous target's leftover (higher) event
  // ids and silently fail to register as "new," muting the combo/sound
  // feedback until the count caught back up.
  useEffect(() => {
    completedRef.current = false;
    eventIdsRef.current = { correct: 0, miss: 0 };
    comboRef.current = 0;
  }, [target]);

  useEffect(() => {
    const missed = state.missEventId > eventIdsRef.current.miss;
    const correct = state.correctEventId > eventIdsRef.current.correct;
    if (missed) comboRef.current = 0;
    else if (correct) comboRef.current += 1;
    if (soundEnabledRef.current) {
      if (correct) playCorrectTone(comboRef.current - 1);
      if (missed) playIncorrectTone();
    }
    eventIdsRef.current = { correct: state.correctEventId, miss: state.missEventId };
  }, [state.correctEventId, state.missEventId]);

  useEffect(() => {
    if (state.finished && !completedRef.current) {
      completedRef.current = true;
      if (soundEnabledRef.current) playCompleteChime();
      onCompleteRef.current?.(state);
    }
  }, [state]);

  useEffect(() => {
    if (!state.startedAt || state.finished) return;
    const startedAt = state.startedAt;
    const id = setInterval(() => {
      setWpm(calculateWpm(state.correctCount, startedAt, Date.now()));
    }, 500);
    return () => clearInterval(id);
  }, [state.startedAt, state.finished, state.correctCount]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Backspace") {
      dispatch({ type: "backspace" });
      e.preventDefault();
      return;
    }
    if (e.key.length === 1) {
      dispatch({ type: "key", char: e.key });
      e.preventDefault();
    }
  }, []);

  return { state, wpm, accuracy: calculateAccuracy(state), handleKeyDown, inputRef };
}
