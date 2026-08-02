import { FINGERS, type FingerId } from "./fingers";

// The physical keyboard layout: which finger is responsible for each key.
// This is layout-level fact (which finger reaches which physical key), not
// curriculum (which keys are unlocked which day — that lives in content/days).
//
// QWERTY is the default and fully defined. AZERTY is stubbed for a future
// site where the physical keyboards turn out to be French AZERTY (see the
// open question in the project brief about confirming Operation Equip
// laptop layouts at Carrefour/Caradeux) — adding it means filling in KEY_ROWS
// below with the AZERTY character set and finger map, nothing in component
// code should need to change.

export type KeyDef = {
  /** Base (unshifted) character this key produces. Space is " ". Empty for a modifier. */
  char: string;
  /** Character produced with Shift held, if different from `char`. */
  shiftChar?: string;
  /** Finger responsible for this key. Space is "thumb", shared by both. */
  finger: FingerId | "thumb";
  /** Relative width for keyboard rendering; 1 = a standard letter key. */
  width?: number;
  /** Display label, for keys where showing the raw char would be unclear. */
  label?: string;
  /**
   * A modifier key: drawn on the board but never produces a character, so it
   * is deliberately excluded from the char -> KeyDef lookup below. Modifiers
   * are identified by `finger` (left vs right Shift), which is also how the
   * Keyboard picks which one to highlight for a given chord.
   */
  modifier?: "shift";
  /**
   * Stable render identity. Needed only where `char` is absent or shared —
   * the two Shift tiles both have an empty `char`, so React needs this to
   * tell them apart.
   */
  id?: string;
};

export type LayoutId = "qwerty" | "azerty";

export type Layout = {
  id: LayoutId;
  name: string;
  rows: KeyDef[][];
};

const QWERTY_ROWS: KeyDef[][] = [
  [
    { char: "`", shiftChar: "~", finger: "leftPinky" },
    { char: "1", shiftChar: "!", finger: "leftPinky" },
    { char: "2", shiftChar: "@", finger: "leftRing" },
    { char: "3", shiftChar: "#", finger: "leftMiddle" },
    { char: "4", shiftChar: "$", finger: "leftIndex" },
    { char: "5", shiftChar: "%", finger: "leftIndex" },
    { char: "6", shiftChar: "^", finger: "rightIndex" },
    { char: "7", shiftChar: "&", finger: "rightIndex" },
    { char: "8", shiftChar: "*", finger: "rightMiddle" },
    { char: "9", shiftChar: "(", finger: "rightRing" },
    { char: "0", shiftChar: ")", finger: "rightPinky" },
    { char: "-", shiftChar: "_", finger: "rightPinky" },
    { char: "=", shiftChar: "+", finger: "rightPinky" },
  ],
  [
    { char: "q", shiftChar: "Q", finger: "leftPinky" },
    { char: "w", shiftChar: "W", finger: "leftRing" },
    { char: "e", shiftChar: "E", finger: "leftMiddle" },
    { char: "r", shiftChar: "R", finger: "leftIndex" },
    { char: "t", shiftChar: "T", finger: "leftIndex" },
    { char: "y", shiftChar: "Y", finger: "rightIndex" },
    { char: "u", shiftChar: "U", finger: "rightIndex" },
    { char: "i", shiftChar: "I", finger: "rightMiddle" },
    { char: "o", shiftChar: "O", finger: "rightRing" },
    { char: "p", shiftChar: "P", finger: "rightPinky" },
    { char: "[", shiftChar: "{", finger: "rightPinky" },
    { char: "]", shiftChar: "}", finger: "rightPinky" },
    { char: "\\", shiftChar: "|", finger: "rightPinky" },
  ],
  [
    { char: "a", shiftChar: "A", finger: "leftPinky" },
    { char: "s", shiftChar: "S", finger: "leftRing" },
    { char: "d", shiftChar: "D", finger: "leftMiddle" },
    { char: "f", shiftChar: "F", finger: "leftIndex" },
    { char: "g", shiftChar: "G", finger: "leftIndex" },
    { char: "h", shiftChar: "H", finger: "rightIndex" },
    { char: "j", shiftChar: "J", finger: "rightIndex" },
    { char: "k", shiftChar: "K", finger: "rightMiddle" },
    { char: "l", shiftChar: "L", finger: "rightRing" },
    { char: ";", shiftChar: ":", finger: "rightPinky" },
    { char: "'", shiftChar: '"', finger: "rightPinky" },
  ],
  [
    // Both Shifts are drawn, at the ends of the bottom row where they
    // physically live. Which one a child should use depends on the letter —
    // see getShiftFingerForChar.
    { id: "shiftLeft", char: "", modifier: "shift", finger: "leftPinky", width: 2.25, label: "Shift" },
    { char: "z", shiftChar: "Z", finger: "leftPinky" },
    { char: "x", shiftChar: "X", finger: "leftRing" },
    { char: "c", shiftChar: "C", finger: "leftMiddle" },
    { char: "v", shiftChar: "V", finger: "leftIndex" },
    { char: "b", shiftChar: "B", finger: "leftIndex" },
    { char: "n", shiftChar: "N", finger: "rightIndex" },
    { char: "m", shiftChar: "M", finger: "rightIndex" },
    { char: ",", shiftChar: "<", finger: "rightMiddle" },
    { char: ".", shiftChar: ">", finger: "rightRing" },
    { char: "/", shiftChar: "?", finger: "rightPinky" },
    { id: "shiftRight", char: "", modifier: "shift", finger: "rightPinky", width: 2.25, label: "Shift" },
  ],
  [{ char: " ", finger: "thumb", width: 6, label: "Space" }],
];

