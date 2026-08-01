"use client";

import { useState } from "react";
import type { DayNumber, Profile } from "@/lib/types";
import { LEVEL_ORDER, DEFAULT_LEVEL, type LevelId } from "@/content/levels";
import { getAvailableDays } from "@/content/days";
import { createProfile } from "@/lib/storage";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useI18n } from "@/context/I18nContext";
import { Mascot } from "@/components/Mascot";
import { DayPath } from "@/components/DayPath";
import { LevelIcon } from "@/components/LevelIcon";
import { NameLivePreview } from "@/components/NameLivePreview";
import styles from "./StartScreen.module.css";

// Every sitting is its own fresh profile — no lookup, no "is this you?", no
// resuming. Children aren't guaranteed the same laptop two days running (and
// storage is per-machine), so continuity was unreliable by construction and
// the parts of the UI that promised it were misreporting for most children.
// See docs/profile-recovery-plan.md.
type Step = "enterName" | "pickSession";

type StartScreenProps = {
  onStart: (profile: Profile, day: DayNumber, level: LevelId) => void;
  onPlay: (profile: Profile) => void;
};

export function StartScreen({ onStart, onPlay }: StartScreenProps) {
  const { t } = useI18n();
  const { language, setLanguage, setActiveProfile } = useAppSettings();
  const [step, setStep] = useState<Step>("enterName");
  const [nameInput, setNameInput] = useState("");
  const [resolvedProfile, setResolvedProfile] = useState<Profile | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayNumber>(1);
  const [selectedLevel, setSelectedLevel] = useState<LevelId>(DEFAULT_LEVEL);
  const [error, setError] = useState<string | null>(null);

  const availableDays = getAvailableDays(language);

  function selectProfile(profile: Profile) {
    setActiveProfile(profile);
    setResolvedProfile(profile);
    setSelectedLevel(profile.lastLevel);
    setStep("pickSession");
  }

  function handleSubmitName() {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setError(t("startScreen.nameRequired"));
      return;
    }
    setError(null);
    selectProfile(createProfile(trimmed, language));
  }

  if (step === "pickSession" && resolvedProfile) {
    return (
      <ScreenShell language={language} setLanguage={setLanguage} t={t}>
        <div className="flex w-full max-w-md flex-col items-center gap-8">
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-foreground text-center">
            {resolvedProfile.firstName}
          </h1>

          <div className="flex w-full flex-col items-center gap-3">
            <span className="font-[family-name:var(--font-ui)] text-foreground-muted">{t("startScreen.dayLabel")}</span>
            <DayPath
              availableDays={availableDays}
              selectedDay={selectedDay}
              onSelect={setSelectedDay}
              dayLabel={(day) => t("startScreen.dayOption", { day })}
              comingSoonLabel={t("startScreen.dayComingSoon")}
            />
          </div>

          <div className="flex w-full flex-col items-center gap-3">
            <span className="font-[family-name:var(--font-ui)] text-foreground-muted">{t("startScreen.levelLabel")}</span>
            <div className="flex flex-wrap justify-center gap-2">
              {LEVEL_ORDER.map((levelId) => (
                <button
                  key={levelId}
                  className={`flex flex-col items-center rounded-2xl px-4 py-3 font-[family-name:var(--font-ui)] transition-colors ${
                    selectedLevel === levelId ? "chip-selected !rounded-2xl" : "btn-secondary !rounded-2xl"
                  }`}
                  onClick={() => setSelectedLevel(levelId)}
                >
                  <span className="flex items-center gap-1.5 font-semibold">
                    <LevelIcon level={levelId} />
                    {t(`levels.${levelId}.name`)}
                  </span>
                  <span className="text-xs opacity-80">{t(`levels.${levelId}.subtitle`)}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn-primary w-full px-6 py-3 text-lg"
            onClick={() => onStart(resolvedProfile, selectedDay, selectedLevel)}
          >
            {t("startScreen.startButton")}
          </button>

          <button className="btn-secondary w-full px-6 py-2" onClick={() => onPlay(resolvedProfile)}>
            {t("startScreen.playGamesButton")}
          </button>
        </div>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell language={language} setLanguage={setLanguage} t={t}>
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <Mascot pose="wave" size={56} />
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-foreground">{t("startScreen.title")}</h1>
          <p className="font-[family-name:var(--font-ui)] text-foreground-muted">{t("startScreen.subtitle")}</p>
        </div>

        <div className="flex w-full flex-col gap-2">
          <label className="font-[family-name:var(--font-ui)] text-foreground-muted" htmlFor="firstName">
            {t("startScreen.nameLabel")}
          </label>
          <input
            id="firstName"
            className="rounded-xl border border-border-subtle bg-background-raised px-4 py-3 font-[family-name:var(--font-ui)] text-lg text-foreground outline-none"
            placeholder={t("startScreen.namePlaceholder")}
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmitName();
            }}
            autoFocus
          />
          <NameLivePreview name={nameInput} />
          {error && <p className="font-[family-name:var(--font-ui)] text-sm text-[var(--finger-right-middle)]">{error}</p>}
          <button className="btn-primary mt-2 w-full px-6 py-3 text-lg" onClick={handleSubmitName}>
            {t("startScreen.startButton")}
          </button>
        </div>

      </div>
    </ScreenShell>
  );
}

function ScreenShell({
  children,
  language,
  setLanguage,
  t,
}: {
  children: React.ReactNode;
  language: "en" | "ht";
  setLanguage: (lang: "en" | "ht") => void;
  t: (path: string) => string;
}) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-10 overflow-hidden p-6">
      {/* Cover art as a horizon band along the bottom, faded out well before
          it reaches the content. Atmosphere only — nothing readable sits on
          it, so it can't cost contrast on the classroom panels. */}
      <div className={styles.horizon} aria-hidden="true" />

      {/* The brand mark that used to sit in the left corner here now lives in
          app/page.tsx, so it holds the same corner on every screen. */}

      <div className="absolute right-4 top-4 z-10 flex gap-1 rounded-full border border-border-subtle bg-background/70 p-1">
        <button
          className={`rounded-full px-3 py-1 text-sm font-[family-name:var(--font-ui)] ${
            language === "en" ? "chip-selected" : "text-foreground-muted"
          }`}
          onClick={() => setLanguage("en")}
        >
          {t("languageToggle.en")}
        </button>
        <button
          className={`rounded-full px-3 py-1 text-sm font-[family-name:var(--font-ui)] ${
            language === "ht" ? "chip-selected" : "text-foreground-muted"
          }`}
          onClick={() => setLanguage("ht")}
        >
          {t("languageToggle.ht")}
        </button>
      </div>

      <div className="relative z-10 flex w-full flex-col items-center gap-10">{children}</div>
    </div>
  );
}
