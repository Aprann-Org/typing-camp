"use client";

import { useTypingSession } from "@/lib/useTypingSession";
import { TypingSlots } from "./TypingSlots";
import { Keyboard } from "./Keyboard";
import { HandMap } from "./HandMap";
import { getFingerForChar, DEFAULT_LAYOUT, type LayoutId } from "@/content/layouts";
import { useI18n } from "@/context/I18nContext";
import { useAppSettings } from "@/context/AppSettingsContext";
import type { ErrorHandlingMode, FingerHintMode } from "@/content/levels";
import { summarizeTypingState, type LockedKeyConfig, type StageTypingSummary, type TypingState } from "@/lib/typing-engine";

type TypingItemProps = {
  target: string;
  locked: LockedKeyConfig;
  unlockedChars: ReadonlySet<string>;
  errorHandling: ErrorHandlingMode;
  fingerHint: FingerHintMode;
  layoutId?: LayoutId;
  justUnlockedChars?: ReadonlySet<string>;
  showKeyboard?: boolean;
  onComplete: (summary: StageTypingSummary, state: TypingState) => void;
};

/**
 * One typing target (a drill pattern, a word, a phrase) wired to the
 * engine: renders the slots, the on-screen keyboard, and — depending on
 * the level's fingerHint setting — the hand map showing which finger to
 * use next. Reusable across New Keys / Word Build / Theme Challenge; give
 * this component a fresh `key` at the call site to reset between items.
 */
export function TypingItem({
  target,
  locked,
  unlockedChars,
  errorHandling,
  fingerHint,
  layoutId = DEFAULT_LAYOUT,
  justUnlockedChars,
  showKeyboard = true,
  onComplete,
}: TypingItemProps) {
  const { t } = useI18n();
  const { soundEnabled } = useAppSettings();
  const { state, handleKeyDown, inputRef } = useTypingSession({
    target,
    locked,
    errorHandling,
    soundEnabled,
    onComplete: (finalState) => onComplete(summarizeTypingState(finalState), finalState),
  });

  const currentChar = !state.finished ? state.slots[state.index]?.char : undefined;
  const currentFinger = currentChar !== undefined ? getFingerForChar(currentChar, layoutId) : null;
  const isHelperChar = currentChar !== undefined && locked.guidedTyped.has(currentChar);
  // Helper keys always show the finger — the child has never been taught
  // this key, so withholding the hint (Flyer's "off" setting) would just be
  // a guessing game rather than practice.
  const showHint =
    currentFinger != null &&
    (isHelperChar || fingerHint === "always" || (fingerHint === "after-miss" && state.lastMiss !== null));

  return (
    <div className="flex flex-col items-center gap-6">
      <TypingSlots state={state} inputRef={inputRef} onKeyDown={handleKeyDown} layoutId={layoutId} />
      {showHint && currentFinger && <HandMap activeFinger={currentFinger} activeLabel={t(`fingerNames.${currentFinger}`)} />}
      {showKeyboard && (
        <Keyboard
          unlockedChars={unlockedChars}
          nextChar={currentChar ?? null}
          justUnlockedChars={justUnlockedChars}
          helperChars={locked.guidedTyped}
          layoutId={layoutId}
          missChar={state.lastMiss}
          missEventId={state.missEventId}
        />
      )}
    </div>
  );
}
