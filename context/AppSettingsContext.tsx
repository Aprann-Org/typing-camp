"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Language, Profile } from "@/lib/types";
import { getDeviceSettings, setDeviceSettings as persistDeviceSettings, updateProfile } from "@/lib/storage";

type AppSettingsContextValue = {
  activeProfile: Profile | null;
  setActiveProfile: (profile: Profile | null) => void;
  /** Active profile's language, or a pending default before a profile exists. */
  language: Language;
  setLanguage: (lang: Language) => void;
  /** Device-level, teacher-facing: reduces motion and mutes sound regardless of profile. */
  calmMode: boolean;
  setCalmMode: (value: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (value: boolean) => void;
};

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(null);
  // Carrefour and Caradeux sessions run in Kreyòl — that's the default a
  // fresh start screen should show, not English.
  const [pendingLanguage, setPendingLanguage] = useState<Language>("ht");
  const [calmMode, setCalmModeState] = useState(false);

  useEffect(() => {
    // getDeviceSettings() reads localStorage, which doesn't exist on the
    // server — this can only run after mount, in an effect, not during
    // render (a render-time read here is exactly the class of bug that
    // produces a hydration mismatch, since the server has no localStorage
    // to read).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCalmModeState(getDeviceSettings().calmMode);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.calmMode = calmMode ? "true" : "false";
  }, [calmMode]);

  const language = activeProfile?.language ?? pendingLanguage;

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setActiveProfile = useCallback((profile: Profile | null) => {
    setActiveProfileState(profile);
  }, []);

  const setCalmMode = useCallback((value: boolean) => {
    setCalmModeState(value);
    persistDeviceSettings({ calmMode: value });
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setPendingLanguage(lang);
    setActiveProfileState((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, language: lang };
      updateProfile(updated);
      return updated;
    });
  }, []);

  const setSoundEnabled = useCallback((value: boolean) => {
    setActiveProfileState((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, soundEnabled: value };
      updateProfile(updated);
      return updated;
    });
  }, []);

  const value: AppSettingsContextValue = {
    activeProfile,
    setActiveProfile,
    language,
    setLanguage,
    calmMode,
    setCalmMode,
    soundEnabled: activeProfile?.soundEnabled ?? false,
    setSoundEnabled,
  };

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings(): AppSettingsContextValue {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error("useAppSettings must be used within AppSettingsProvider");
  return ctx;
}
