"use client";

import { useEffect, useState } from "react";
import type { DayNumber, Profile } from "@/lib/types";
import { LEVEL_ORDER, DEFAULT_LEVEL, type LevelId } from "@/content/levels";
import { getAvailableDays } from "@/content/days";
import {
  getAllProfiles,
  findProfileByName,
  createProfile,
  createProfileFromProgressCode,
  verifyPin,
  getLastCompletedDay,
  getWeekSummary,
} from "@/lib/storage";
import { encodeProgressCode, decodeProgressCode, PROGRESS_CODE_FEATURE_ENABLED, type ProgressPayload } from "@/lib/progressCode";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useI18n } from "@/context/I18nContext";
import { Mascot } from "@/components/Mascot";
import { DayPath } from "@/components/DayPath";
import { LevelIcon } from "@/components/LevelIcon";
import { NameLivePreview } from "@/components/NameLivePreview";
import { PinInput } from "@/components/PinInput";
import styles from "./StartScreen.module.css";

// setPin: a brand-new profile (no existing match, or "No, someone else")
// chooses its 4-digit code before it's created.
// enterPin: an existing profile (picked from the confirm prompt or tapped
// directly from the "already typed this week" list) must repeat its code
// before it opens — see Profile.pin's own doc for what this protects.
type Step = "enterName" | "confirm" | "setPin" | "enterPin" | "pickSession";

type StartScreenProps = {
  onStart: (profile: Profile, day: DayNumber, level: LevelId) => void;
  /** Omitted entirely once a profile has no completed day yet — there's no game to play. */
  onPlay: (profile: Profile) => void;
  /** Reopens the week summary screen — only offered once the full week (all 5 days, no gaps) is done. */
  onViewWeekSummary: (profile: Profile) => void;
};