// TODO(layout): confirm the physical keyboards at Carrefour and Caradeux.
// If any Operation Equip laptops are French AZERTY, fill this in with the
// real AZERTY character set and finger map rather than reusing QWERTY_ROWS.
const AZERTY_ROWS: KeyDef[][] = QWERTY_ROWS;

export const LAYOUTS: Record<LayoutId, Layout> = {
  qwerty: { id: "qwerty", name: "US QWERTY", rows: QWERTY_ROWS },
  azerty: { id: "azerty", name: "French AZERTY (stub — not yet confirmed)", rows: AZERTY_ROWS },
};

export const DEFAULT_LAYOUT: LayoutId = "qwerty";

const keyLookupCache = new Map<LayoutId, Map<string, KeyDef>>();

function getKeyLookup(layoutId: LayoutId): Map<string, KeyDef> {
  let cached = keyLookupCache.get(layoutId);
  if (cached) return cached;
  cached = new Map();
  for (const row of LAYOUTS[layoutId].rows) {
    for (const key of row) {
      // Modifiers produce no character, so they stay out of this map
      // entirely — that is what keeps every getKeyForChar consumer (the
      // engine, the validator, the games) unaware that they exist.
      if (key.modifier) continue;
      cached.set(key.char, key);
      if (key.shiftChar) cached.set(key.shiftChar, key);
    }
  }
  keyLookupCache.set(layoutId, cached);
  return cached;
}

/** Look up the KeyDef that produces a given character (either case). */
export function getKeyForChar(char: string, layoutId: LayoutId = DEFAULT_LAYOUT): KeyDef | undefined {
  return getKeyLookup(layoutId).get(char);
}

/** The finger responsible for typing a given character. */
export function getFingerForChar(char: string, layoutId: LayoutId = DEFAULT_LAYOUT): FingerId | "thumb" | undefined {
  return getKeyForChar(char, layoutId)?.finger;
}

/** Whether a character requires the Shift key to type. */
export function requiresShift(char: string, layoutId: LayoutId = DEFAULT_LAYOUT): boolean {
  const key = getKeyForChar(char, layoutId);
  return !!key && !!key.shiftChar && key.shiftChar === char;
}

