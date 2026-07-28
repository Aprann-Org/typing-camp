import type { DayNumber, DeviceSettings, Language, Profile, Session, StorageShape } from "./types";
import { DEFAULT_LEVEL } from "@/content/levels";
import { createProfileId } from "./id";

// Everything the app persists lives under this single localStorage key.
// No database, no server, no PII beyond a first name — see the README's
// data note for what parents should be told is (and isn't) collected.
const STORAGE_KEY = "aprann.typing.v1";

function defaultStorage(): StorageShape {
  return { version: 1, profiles: [], deviceSettings: { calmMode: false } };
}

function readStorage(): StorageShape {
  if (typeof window === "undefined") return defaultStorage();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStorage();
    const parsed = JSON.parse(raw) as StorageShape;
    if (parsed.version !== 1 || !Array.isArray(parsed.profiles)) return defaultStorage();
    return parsed;
  } catch {
    // Corrupt or unreadable storage on a shared machine shouldn't crash the
    // app for the next child in line — start clean instead.
    return defaultStorage();
  }
}

function writeStorage(shape: StorageShape): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(shape));
}

function lastActivityMs(profile: Profile): number {
  const last = profile.sessions[profile.sessions.length - 1];
  if (!last) return new Date(profile.createdAt).getTime();
  return new Date(last.completedAt ?? last.startedAt).getTime();
}

/** All profiles on this machine, most recently active first. */
export function getAllProfiles(): Profile[] {
  return readStorage().profiles.slice().sort((a, b) => lastActivityMs(b) - lastActivityMs(a));
}

export function getProfile(id: string): Profile | undefined {
  return readStorage().profiles.find((p) => p.id === id);
}

/**
 * Best-guess match for the "is this you?" prompt when a typed name matches
 * an existing profile. If multiple profiles share the name (a real
 * possibility on a shared machine — see "No, someone else" in createProfile),
 * this returns the most recently active one; the tap-a-name list remains
 * available to pick a different duplicate if the guess is wrong.
 */
export function findProfileByName(firstName: string): Profile | undefined {
  const normalized = firstName.trim().toLowerCase();
  if (!normalized) return undefined;
  const matches = readStorage().profiles.filter((p) => p.firstName.trim().toLowerCase() === normalized);
  if (matches.length === 0) return undefined;
  return matches.sort((a, b) => lastActivityMs(b) - lastActivityMs(a))[0];
}

export function createProfile(firstName: string, language: Language, pin: string): Profile {
  const createdAt = new Date().toISOString();
  const profile: Profile = {
    id: createProfileId(firstName, createdAt),
    firstName: firstName.trim(),
    language,
    createdAt,
    sessions: [],
    soundEnabled: false,
    lastLevel: DEFAULT_LEVEL,
    pin,
  };
  const storage = readStorage();
  storage.profiles.push(profile);
  writeStorage(storage);
  return profile;
}

/**
 * Whether `pin` opens `profile` — see Profile.pin's own doc for what this
 * is and isn't. A profile with no pin set (created before this feature
 * existed) opens for anyone, same as before.
 */
export function verifyPin(profile: Profile, pin: string): boolean {
  return !profile.pin || profile.pin === pin;
}

export function updateProfile(updated: Profile): void {
  const storage = readStorage();
  const index = storage.profiles.findIndex((p) => p.id === updated.id);
  if (index === -1) return;
  storage.profiles[index] = updated;
  writeStorage(storage);
}

export function addSession(profileId: string, session: Session): Profile | undefined {
  const storage = readStorage();
  const index = storage.profiles.findIndex((p) => p.id === profileId);
  if (index === -1) return undefined;
  storage.profiles[index] = {
    ...storage.profiles[index],
    sessions: [...storage.profiles[index].sessions, session],
    lastLevel: session.level,
  };
  writeStorage(storage);
  return storage.profiles[index];
}

/** Highest day this profile has fully completed, or null if none yet. */
export function getLastCompletedDay(profile: Profile): DayNumber | null {
  const completedDays = profile.sessions.filter((s) => s.completedAt !== null).map((s) => s.day);
  if (completedDays.length === 0) return null;
  return completedDays.reduce((max, d) => (d > max ? d : max), completedDays[0]);
}

