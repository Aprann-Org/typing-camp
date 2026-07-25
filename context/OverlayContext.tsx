"use client";

import { createContext, useContext, useEffect, useState, type RefObject } from "react";

/**
 * Tracks whether a blocking overlay (right now: the exit confirmation) is on
 * screen.
 *
 * This exists because of one hard constraint: every typing surface keeps a
 * hidden input permanently focused so a child's keystrokes can never land
 * anywhere but the drill — including refocusing itself on blur. That fight
 * for focus has to stop while a dialog is up, or the dialog's own buttons
 * can't hold focus and the child's keypresses keep scoring against a drill
 * they're in the middle of leaving. Any future modal must set this flag too.
 */

type OverlayContextValue = {
  overlayOpen: boolean;
  setOverlayOpen: (value: boolean) => void;
};

const OverlayContext = createContext<OverlayContextValue | null>(null);

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const [overlayOpen, setOverlayOpen] = useState(false);
  return <OverlayContext.Provider value={{ overlayOpen, setOverlayOpen }}>{children}</OverlayContext.Provider>;
}

export function useOverlay(): OverlayContextValue {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error("useOverlay must be used within OverlayProvider");
  return ctx;
}

/**
 * Props for a typing surface's hidden input: hold focus, but yield it while
 * an overlay is open and take it back the moment the overlay closes (nothing
 * else would — the dialog's button unmounts without ever blurring the input).
 *
 * Spread this instead of writing `onBlur={(e) => e.target.focus()}` by hand.
 */
export function useTypingInputFocus(inputRef: RefObject<HTMLInputElement | null>) {
  const { overlayOpen } = useOverlay();

  useEffect(() => {
    if (!overlayOpen) inputRef.current?.focus();
  }, [overlayOpen, inputRef]);

  return {
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      if (!overlayOpen) e.target.focus();
    },
  };
}
