import type { LevelId } from "@/content/levels";

export type Language = "en" | "ht";
export type DayNumber = 1 | 2 | 3 | 4 | 5;

export type Session = {
  day: DayNumber;
  level: LevelId;
  startedAt: string;
  completedAt: string | null;
  durationSeconds: number;
  /** Of `durationSeconds`, the part actually spent typing — see StageTypingSummary.activeMs. */
  activeSeconds: number;
  /** Over active typing time, not wall-clock. */
  wpm: number;
  /** 0-1. Excludes guided-mode (locked-key) characters. */
  accuracy: number;
  /** The day's comparable score, 0-1000. Same number the report screen shows. */
  score: number;
  charsTyped: number;
  verseCharsTypedUnassisted: number;
  /** Per-key miss counts, keyed by the character that was missed. */
  keyErrors: Record<string, number>;
  keysMastered: string[];
  badgeEarned: string | null;
  stagesCompleted: number;
};

export type Profile = {
  id: string;
  firstName: string;
  language: Language;
  createdAt: string;
  sessions: Session[];
  // Additive beyond the brief's base schema — see the project plan's
  // "schema deviations" section for why these are per-profile.
  soundEnabled: boolean;
  lastLevel: LevelId;
};

export type DeviceSettings = {
  calmMode: boolean;
};

export type StorageShape = {
  version: 1;
  profiles: Profile[];
  deviceSettings: DeviceSettings;
};

export type DrillSpec = {
  keys: string[];
  pattern: string;
};

export type VerseConfig = {
  text: string;
  unlockedThroughDay: DayNumber;
};

// Split in two, per a locked project decision: the brief's original single
// DayContent type tied practice content to the UI instruction-language
// toggle, which is wrong for this camp — children should always practice
// real Kreyòl words/verse regardless of which language their on-screen
// instructions are shown in. See project memory for the full reasoning.

/** Bilingual, follows the instruction-language toggle. Not typed by the child. */
export type DayDisplayText = {
  themeTitle: string;
  bibleTruth: string;
  scratchProject: string;
  badgeLabel: string;
};

/** Single source per day, independent of the instruction-language toggle — this is what the child actually types. */
export type DayPracticeContent = {
  day: DayNumber;
  newKeys: string[];
  /**
   * Optional pedagogical clusters of newKeys (e.g. finger pairs) that the New
   * Keys stage teaches as separate checkpoints, with a short breather between
   * groups, instead of one uninterrupted run through every key. Order here
   * is the teaching order — it does not need to match newKeys' order. Every
   * key in newKeys must appear in exactly one group (validated at build by
   * scripts/validate-content.ts). Omit to keep the stage as a single
   * checkpoint, unchanged from before — most days don't have enough new
   * keys to need splitting.
   */
  newKeyGroups?: string[][];
  /**
   * The day Shift (and so capitals) is taught. Exactly one day in the week
   * sets this — content/days/index.ts's isShiftUnlocked derives from it, and
   * the New Keys stage appends a Shift checkpoint on this day. Not a member of
   * `newKeys` because Shift produces no character of its own.
   */
  teachesShift?: true;
  drills: DrillSpec[];
  /** Unlocked keys only — validated at build by scripts/validate-content.ts. */
  wordBank: string[];
  /** May use locked keys; rendered in guided mode. */
  themePhrases: string[];
  verse: VerseConfig;
  badgeId: string;
};

export type StageId =
  | "ready"
  | "newKeys"
  | "wordBuild"
  | "themeChallenge"
  | "game"
  | "verseBuilder"
  | "report";
