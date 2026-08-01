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
import { DEFAULT_LAYOUT, type LayoutId } from "@/content/layouts";
import { calculateWpm } from "./wpm";
import { playCompleteChime, playCorrectTone, playIncorrectTone } from "./sound";

type Action = { type: "key"; char: string } | { type: "backspace" } | { type: "reset"; target: string };

function makeReducer(locked: LockedKeyConfig, errorHandling: ErrorHandlingMode, layoutId: LayoutId) {
  return function reducer(state: TypingState, action: Action): TypingState {
    switch (action.type) {
      case "key":
        return processKeystroke(state, action.char, locked, errorHandling, layoutId);
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
  layoutId?: LayoutId;
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
  layoutId = DEFAULT_LAYOUT,
  soundEnabled = false,
  onComplete,
}: UseTypingSessionOptions) {
  const reducer = useMemo(
    () => makeReducer(locked, errorHandling, layoutId),
    [locked, errorHandling, layoutId]
  );
  const [state, dispatch] = useReducer(reducer, undefined, () => createTypingState(target, locked));
  const [wpm, setWpm] = useState(0);
  // Live modifier state. Presentation only — it drives the on-screen Shift
  // glow and the Caps Lock warning, and never reaches the pure engine (which
  // only ever knows about characters). Kept out of the reducer for the same
  // reason as wpm and comboRef below.
  const [modifiers, setModifiers] = useState({ shiftHeld: false, capsLock: false });
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

  // Bails out of the render when nothing actually changed (returning `prev`
  // from a setter is a no-op in React), so the common case — an ordinary
  // keystroke with no modifier transition — costs nothing. That matters here:
  // this runs in the same handler as the keystroke dispatch, which the 60ms
  // feedback flash depends on.
  const syncModifiers = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const shiftHeld = e.shiftKey;
    const capsLock = e.getModifierState("CapsLock");
    setModifiers((prev) =>
      prev.shiftHeld === shiftHeld && prev.capsLock === capsLock ? prev : { shiftHeld, capsLock }
    );
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      syncModifiers(e);
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
      // Shift itself (e.key === "Shift", length 5) falls through: the hold is
      // recorded above, and there is no character to dispatch.
    },
    [syncModifiers]
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => syncModifiers(e),
    [syncModifiers]
  );

  // A Shift keyup lost to a window switch (alt-tab while holding) would never
  // arrive, leaving the on-screen key stuck down.
  const handleBlur = useCallback(() => {
    setModifiers((prev) => (prev.shiftHeld ? { ...prev, shiftHeld: false } : prev));
  }, []);

  return {
    state,
    wpm,
    accuracy: calculateAccuracy(state),
    handleKeyDown,
    handleKeyUp,
    handleBlur,
    shiftHeld: modifiers.shiftHeld,
    capsLock: modifiers.capsLock,
    inputRef,
  };
}
