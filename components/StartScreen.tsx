"use client";

import { useEffect, useState } from "react";
import type { DayNumber, Profile } from "@/lib/types";
import { LEVEL_ORDER, DEFAULT_LEVEL, type LevelId } from "@/content/levels";
import { getAvailableDays } from "@/content/days";
import { getAllProfiles, findProfileByName, createProfile, getLastCompletedDay } from "@/lib/storage";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useI18n } from "@/context/I18nContext";

type Step = "enterName" | "confirm" | "pickSession";

type StartScreenProps = {
  onStart: (profile: Profile, day: DayNumber, level: LevelId) => void;
};

export function StartScreen({ onStart }: StartScreenProps) {
  const { t } = useI18n();
  const { language, setLanguage, setActiveProfile } = useAppSettings();
  const [step, setStep] = useState<Step>("enterName");
  const [nameInput, setNameInput] = useState("");
  const [existingProfiles, setExistingProfiles] = useState<Profile[]>([]);
  const [candidate, setCandidate] = useState<Profile | null>(null);
  const [resolvedProfile, setResolvedProfile] = useState<Profile | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayNumber>(1);
  const [selectedLevel, setSelectedLevel] = useState<LevelId>(DEFAULT_LEVEL);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setExistingProfiles(getAllProfiles());
  }, []);

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
    const match = findProfileByName(trimmed);
    if (match) {
      setCandidate(match);
      setStep("confirm");
    } else {
      selectProfile(createProfile(trimmed, language));
    }
  }

  function handleConfirmYes() {
    if (candidate) selectProfile(candidate);
  }

  function handleConfirmNo() {
    const created = createProfile(nameInput.trim(), language);
    setCandidate(null);
    selectProfile(created);
  }

  if (step === "confirm" && candidate) {
    const lastDay = getLastCompletedDay(candidate);
    return (
      <ScreenShell language={language} setLanguage={setLanguage} t={t}>
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-foreground">
            {t("startScreen.isThisYouTitle")}
          </h1>
          <p className="font-[family-name:var(--font-ui)] text-lg text-foreground">{candidate.firstName}</p>
          <p className="font-[family-name:var(--font-ui)] text-foreground-muted">
            {lastDay ? t("startScreen.isThisYouLastDay", { day: lastDay }) : t("startScreen.isThisYouNoProgress")}
          </p>
          <div className="flex gap-3">
            <button
              className="rounded-full bg-[var(--finger-left-index)] px-6 py-2 font-[family-name:var(--font-ui)] font-semibold text-[#14162a]"
              onClick={handleConfirmYes}
            >
              {t("startScreen.isThisYouConfirm")}
            </button>
            <button
              className="rounded-full border border-border-subtle px-6 py-2 font-[family-name:var(--font-ui)] text-foreground"
              onClick={handleConfirmNo}
            >
              {t("startScreen.isThisYouDeny")}
            </button>
          </div>
        </div>
      </ScreenShell>
    );
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
            <div className="flex flex-wrap justify-center gap-2">
              {availableDays.map((day) => (
                <button
                  key={day}
                  className={`rounded-full px-4 py-2 font-[family-name:var(--font-ui)] transition-colors ${
                    selectedDay === day
                      ? "bg-[var(--finger-left-index)] text-[#14162a]"
                      : "border border-border-subtle text-foreground"
                  }`}
                  onClick={() => setSelectedDay(day)}
                >
                  {t("startScreen.dayOption", { day })}
                </button>
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-3">
            <span className="font-[family-name:var(--font-ui)] text-foreground-muted">{t("startScreen.levelLabel")}</span>
            <div className="flex flex-wrap justify-center gap-2">
              {LEVEL_ORDER.map((levelId) => (
                <button
                  key={levelId}
                  className={`flex flex-col items-center rounded-2xl px-4 py-3 font-[family-name:var(--font-ui)] transition-colors ${
                    selectedLevel === levelId
                      ? "bg-[var(--finger-right-middle)] text-[#14162a]"
                      : "border border-border-subtle text-foreground"
                  }`}
                  onClick={() => setSelectedLevel(levelId)}
                >
                  <span className="font-semibold">{t(`levels.${levelId}.name`)}</span>
                  <span className="text-xs opacity-80">{t(`levels.${levelId}.subtitle`)}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            className="w-full rounded-full bg-[var(--finger-left-index)] px-6 py-3 font-[family-name:var(--font-ui)] text-lg font-semibold text-[#14162a]"
            onClick={() => onStart(resolvedProfile, selectedDay, selectedLevel)}
          >
            {t("startScreen.startButton")}
          </button>
        </div>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell language={language} setLanguage={setLanguage} t={t}>
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
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
          {error && <p className="font-[family-name:var(--font-ui)] text-sm text-[var(--finger-right-middle)]">{error}</p>}
          <button
            className="mt-2 w-full rounded-full bg-[var(--finger-left-index)] px-6 py-3 font-[family-name:var(--font-ui)] text-lg font-semibold text-[#14162a]"
            onClick={handleSubmitName}
          >
            {t("startScreen.startButton")}
          </button>
        </div>

        {existingProfiles.length > 0 && (
          <div className="flex w-full flex-col gap-2">
            <span className="font-[family-name:var(--font-ui)] text-sm text-foreground-muted">
              {t("startScreen.existingProfilesLabel")}
            </span>
            <div className="flex flex-wrap gap-2">
              {existingProfiles.map((profile) => {
                const lastDay = getLastCompletedDay(profile);
                return (
                  <button
                    key={profile.id}
                    className="flex items-center gap-2 rounded-full border border-border-subtle px-4 py-2 font-[family-name:var(--font-ui)] text-foreground"
                    onClick={() => selectProfile(profile)}
                  >
                    <span>{profile.firstName}</span>
                    {lastDay && <span className="text-xs text-foreground-muted">{t("startScreen.dayOption", { day: lastDay })}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
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
    <div className="relative flex flex-1 flex-col items-center justify-center gap-10 p-6">
      <div className="absolute right-4 top-4 flex gap-1 rounded-full border border-border-subtle p-1">
        <button
          className={`rounded-full px-3 py-1 text-sm font-[family-name:var(--font-ui)] ${
            language === "en" ? "bg-[var(--finger-left-index)] text-[#14162a]" : "text-foreground-muted"
          }`}
          onClick={() => setLanguage("en")}
        >
          {t("languageToggle.en")}
        </button>
        <button
          className={`rounded-full px-3 py-1 text-sm font-[family-name:var(--font-ui)] ${
            language === "ht" ? "bg-[var(--finger-left-index)] text-[#14162a]" : "text-foreground-muted"
          }`}
          onClick={() => setLanguage("ht")}
        >
          {t("languageToggle.ht")}
        </button>
      </div>
      {children}
    </div>
  );
}
