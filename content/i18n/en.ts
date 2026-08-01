// Canonical English UI strings. content/i18n/ht.ts must have the exact same
// key shape — it is typed against `typeof en` so the two can never silently
// drift apart. Every user-facing string in the app should be reached
// through this file (via the I18nContext), never hardcoded in a component.
//
// Voice: plain, active, warm without being saccharine. Say exactly what to
// do ("Put your left index finger on F. Feel the bump."). Name the specific
// fix, never "Oops! Try again!". These are 8-15 year olds; the older ones
// will bristle at anything cutesy. Never show a failing percentage.

const en = {
  common: {
    appName: "Kod & Kreyasyon Typing",
    back: "Back",
    continue: "Continue",
    done: "Done",
    yes: "Yes",
    no: "No",
    cancel: "Cancel",
    timeLabel: "Time:",
  },

  languageToggle: {
    label: "Language",
    en: "English",
    ht: "Kreyòl",
  },

  home: {
    label: "Back to the start screen",
    confirmTitle: "Leave this day?",
    confirmBody: "Today isn't finished, so nothing has been saved yet. If you leave now you'll start this day over.",
    confirmStay: "Keep typing",
    confirmLeave: "Leave anyway",
  },

  splash: {
    // Lifted from the printed workbook cover so the app opens on the same
    // sentence the children are holding in their hands.
    tagline: "Five days of code, creation, and the God who made you",
    skipHint: "Press any key",
  },

  startScreen: {
    title: "Kod & Kreyasyon",
    subtitle: "Type your first name to begin.",
    nameLabel: "What's your first name?",
    namePlaceholder: "Type your first name",
    dayLabel: "Which day are you on?",
    dayOption: "Day {day}",
    dayComingSoon: "Coming soon",
    levelLabel: "Which level?",
    startButton: "Start typing",
    nameRequired: "Type your first name first.",
    playGamesButton: "Just play a game",
  },

  playScreen: {
    title: "Play a game",
    subtitle: "Play any day's game — just for fun, nothing to save.",
    dayLabel: "Which day's game?",
    notYetLabel: "Coming soon",
    playButton: "Play",
    noneYet: "No games here yet.",
    backButton: "Back",
    bonusGamesLabel: "Bonus games",
    ninjaGameLabel: "Ninja hop",
    mazeGameLabel: "Maze runner",
    starBlasterGameLabel: "Star blaster",
    carRaceGameLabel: "Car race",
  },

  levels: {
    starter: { name: "Starter", subtitle: "First time typing" },
    builder: { name: "Builder", subtitle: "I've typed before" },
    flyer: { name: "Flyer", subtitle: "I'm fast already" },
  },

  teacherControls: {
    skipStage: "Skip stage",
    calmModeOn: "Turn on calm mode",
    calmModeOff: "Turn off calm mode",
  },

  stages: {
    ready: {
      title: "Ready",
      findLeftBump: "Put your left index finger on F. Feel the bump.",
      findRightBump: "Put your right index finger on J. Feel the bump.",
      restOfFingers: "Rest your other fingers on the row right beside them.",
      posture: "Sit tall. Feet flat. Elbows relaxed.",
      continueButton: "I'm ready",
    },
    newKeys: {
      title: "New keys",
      instruction: "Let's meet today's new keys.",
      tryIt: "Try it",
      checkpointTitle: "Nice work!",
      checkpointMessage: "You just learned {keys}.",
      checkpointContinue: "Next keys",
      spaceKeyLabel: "Space",
      shiftIntroTitle: "Meet the Shift key",
      shiftIntroHold: "Hold Shift down with your pinky. Keep holding it.",
      shiftIntroPress: "Now press a letter. You get a big letter.",
      shiftIntroOtherHand: "Use the Shift on the other hand from the letter.",
      shiftCheckpointMessage: "You just learned Shift. Now you can write big letters.",
    },
    wordBuild: {
      title: "Word build",
      instruction: "Type these words using only the keys you already know.",
    },
    themeChallenge: {
      title: "Theme challenge",
      instruction: "Some of these letters are new — we'll show you which finger to use.",
      helperKeyNote: "Marked letters don't count against your score. They're just for today's words.",
    },
    game: {
      title: "Game",
    },
    verseBuilder: {
      title: "Verse builder",
      instruction: "Type the verse. Dimmed letters fill in on their own — just type the rest.",
      counter: "You typed {typed} of {total} characters yourself.",
      firstTimeLine: "You typed {current} characters yourself today.",
    },
    report: {
      title: "Great work",
      // Points earned, never a grade kept — this line is shown at every
      // level, including Starter, so the whole room has one number to
      // compare. See lib/day-score.ts for what goes into it.
      scoreLabel: "points out of {max}",
      scoreIdentity: "{name} · Day {day} · {level}",
      shareNote: "Read your score out to your teacher before you close this screen. Nothing here is saved.",
      wpmLabel: "Words per minute",
      accuracyLabel: "Accuracy",
      charsTypedLabel: "Keys typed",
      timeTypingLabel: "Time typing",
      timeValue: "{minutes}m {seconds}s",
      keysMasteredLabel: "Keys mastered",
      keysWarmingUpLabel: "Keys still warming up",
      noWeakKeys: "Every key you drilled today is solid.",
      badgeLabel: "Badge earned",
      doneButton: "Done for today",
    },
  },

  typing: {
    streak: "{count} in a row",
    shiftHint: "Hold Shift with your {finger}, then press {char}.",
    shiftMissNudge: "Hold Shift to make a big letter.",
    shiftReleaseNudge: "Let go of Shift for a small letter.",
    capsLockWarning: "Caps Lock is on. Press Caps Lock to turn it off.",
  },

  feedback: {
    keyNeedsWork: "Your {typed} keeps landing as {expected}. Keep an eye on {finger}.",
    retryMessage: "Let's get a bit more practice in.",
  },

  fingerNames: {
    leftPinky: "left pinky",
    leftRing: "left ring finger",
    leftMiddle: "left middle finger",
    leftIndex: "left index finger",
    rightIndex: "right index finger",
    rightMiddle: "right middle finger",
    rightRing: "right ring finger",
    rightPinky: "right pinky",
    thumb: "thumb",
  },

  sound: {
    toggleOn: "Turn sound on",
    toggleOff: "Turn sound off",
  },

  games: {
    day1NameAnimator: {
      instruction: "Type your name. Each letter lands and lights up.",
    },
    day2CharacterBuilder: {
      instruction: "Type each word to add that part. Every detail on purpose.",
    },
    day3WorldBuilder: {
      instruction: "Type a word and watch it appear. Build your world.",
    },
    day4Soar: {
      instruction: "Every word is a wingbeat. Take your time — the eagle only ever goes up.",
    },
    day5FindTheSheep: {
      instruction: "Type each word to keep searching. The shepherd always finds the lost sheep.",
    },
    ninjaFlight: {
      instruction: "Type each letter to send the ninja hopping toward the flag.",
    },
    mazeRunner: {
      instruction: "Type each letter to move through the maze toward the door.",
    },
    starBlaster: {
      instruction: "Type each letter to blast the next star out of the sky.",
    },
    carRace: {
      instruction: "Type each letter to drive toward the checkered flag.",
    },
  },

  progress: {
    stageOf: "Stage {current} of {total}",
  },
};

export default en;
export type Strings = typeof en;
