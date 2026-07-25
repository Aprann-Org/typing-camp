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
  onCompleteRef.current = onComplete;
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;
  const eventIdsRef = useRef({ correct: 0, miss: 0 });

  useEffect(() => {
    dispatch({ type: "reset", target });
    completedRef.current = false;
    setWpm(0);
    eventIdsRef.current = { correct: 0, miss: 0 };
    // locked/errorHandling intentionally excluded: a mid-target level
    // change shouldn't reset progress, only a genuinely new target should.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  useEffect(() => {
    if (!soundEnabledRef.current) {
      eventIdsRef.current = { correct: state.correctEventId, miss: state.missEventId };
      return;
    }
    if (state.correctEventId > eventIdsRef.current.correct) playCorrectTone();
    if (state.missEventId > eventIdsRef.current.miss) playIncorrectTone();
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