/**
 * The verse builder's signature comparison ("Day 1 you typed 14. Today you
 * typed 38.") looks back to the most recently completed EARLIER day, not a
 * prior attempt at today's day — the ladder unlocking more of the verse
 * day over day is the whole point. Returns null before any earlier day has
 * been completed (e.g. on Day 1 itself).
 */
export function getPriorVerseProgress(profile: Profile, day: DayNumber): { day: DayNumber; charsTypedUnassisted: number } | null {
  const earlierCompleted = profile.sessions.filter((s) => s.day < day && s.completedAt !== null);
  if (earlierCompleted.length === 0) return null;
  const mostRecent = earlierCompleted.reduce((best, s) => (s.day > best.day ? s : best), earlierCompleted[0]);
  return { day: mostRecent.day, charsTypedUnassisted: mostRecent.verseCharsTypedUnassisted };
}

/**
 * One badge per day this profile has earned, most recent completion per day
 * if a day was ever replayed. Ordered by day, for the report stage's badge
 * shelf.
 */
export function getEarnedBadges(profile: Profile): { day: DayNumber; badgeId: string }[] {
  const byDay = new Map<DayNumber, { badgeId: string; completedAt: string }>();
  for (const session of profile.sessions) {
    if (session.completedAt === null || session.badgeEarned === null) continue;
    const existing = byDay.get(session.day);
    if (!existing || session.completedAt > existing.completedAt) {
      byDay.set(session.day, { badgeId: session.badgeEarned, completedAt: session.completedAt });
    }
  }
  return Array.from(byDay.entries())
    .sort(([a], [b]) => a - b)
    .map(([day, v]) => ({ day, badgeId: v.badgeId }));
}

/** Consecutive days completed starting from Day 1, with no day skipped. */
export function getStreak(profile: Profile): number {
  const completedDays = new Set(profile.sessions.filter((s) => s.completedAt !== null).map((s) => s.day));
  let streak = 0;
  for (let day = 1; day <= 5; day++) {
    if (!completedDays.has(day as DayNumber)) break;
    streak += 1;
  }
  return streak;
}

export type WeekSummaryDay = {
  day: DayNumber;
  wpm: number;
  accuracy: number;
  charsTyped: number;
  durationSeconds: number;
  keysMastered: string[];
  badgeId: string | null;
};

/**
 * The full week's per-day stats for the end-of-week summary shown after Day
 * 5 — most-recent completed session per day, same replay handling as
 * getEarnedBadges. Returns null unless getStreak is 5 (all five days
 * completed in order, no gaps): a trend chart with a missing day would read
 * as "day 3 was skipped" rather than what it actually is, an incomplete
 * week that hasn't earned this screen yet.
 */
export function getWeekSummary(profile: Profile): WeekSummaryDay[] | null {
  if (getStreak(profile) !== 5) return null;

  const byDay = new Map<DayNumber, Session>();
  for (const session of profile.sessions) {
    if (session.completedAt === null) continue;
    const existing = byDay.get(session.day);
    if (!existing || session.completedAt! > existing.completedAt!) {
      byDay.set(session.day, session);
    }
  }

  const days: DayNumber[] = [1, 2, 3, 4, 5];
  return days.map((day) => {
    // Non-null: getStreak === 5 guarantees every day 1-5 has a completed session.
    const s = byDay.get(day)!;
    return {
      day,
      wpm: s.wpm,
      accuracy: s.accuracy,
      charsTyped: s.charsTyped,
      durationSeconds: s.durationSeconds,
      keysMastered: s.keysMastered,
      badgeId: s.badgeEarned,
    };
  });
}

export function getDeviceSettings(): DeviceSettings {
  return readStorage().deviceSettings;
}

export function setDeviceSettings(settings: DeviceSettings): void {
  const storage = readStorage();
  storage.deviceSettings = settings;
  writeStorage(storage);
}
