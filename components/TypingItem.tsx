"use client";

import { useTypingSession } from "@/lib/useTypingSession";
import { TypingSlots } from "./TypingSlots";
import { Keyboard } from "./Keyboard";
import { HandMap } from "./HandMap";
import { getFingerForChar, getShiftFingerForChar, requiresShift, DEFAULT_LAYOUT, type LayoutId } from "@/content/layouts";
import { useI18n } from "@/context/I18nContext";
import { useAppSettings } from "@/context/AppSettingsContext";
import type { ErrorHandlingMode, FingerHintMode } from "@/content/levels";
import { summarizeTypingState, type LockedKeyConfig, type StageTypingSummary, type TypingState } from "@/lib/typing-engine";

type TypingItemProps = {
  target: string;
  locked: LockedKeyConfig;
  unlockedChars: ReadonlySet<string>;
  /**
   * Required, not defaulted — same reasoning as `locked`. A stage that
   * silently defaults this to false draws a dormant Shift key on a day where
   * Shift has been taught, or vice versa.
   */
  shiftUnlocked: boolean;
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
  shiftUnlocked,
  errorHandling,
  fingerHint,
  layoutId = DEFAULT_LAYOUT,
  justUnlockedChars,
  showKeyboard = true,
  onComplete,
}: TypingItemProps) {
  const { t } = useI18n();
  const { soundEnabled } = useAppSettings();
  const { state, handleKeyDown, handleKeyUp, handleBlur, shiftHeld, capsLock, inputRef } = useTypingSession({
    target,
    locked,
    errorHandling,
    layoutId,
    soundEnabled,
    onComplete: (finalState) => onComplete(summarizeTypingState(finalState), finalState),
  });

  const currentChar = !state.finished ? state.slots[state.index]?.char : undefined;
  const currentFinger = currentChar !== undefined ? getFingerForChar(currentChar, layoutId) : null;
  // Non-null only when the next character is a shifted one, in which case it's
  // the pinky on the hand OPPOSITE the letter.
  const shiftFinger = currentChar !== undefined ? getShiftFingerForChar(currentChar, layoutId) : null;
  const isHelperChar = currentChar !== undefined && locked.guidedTyped.has(currentChar);
  // Helper keys always show the finger — the child has never been taught
  // this key, so withholding the hint (Flyer's "off" setting) would just be
  // a guessing game rather than practice. An untaught Shift chord is the same
  // situation for the same reason: two keys at once is not discoverable.
  const showHint =
    currentFinger != null &&
    (isHelperChar ||
      (shiftFinger !== null && !shiftUnlocked) ||
      fingerHint === "always" ||
      (fingerHint === "after-miss" && state.lastMiss !== null));

  // Which way the Shift mistake went. The engine records only that the
  // physical key was right and the Shift state wrong; the direction follows
  // from whether the expected character wanted Shift in the first place.
  const shiftNudge =
    state.lastMissKind === "shift"
      ? state.lastMiss !== null && requiresShift(state.lastMiss, layoutId)
        ? t("typing.shiftMissNudge")
        : t("typing.shiftReleaseNudge")
      : null;

  return (
    <div className="flex flex-col items-center gap-6">
      <TypingSlots
        state={state}
        inputRef={inputRef}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onBlur={handleBlur}
        layoutId={layoutId}
      />
      {showHint && currentFinger && (
        <HandMap
          activeFinger={currentFinger}
          holdFinger={shiftFinger}
          activeLabel={
            shiftFinger !== null && currentChar !== undefined
              ? t("typing.shiftHint", { finger: t(`fingerNames.${shiftFinger}`), char: currentChar })
              : t(`fingerNames.${currentFinger}`)
          }
        />
      )}
      {shiftNudge && (
        <p className="font-[family-name:var(--font-ui)] text-sm text-foreground" role="status">
          {shiftNudge}
        </p>
      )}
      {capsLock && (
        <p className="font-[family-name:var(--font-ui)] text-sm text-foreground-muted" role="status">
          {t("typing.capsLockWarning")}
        </p>
      )}
      {showKeyboard && (
        <Keyboard
          unlockedChars={unlockedChars}
          nextChar={currentChar ?? null}
          justUnlockedChars={justUnlockedChars}
          helperChars={locked.guidedTyped}
          layoutId={layoutId}
          missChar={state.lastMiss}
          missEventId={state.missEventId}
          missKind={state.lastMissKind}
          shiftUnlocked={shiftUnlocked}
          shiftFinger={shiftFinger}
          shiftHeld={shiftHeld}
        />
      )}
    </div>
  );
}
