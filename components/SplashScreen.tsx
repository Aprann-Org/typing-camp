"use client";

import { useEffect, useRef } from "react";
import { BrandMark } from "@/components/BrandMark";
import { useI18n } from "@/context/I18nContext";
import { useAppSettings } from "@/context/AppSettingsContext";
import styles from "./SplashScreen.module.css";

type SplashScreenProps = {
  onDismiss: () => void;
};

const HOLD_MS = 2200;

/**
 * Cold-boot screen. Two jobs: put Aprann's name on the app, and cover the
 * first paint on the slow classroom laptops — the cover art is the largest
 * asset in the precache, so showing it deliberately beats it popping in
 * behind the start screen.
 *
 * Dismisses on a timer, or immediately on any key or tap. The timer is
 * skipped entirely in calm mode: a child who needs calm mode does not need
 * a two-second animated hold before they can start.
 */
export function SplashScreen({ onDismiss }: SplashScreenProps) {
  const { t } = useI18n();
  const { calmMode } = useAppSettings();
  // onDismiss is called from listeners set up once; keep it in a ref so a
  // new parent closure never re-registers them mid-animation.
  const dismissRef = useRef(onDismiss);
  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const fire = () => dismissRef.current();
    const timer = setTimeout(fire, calmMode ? 400 : HOLD_MS);
    window.addEventListener("keydown", fire);
    window.addEventListener("pointerdown", fire);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", fire);
      window.removeEventListener("pointerdown", fire);
    };
  }, [calmMode]);

  return (
    <div className={styles.wrap} role="presentation">
      <div className={styles.art} aria-hidden="true" />
      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.content}>
        <div className={styles.logo}>
          <BrandMark size={54} withWordmark />
        </div>
        <h1 className={styles.title}>{t("startScreen.title")}</h1>
        <p className={styles.tagline}>{t("splash.tagline")}</p>
        <p className={styles.hint}>{t("splash.skipHint")}</p>
      </div>
    </div>
  );
}
