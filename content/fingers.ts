// The eight finger colors are the app's entire color system: they appear on
// the hand map, the on-screen keyboard, correct-keystroke feedback, the verse
// builder fill, and badges. Whichever color a child sees is the finger they
// used or should use — nothing else in the app carries independent meaning.
//
// Hues are drawn from Haitian tap-tap bus painting: saturated, hand-mixed,
// high-contrast, unafraid. Not muted, not pastel, not a corporate palette.
// Every other surface in the app stays quiet (a deep, near-saturated dark
// background) so these eight can do all the work.
//
// This file is the single source of truth. No component should hardcode a
// finger hex literal — import from here.

export type FingerId =
  | "leftPinky"
  | "leftRing"
  | "leftMiddle"
  | "leftIndex"
  | "rightIndex"
  | "rightMiddle"
  | "rightRing"
  | "rightPinky";

export type Finger = {
  id: FingerId;
  hand: "left" | "right";
  hex: string;
};

// Display names for these fingers are user-facing text and live in
// content/i18n (en.ts / ht.ts) under `fingerNames`, keyed by FingerId —
// not here, so Kreyòl sessions never see an English finger name.
export const FINGERS: Record<FingerId, Finger> = {
  leftPinky: { id: "leftPinky", hand: "left", hex: "#E6007E" },
  leftRing: { id: "leftRing", hand: "left", hex: "#1155CC" },
  leftMiddle: { id: "leftMiddle", hand: "left", hex: "#00A651" },
  leftIndex: { id: "leftIndex", hand: "left", hex: "#FFC72C" },
  rightIndex: { id: "rightIndex", hand: "right", hex: "#FF6B1A" },
  rightMiddle: { id: "rightMiddle", hand: "right", hex: "#E31E3D" },
  rightRing: { id: "rightRing", hand: "right", hex: "#8E3B9D" },
  rightPinky: { id: "rightPinky", hand: "right", hex: "#00B4A6" },
};

// Both thumbs share the space bar. Rather than force a ninth competing hue
// into an eight-finger system, thumbs get a neutral cream (tap-tap trim
// color) that reads as "shared," not "unassigned."
export const THUMB_COLOR = "#F2E9DC";

export const FINGER_ORDER: FingerId[] = [
  "leftPinky",
  "leftRing",
  "leftMiddle",
  "leftIndex",
  "rightIndex",
  "rightMiddle",
  "rightRing",
  "rightPinky",
];
