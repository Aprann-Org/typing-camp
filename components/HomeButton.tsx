"use client";

import { useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { useI18n } from "@/context/I18nContext";
import { useOverlay } from "@/context/OverlayContext";

type HomeButtonProps = {
  /** Omitted on the start screen — there is nowhere to go, so the mark is inert. */
  onExit?: () => void;
  /** Ask before leaving. False once the session's progress is already saved. */
  confirm?: boolean;
};

/**
 * The Aprann mark in the top corner of every screen, doubling as the way out
 * of a session. It's the only exit a child has mid-session (the stages
 * themselves are deliberately forward-only), so it stays in the same place on
 * every screen — including the start screen, where it's inert rather than
 * missing, so the corner never looks like it lost its logo.
 */
export function HomeButton({ onExit, confirm = false }: HomeButtonProps) {
  const { t } = useI18n();
  const { setOverlayOpen } = useOverlay();
  const [asking, setAsking] = useState(false);
  const stayRef = useRef<HTMLButtonElement>(null);

  // Leaving is the destructive answer, so "keep typing" takes the focus and
  // Escape resolves to staying.
  useEffect(() => {
    if (!asking) return;
    stayRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asking]);

  // Unmounting mid-dialog (a stage advancing underneath) must not leave the
  // typing inputs believing an overlay is still up.
  useEffect(() => {
    return () => setOverlayOpen(false);
  }, [setOverlayOpen]);

  // The overlay flag is set alongside `asking` in the handlers rather than
  // mirrored in an effect — both updates batch into the one render, so the
  // typing input never sees a frame where the dialog is up but focus is
  // still being fought over.
  function close() {
    setAsking(false);
    setOverlayOpen(false);
  }

  function handleClick() {
    if (!onExit) return;
    if (confirm) {
      setAsking(true);
      setOverlayOpen(true);
    } else {
      onExit();
    }
  }

  function leave() {
    close();
    onExit?.();
  }

  const mark = <BrandMark size={32} />;

  return (
    <>
      <div className="fixed left-4 top-4 z-40">
        {onExit ? (
          <button
            type="button"
            aria-label={t("home.label")}
            title={t("home.label")}
            onClick={handleClick}
            className="rounded-[10px] transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] active:scale-95"
          >
            {mark}
          </button>
        ) : (
          mark
        )}
      </div>

      {asking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="home-confirm-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-border-subtle bg-background-raised p-6 shadow-xl">
            <h2
              id="home-confirm-title"
              className="font-[family-name:var(--font-display)] text-xl text-foreground"
            >
              {t("home.confirmTitle")}
            </h2>
            <p className="font-[family-name:var(--font-ui)] text-sm text-foreground-muted">
              {t("home.confirmBody")}
            </p>
            <div className="flex flex-col gap-2">
              <button ref={stayRef} className="btn-primary px-6 py-3" onClick={close}>
                {t("home.confirmStay")}
              </button>
              <button className="btn-secondary px-6 py-2 text-sm" onClick={leave}>
                {t("home.confirmLeave")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
