import type { DeviceSettings, Language, Profile, Session, StorageShape } from "./types";
import { DEFAULT_LEVEL } from "@/content/levels";
import { createProfileId } from "./id";

// Everything the app persists lives under this single localStorage key.
// No database, no server, no PII beyond a first name — see the README's
// data note for what parents should be told is (and isn't) collected.
//
// Write-mostly by design. Sessions are recorded, but nothing in the app
// reads them back across days: children aren't guaranteed the same laptop
// two days running and storage is per-machine, so any cross-day figure
// (streak, badge shelf, week summary) would be wrong for most of them. The
// records are kept anyway as raw material for a future teacher-side export.
// See docs/profile-recovery-plan.md.
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

/**
 * One per sitting. There's no lookup of an existing profile by name — a
 * child who types their name on Tuesday gets a new profile, on purpose.
 */
export function createProfile(firstName: string, language: Language): Profile {
  const createdAt = new Date().toISOString();
  const profile: Profile = {
    id: createProfileId(firstName, createdAt),
    firstName: firstName.trim(),
    language,
    createdAt,
    sessions: [],
    soundEnabled: false,
    lastLevel: DEFAULT_LEVEL,
  };
  const storage = readStorage();
  storage.profiles.push(profile);
  writeStorage(storage);
  return profile;
}

export function updateProfile(updated: Profile): void {
  const storage = readStorage();
  const index = storage.profiles.findIndex((p) => p.id === updated.id);
  if (index === -1) return;
  storage.profiles[index] = updated;
  writeStorage(storage);
}

/**
 * Appends the finished session. Write-only as far as the app is concerned —
 * see this file's header for why nothing reads these back.
 */
export function addSession(profileId: string, session: Session): void {
  const storage = readStorage();
  const index = storage.profiles.findIndex((p) => p.id === profileId);
  if (index === -1) return;
  storage.profiles[index] = {
    ...storage.profiles[index],
    sessions: [...storage.profiles[index].sessions, session],
    lastLevel: session.level,
  };
  writeStorage(storage);
}

export function getDeviceSettings(): DeviceSettings {
  return readStorage().deviceSettings;
}

export function setDeviceSettings(settings: DeviceSettings): void {
  const storage = readStorage();
  storage.deviceSettings = settings;
  writeStorage(storage);
}