export function StartScreen({ onStart, onPlay, onViewWeekSummary }: StartScreenProps) {
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
  // The name a brand-new profile will be created with, once its code is set.
  const [pendingName, setPendingName] = useState("");
  // The existing profile awaiting its code before it can open.
  const [pendingProfile, setPendingProfile] = useState<Profile | null>(null);
  // Set instead of pendingName when the new profile comes from a restored
  // progress code rather than a freshly typed name — see handleCreatePin.
  const [pendingRestore, setPendingRestore] = useState<ProgressPayload | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);

  // "Save my code" (pickSession) / "Have a code?" (enterName) — see
  // lib/progressCode.ts for what the code actually carries.
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codePreview, setCodePreview] = useState<ProgressPayload | null>(null);

  useEffect(() => {
    // getAllProfiles() reads localStorage, which doesn't exist on the
    // server — this can only run after mount, in an effect, not during
    // render (a render-time read here is exactly the class of bug that
    // produces a hydration mismatch, since the server has no localStorage
    // to read).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExistingProfiles(getAllProfiles());
  }, []);

  const availableDays = getAvailableDays(language);

  function selectProfile(profile: Profile) {
    setActiveProfile(profile);
    setResolvedProfile(profile);
    setSelectedLevel(profile.lastLevel);
    setStep("pickSession");
  }

  function startPinEntry(profile: Profile) {
    setPendingProfile(profile);
    setPinInput("");
    setPinError(null);
    setStep("enterPin");
  }

  function startPinCreation(name: string) {
    setPendingName(name);
    setPendingRestore(null);
    setPinInput("");
    setPinError(null);
    setStep("setPin");
  }

  function startPinCreationFromRestore(payload: ProgressPayload) {
    setPendingRestore(payload);
    setPendingName("");
    setPinInput("");
    setPinError(null);
    setStep("setPin");
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
      startPinCreation(trimmed);
    }
  }

  function handleConfirmYes() {
    if (candidate) startPinEntry(candidate);
  }

  function handleConfirmNo() {
    setCandidate(null);
    startPinCreation(nameInput.trim());
  }

  function handleCreatePin() {
    if (pinInput.length !== 4) {
      setPinError(t("startScreen.pinMustBe4Digits"));
      return;
    }
    const created = pendingRestore
      ? createProfileFromProgressCode(pendingRestore, language, pinInput)
      : createProfile(pendingName, language, pinInput);
    selectProfile(created);
  }

  function handleRestoreCode() {
    setCodeError(null);
    if (!codeInput.trim()) {
      setCodeError(t("startScreen.codeEmpty"));
      return;
    }
    const decoded = decodeProgressCode(codeInput);
    if (!decoded) {
      setCodeError(t("startScreen.codeInvalid"));
      return;
    }
    setCodePreview(decoded);
  }

  function handleVerifyPin() {
    if (!pendingProfile) return;
    if (verifyPin(pendingProfile, pinInput)) {
      selectProfile(pendingProfile);
    } else {
      setPinError(t("startScreen.pinIncorrect"));
      setPinInput("");
    }
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
            <button className="btn-primary px-6 py-2" onClick={handleConfirmYes}>
              {t("startScreen.isThisYouConfirm")}
            </button>
            <button className="btn-secondary px-6 py-2" onClick={handleConfirmNo}>
              {t("startScreen.isThisYouDeny")}
            </button>
          </div>
        </div>
      </ScreenShell>
    );
  }

  if (step === "setPin") {
    return (
      <ScreenShell language={language} setLanguage={setLanguage} t={t}>
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-foreground">{t("startScreen.setPinTitle")}</h1>
          <p className="font-[family-name:var(--font-ui)] text-foreground-muted">{t("startScreen.setPinSubtitle")}</p>
          <PinInput value={pinInput} onChange={setPinInput} onSubmit={handleCreatePin} placeholder={t("startScreen.pinPlaceholder")} />
          {pinError && <p className="font-[family-name:var(--font-ui)] text-sm text-[var(--finger-right-middle)]">{pinError}</p>}
          <button className="btn-primary px-6 py-3 text-lg" onClick={handleCreatePin}>
            {t("common.continue")}
          </button>
          <button className="font-[family-name:var(--font-ui)] text-sm text-foreground-muted" onClick={() => setStep("enterName")}>
            {t("common.back")}
          </button>
        </div>
      </ScreenShell>
    );
  }

  if (step === "enterPin" && pendingProfile) {
    return (
      <ScreenShell language={language} setLanguage={setLanguage} t={t}>
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-foreground">{t("startScreen.enterPinTitle")}</h1>
          <p className="font-[family-name:var(--font-ui)] text-lg text-foreground">{pendingProfile.firstName}</p>
          <PinInput value={pinInput} onChange={setPinInput} onSubmit={handleVerifyPin} placeholder={t("startScreen.pinPlaceholder")} />
          {pinError && <p className="font-[family-name:var(--font-ui)] text-sm text-[var(--finger-right-middle)]">{pinError}</p>}
          <button className="btn-primary px-6 py-3 text-lg" onClick={handleVerifyPin}>
            {t("common.continue")}
          </button>
          <button className="font-[family-name:var(--font-ui)] text-sm text-foreground-muted" onClick={() => setStep("enterName")}>
            {t("common.back")}
          </button>
        </div>
      </ScreenShell>
    );
  }

  if (step === "pickSession" && resolvedProfile) {
    const lastCompletedDay = getLastCompletedDay(resolvedProfile);
    const exportCode =
      PROGRESS_CODE_FEATURE_ENABLED && lastCompletedDay
        ? encodeProgressCode(resolvedProfile.firstName, lastCompletedDay, resolvedProfile.lastLevel)
        : null;

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
              lastCompletedDay={getLastCompletedDay(resolvedProfile)}
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

          {getLastCompletedDay(resolvedProfile) !== null && (
            <button className="btn-secondary w-full px-6 py-2" onClick={() => onPlay(resolvedProfile)}>
              {t("startScreen.playGamesButton")}
            </button>
          )}

          {getWeekSummary(resolvedProfile) !== null && (
            <button className="btn-secondary w-full px-6 py-2" onClick={() => onViewWeekSummary(resolvedProfile)}>
              {t("startScreen.viewWeekSummaryButton")}
            </button>
          )}

          {exportCode && (
            <div className="flex w-full flex-col items-center gap-3">
              <button className="btn-secondary w-full px-6 py-2" onClick={() => setShowExportPanel((open) => !open)}>
                {t("startScreen.saveCodeButton")}
              </button>

              {showExportPanel && (
                <div className="flex w-full flex-col items-center gap-2 text-center">
                  <p className="font-[family-name:var(--font-ui)] text-sm font-semibold text-foreground">
                    {t("startScreen.exportCodeTitle")}
                  </p>
                  <p className="font-[family-name:var(--font-ui)] text-xs text-foreground-muted">
                    {t("startScreen.exportCodeSubtitle")}
                  </p>
                  <p className="w-full break-words rounded-xl border border-dashed border-border-subtle bg-background px-3 py-3 text-center font-[family-name:var(--font-typing)] text-lg font-semibold tracking-wider text-foreground">
                    {exportCode}
                  </p>
                  <button
                    className="btn-secondary w-full px-6 py-2"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(exportCode);
                      } catch {
                        // Clipboard permissions can be denied — the code is
                        // already visible and selectable either way.
                      }
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1600);
                    }}
                  >
                    {copied ? t("startScreen.codeCopied") : t("startScreen.copyCodeButton")}
                  </button>
                </div>
              )}
            </div>
          )}
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
                    className="btn-secondary flex items-center gap-2 px-4 py-2"
                    onClick={() => startPinEntry(profile)}
                  >
                    <span>{profile.firstName}</span>
                    {lastDay && <span className="text-xs text-foreground-muted">{t("startScreen.dayOption", { day: lastDay })}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {PROGRESS_CODE_FEATURE_ENABLED && (
          <div className="flex w-full flex-col items-center gap-3">
            <button
              className="font-[family-name:var(--font-ui)] text-sm text-foreground-muted underline decoration-1 underline-offset-2 hover:text-foreground"
              onClick={() => setShowImportPanel((open) => !open)}
            >
              {t("startScreen.haveCodeButton")}
            </button>

            {showImportPanel && (
              <div className="flex w-full flex-col items-center gap-2 text-center">
                <p className="font-[family-name:var(--font-ui)] text-sm font-semibold text-foreground">
                  {t("startScreen.restoreCodeTitle")}
                </p>
                <p className="font-[family-name:var(--font-ui)] text-xs text-foreground-muted">
                  {t("startScreen.restoreCodeSubtitle")}
                </p>
                <input
                  className="w-full rounded-xl border border-border-subtle bg-background-raised px-4 py-3 text-center font-[family-name:var(--font-typing)] text-lg uppercase tracking-wider text-foreground outline-none"
                  placeholder={t("startScreen.codePlaceholder")}
                  value={codeInput}
                  onChange={(e) => {
                    setCodeInput(e.target.value);
                    setCodePreview(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRestoreCode();
                  }}
                  aria-label="Progress code"
                />
                {codeError && <p className="font-[family-name:var(--font-ui)] text-sm text-[var(--finger-right-middle)]">{codeError}</p>}

                {codePreview ? (
                  <div className="flex w-full flex-col gap-3 rounded-xl border border-border-subtle bg-background-raised p-4 text-left">
                    <div>
                      <p className="font-[family-name:var(--font-ui)] text-sm font-semibold text-foreground">
                        {t("startScreen.restoreWelcome", { name: codePreview.n })}
                      </p>
                      <p className="font-[family-name:var(--font-ui)] text-xs text-foreground-muted">
                        {t("startScreen.restoreDetail", { day: codePreview.d, level: t(`levels.${codePreview.l}.name`) })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="btn-primary flex-1 px-4 py-2 text-sm"
                        onClick={() => startPinCreationFromRestore(codePreview)}
                      >
                        {t("startScreen.restoreConfirm")}
                      </button>
                      <button className="btn-secondary flex-1 px-4 py-2 text-sm" onClick={() => setCodePreview(null)}>
                        {t("common.cancel")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="btn-primary w-full px-6 py-2" onClick={handleRestoreCode}>
                    {t("common.continue")}
                  </button>
                )}
              </div>
            )}
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