/**
 * Sentinel standing in for the Shift key in the character-keyed sets the
 * Keyboard already takes (unlockedChars, justUnlockedChars). Safe because
 * modifiers are excluded from the char lookup above, so this string can never
 * collide with a real typeable character.
 */
export const SHIFT_MODIFIER_ID = "Shift";

/**
 * The pinky that must HOLD Shift to type `char` — always on the hand opposite
 * the letter, because you cannot hold left Shift and reach left-pinky Q with
 * the same hand. Null for characters that need no Shift at all.
 *
 * The app highlights this but never scores which Shift was actually pressed,
 * so teaching the correct hand costs a child nothing if they use the other.
 */
export function getShiftFingerForChar(char: string, layoutId: LayoutId = DEFAULT_LAYOUT): FingerId | null {
  const key = getKeyForChar(char, layoutId);
  if (!key || !requiresShift(char, layoutId)) return null;
  if (key.finger === "thumb") return null;
  return FINGERS[key.finger].hand === "left" ? "rightPinky" : "leftPinky";
}

/** Whether a character is typeable as of today's unlocked key set. */
export function isCharUnlocked(
  char: string,
  unlockedChars: ReadonlySet<string>,
  shiftUnlocked: boolean,
  layoutId: LayoutId = DEFAULT_LAYOUT
): boolean {
  const key = getKeyForChar(char, layoutId);
  if (!key) return false;
  const isShiftedForm = !!key.shiftChar && key.shiftChar === char;
  return isShiftedForm ? shiftUnlocked && unlockedChars.has(key.char) : unlockedChars.has(char);
}

/**
 * Classify each character of `text` into how the typing engine should treat
 * it — see LockedKeyConfig in lib/typing-engine.ts for why the two
 * behaviors are not interchangeable.
 *
 * `mode: "autofill-all"` is Verse Builder behavior: every not-yet-unlocked
 * character is pre-filled and skipped.
 *
 * `mode: "guided"` is Theme Challenge / game behavior: not-yet-unlocked
 * characters are still typed by the child (with the finger shown) and just
 * aren't scored. One kind of character is autofilled even in guided mode,
 * because there is no keystroke the child could reasonably produce:
 * characters with NO key on this layout at all — e.g. an accented Kreyòl
 * character on US QWERTY. Without this a child whose name contains "è" would
 * be stuck forever.
 *
 * Capitals before Shift is taught (Day 4) used to be autofilled too, because
 * the hand map could only show one finger and so a capital on Day 1 silently
 * asked a child to discover Shift alone. The hand map now draws the full
 * Shift+letter chord, so these are guided like any other untaught character —
 * a Day-1 child types the capital in their own name, unscored, with the
 * chord shown.
 */
export function buildLockedKeyConfig(
  text: string,
  unlockedChars: ReadonlySet<string>,
  shiftUnlocked: boolean,
  mode: "autofill-all" | "guided",
  layoutId: LayoutId = DEFAULT_LAYOUT
): { autofill: Set<string>; guidedTyped: Set<string> } {
  const autofill = new Set<string>();
  const guidedTyped = new Set<string>();
  for (const char of text) {
    if (isCharUnlocked(char, unlockedChars, shiftUnlocked, layoutId)) continue;
    const hasKey = getKeyForChar(char, layoutId) !== undefined;
    if (mode === "autofill-all" || !hasKey) autofill.add(char);
    else guidedTyped.add(char);
  }
  return { autofill, guidedTyped };
}

/** Every not-yet-typeable character in `text`, regardless of how it will be handled. */
export function computeLockedChars(
  text: string,
  unlockedChars: ReadonlySet<string>,
  shiftUnlocked: boolean,
  layoutId: LayoutId = DEFAULT_LAYOUT
): Set<string> {
  const locked = new Set<string>();
  for (const char of text) {
    if (!isCharUnlocked(char, unlockedChars, shiftUnlocked, layoutId)) locked.add(char);
  }
  return locked;
}
