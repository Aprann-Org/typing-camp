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
    existingProfilesLabel: "Already typed this week? Tap your name.",
    isThisYouTitle: "Is this you?",
    isThisYouLastDay: "You last completed Day {day}.",
    isThisYouNoProgress: "You haven't finished a day yet.",
    isThisYouConfirm: "Yes, that's me",
    isThisYouDeny: "No, someone else",
    dayLabel: "Which day are you on?",
    dayOption: "Day {day}",
    dayComingSoon: "Coming soon",
    levelLabel: "Which level?",
    startButton: "Start typing",
    nameRequired: "Type your first name first.",
    playGamesButton: "Just play a game",
    viewWeekSummaryButton: "See my week",
    setPinTitle: "Choose a 4-digit code",
    setPinSubtitle: "You'll type this again next time to open your profile.",
    enterPinTitle: "Enter your code",
    pinPlaceholder: "0000",
    pinMustBe4Digits: "Enter all 4 digits.",
    pinIncorrect: "That code isn't right. Try again.",
  },

  playScreen: {
    title: "Play a game",
    subtitle: "Replay any game from a day you've finished — just for fun, nothing to save.",
    dayLabel: "Which day's game?",
    notYetLabel: "Finish this day first",
    playButton: "Play",
    noneYet: "Finish Day 1 first to unlock its game here.",
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
      comparisonLine: "Day {day} you typed {previous}. Today you typed {current}.",
      firstTimeLine: "You typed {current} characters yourself today.",
    },
    report: {
      title: "Great work",
      wpmLabel: "Words per minute",
      accuracyLabel: "Accuracy",
      keysMasteredLabel: "Keys mastered",
      keysWarmingUpLabel: "Keys still warming up",
      noWeakKeys: "Every key you drilled today is solid.",
      badgeLabel: "Badge earned",
      streakLabel: "Day streak",
      badgeShelfLabel: "Badges earned this week",
      doneButton: "Done for today",
    },
    weekSummary: {
      title: "Your week",
      subtitle: "Five days, five badges — look how far you came.",
      wpmChartTitle: "Words per minute, day by day",
      accuracyChartTitle: "Accuracy, day by day",
      dayLabel: "Day {day}",
      totalPracticeLabel: "Total practice time",
      keysMasteredLabel: "Keys mastered this week",
      badgesLabel: "Badges earned",
      finishButton: "Finish",
    },
  },

  typing: {
    streak: "{count} in a row",
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
