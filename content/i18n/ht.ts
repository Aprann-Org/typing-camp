// Kreyòl Ayisyen UI strings.
//
// STATUS: first-pass translation done by Claude (AI), 2026-07-25. This is a
// real translation attempt, not English placeholders — but it has NOT been
// reviewed by a native Kreyòl speaker. Dorie / Hudson: please read this
// file top to bottom before camp. Most of it should be usable as-is; the
// lines flagged `// REVIEW:` are the ones where a real choice was made that
// you may want to overrule.
//
// Do not change any keys — this file is typed against en.ts's shape
// (`Strings`), and the build fails if the key sets ever diverge.
//
// Two vocabulary decisions applied consistently throughout:
//   - "touch" = a key on the keyboard (from French "touche"; "klavye" =
//     keyboard). Alternative if it reads too technical for younger kids:
//     "bouton".
//   - "dwèt endèks / majè / anilè / ti dwèt / pous" for the five fingers.
//     These are the standard French-derived names. "ti dwèt" (little
//     finger) is used for the pinky rather than the formal "orikilè",
//     which reads medical.
//
// Note: practice content (the words and the verse a child actually TYPES)
// no longer lives in this file at all — see content/days/day1.practice.ts.
// This file is instructions and labels only.

import type { Strings } from "./en";

const ht: Strings = {
  common: {
    // REVIEW: camp name kept as-is; "Typing" dropped rather than appended,
    // since "Kod ak Kreyasyon" stands on its own as the program name.
    appName: "Kod ak Kreyasyon",
    back: "Tounen",
    continue: "Kontinye",
    done: "Fini",
    yes: "Wi",
    no: "Non",
    cancel: "Anile",
    timeLabel: "Tan:",
  },

  languageToggle: {
    label: "Lang",
    en: "Angle",
    ht: "Kreyòl",
  },

  home: {
    label: "Tounen nan ekran kòmansman",
    confirmTitle: "Kite jou sa a?",
    // REVIEW: "poko sove" = "not yet saved". Second sentence says plainly
    // that they would have to start the day again, which is what happens.
    confirmBody: "Jou a poko fini, donk anyen poko sove. Si w kite kounye a, w ap rekòmanse jou sa a.",
    confirmStay: "Kontinye tape",
    confirmLeave: "Kite kanmenm",
  },

  splash: {
    // Not a translation — this is the exact line already printed on the
    // workbook cover, copied verbatim. If the cover ever changes, change
    // this with it.
    tagline: "Senk jou kodaj, kreyasyon, ak Bondye ki fè w la",
    // "touch" = a key on the keyboard, per this file's vocabulary note.
    skipHint: "Peze nenpòt touch",
  },

  startScreen: {
    title: "Kod ak Kreyasyon",
    subtitle: "Tape prenon ou pou kòmanse.",
    // REVIEW: "Ki jan ou rele?" ("what are you called?") is the most
    // natural way to ask a child their name, but it doesn't specify FIRST
    // name. Using "prenon" (first name) instead to stay precise, since the
    // app deliberately collects only a first name.
    nameLabel: "Ki prenon ou?",
    namePlaceholder: "Tape prenon ou",
    existingProfilesLabel: "Ou te deja tape semèn sa a? Peze non ou.",
    isThisYouTitle: "Èske se ou?",
    isThisYouLastDay: "Dènye fwa ou te fini Jou {day}.",
    isThisYouNoProgress: "Ou poko fini yon jou.",
    isThisYouConfirm: "Wi, se mwen",
    isThisYouDeny: "Non, se yon lòt moun",
    dayLabel: "Sou ki jou ou ye?",
    dayOption: "Jou {day}",
    // REVIEW: "Ap vini" ("coming") for days 2-5, not yet built.
    dayComingSoon: "Ap vini",
    levelLabel: "Ki nivo?",
    startButton: "Kòmanse tape",
    nameRequired: "Tape prenon ou anvan.",
    playGamesButton: "Jwe yon jwèt sèlman",
    viewWeekSummaryButton: "Gade semèn mwen",
    setPinTitle: "Chwazi yon kòd 4 chif",
    setPinSubtitle: "W ap tape kòd sa a ankò lòt fwa pou ouvri pwofil ou.",
    enterPinTitle: "Antre kòd ou",
    pinPlaceholder: "0000",
    pinMustBe4Digits: "Antre tout 4 chif yo.",
    pinIncorrect: "Kòd sa a pa bon. Eseye ankò.",
    saveCodeButton: "Sove kòd mwen",
    exportCodeTitle: "Kòd ou",
    exportCodeSubtitle: "Bay pwofesè ou li, oswa ekri li. Tape li nan yon lòt òdinatè pou pote pwogrè sa a tounen.",
    copyCodeButton: "Kopye kòd la",
    codeCopied: "Kopye",
    haveCodeButton: "Ou gen yon kòd ki soti nan yon lòt òdinatè?",
    restoreCodeTitle: "Retabli pwogrè ou",
    restoreCodeSubtitle: "Kole oswa tape kòd ki soti nan lòt òdinatè a.",
    codePlaceholder: "XXXX XXXX XXXX",
    codeEmpty: "Tape oswa kole yon kòd anvan.",
    codeInvalid: "Kòd sa a pa sanble bon — tcheke pou erè epi eseye ankò.",
    restoreWelcome: "Byenveni tounen, {name}.",
    restoreDetail: "Jou {day} fini, nivo {level}.",
    restoreConfirm: "Retabli sa a",
  },

  playScreen: {
    title: "Jwe yon jwèt",
    subtitle: "Rejwe jwèt yon jou ou fin fè — se pou plezi, pa gen anyen ki sove.",
    dayLabel: "Jwèt ki jou?",
    notYetLabel: "Fini jou sa a anvan",
    playButton: "Jwe",
    noneYet: "Fini Jou 1 anvan pou debloke jwèt li isit la.",
    backButton: "Tounen",
    bonusGamesLabel: "Jwèt bonis",
    ninjaGameLabel: "Ninja k ap sote",
    mazeGameLabel: "Labirent",
    starBlasterGameLabel: "Kanon zetwal",
    carRaceGameLabel: "Kous machin",
  },

  levels: {
    starter: { name: "Kòmansè", subtitle: "Premye fwa m ap tape" },
    builder: { name: "Konstriktè", subtitle: "Mwen konn tape deja" },
    // REVIEW: "Flyer" deliberately NOT translated as "Volè" — "vòlè" means
    // thief, and the two are near-homophones in speech, which is a bad
    // thing to call a child. "Zwazo" (bird) keeps the flying idea, is
    // unambiguous, and ties to Day 4's "Soar on Wings" theme. Overrule
    // freely if the team prefers something else.
    flyer: { name: "Zwazo", subtitle: "Mwen deja rapid" },
  },

  teacherControls: {
    skipStage: "Sote etap sa a",
    calmModeOn: "Limen mòd kalm",
    calmModeOff: "Etenn mòd kalm",
  },

  stages: {
    ready: {
      title: "Pare",
      // REVIEW: "ti boul la" = "the little bump" for the tactile ridge on
      // the F and J keys. If teachers have a word they already use with
      // kids for that bump, use theirs instead.
      findLeftBump: "Mete dwèt endèks gòch ou sou F. Santi ti boul la.",
      findRightBump: "Mete dwèt endèks dwat ou sou J. Santi ti boul la.",
      restOfFingers: "Poze lòt dwèt ou yo sou ranje ki jis bò kote yo a.",
      posture: "Chita dwat. Pye ou plat atè. Koud ou lache.",
      continueButton: "Mwen pare",
    },
    newKeys: {
      title: "Nouvo touch",
      instruction: "Ann rankontre nouvo touch jodi a.",
      tryIt: "Eseye l",
      checkpointTitle: "Byen fèt!",
      checkpointMessage: "Ou fèk aprann {keys}.",
      checkpointContinue: "Pwochen touch yo",
      spaceKeyLabel: "Espas",
    },
    wordBuild: {
      title: "Bati mo",
      instruction: "Tape mo sa yo ak sèlman touch ou deja konnen yo.",
    },
    themeChallenge: {
      title: "Defi tèm nan",
      instruction: "Gen kèk lèt ki nouvo — n ap montre ou ki dwèt pou ou sèvi.",
      helperKeyNote: "Lèt ki make yo pa konte kont nòt ou. Yo la sèlman pou mo jodi a.",
    },
    game: {
      title: "Jwèt",
    },
    verseBuilder: {
      title: "Bati vèsè a",
      instruction: "Tape vèsè a. Lèt ki pal yo ap ranpli poukont yo — tape rès la.",
      counter: "Ou tape {typed} sou {total} karaktè poukont ou.",
      comparisonLine: "Jou {day} ou te tape {previous}. Jodi a ou tape {current}.",
      firstTimeLine: "Jodi a ou tape {current} karaktè poukont ou.",
    },
    report: {
      title: "Bon travay",
      wpmLabel: "Mo pa minit",
      accuracyLabel: "Presizyon",
      keysMasteredLabel: "Touch ou metrize",
      // REVIEW: English is "Keys still warming up" — a warm idiom that
      // doesn't calque into Kreyòl. Rendered as "keys that need more
      // practice", which keeps the non-judgmental framing the brief asks
      // for ("never show a failing score") without sounding odd.
      keysWarmingUpLabel: "Touch ki bezwen plis pratik",
      noWeakKeys: "Tout touch ou pratike jodi a solid.",
      // REVIEW: "Meday" (medal) rather than a loanword for "badge" —
      // warmer and instantly clear to a child.
      badgeLabel: "Meday ou genyen",
      // REVIEW: "streak" has no compact Kreyòl equivalent; rendered as
      // "days one after another".
      streakLabel: "Jou youn dèyè lòt",
      badgeShelfLabel: "Meday ou genyen semèn sa a",
      doneButton: "Fini pou jodi a",
    },
    weekSummary: {
      title: "Semèn ou an",
      subtitle: "Senk jou, senk meday — gade jan ou vanse.",
      wpmChartTitle: "Mo pa minit, chak jou",
      accuracyChartTitle: "Presizyon, chak jou",
      dayLabel: "Jou {day}",
      totalPracticeLabel: "Tan pratik total",
      keysMasteredLabel: "Touch ou metrize semèn sa a",
      badgesLabel: "Meday ou genyen",
      finishButton: "Fini",
    },
  },

  typing: {
    // REVIEW: mirrors streakLabel's "one after another" phrasing, applied to
    // a keystroke run rather than a day run.
    streak: "{count} youn apre lòt",
  },

  feedback: {
    // Mirrors the English param roles: {typed} is what came out, {expected}
    // is what was wanted, {finger} is the finger to watch.
    keyNeedsWork: "Ou vle tape {expected}, men se {typed} k ap soti. Veye {finger} ou.",
    retryMessage: "Ann fè yon ti pratik anplis.",
  },

  fingerNames: {
    leftPinky: "ti dwèt gòch",
    leftRing: "dwèt anilè gòch",
    leftMiddle: "dwèt majè gòch",
    leftIndex: "dwèt endèks gòch",
    rightIndex: "dwèt endèks dwat",
    rightMiddle: "dwèt majè dwat",
    rightRing: "dwèt anilè dwat",
    rightPinky: "ti dwèt dwat",
    thumb: "pous",
  },

  sound: {
    toggleOn: "Limen son an",
    toggleOff: "Etenn son an",
  },

  games: {
    day1NameAnimator: {
      instruction: "Tape non ou. Chak lèt ap tonbe epi limen.",
    },
    day2CharacterBuilder: {
      instruction: "Tape chak mo pou ajoute pati sa a. Chak detay gen yon rezon.",
    },
    day3WorldBuilder: {
      instruction: "Tape yon mo epi gade l parèt. Bati mond pa ou.",
    },
    // REVIEW: "kout zèl" = wingbeat. The second sentence is deliberately
    // reassuring — the eagle never falls, and a slower child should not read
    // this as a race (see the comment in components/games/SoarGame.tsx).
    day4Soar: {
      instruction: "Chak mo se yon kout zèl. Pran tan ou — malfini an toujou ap monte.",
    },
    day5FindTheSheep: {
      instruction: "Tape chak mo pou kontinye chache. Gadò a toujou jwenn mouton ki pèdi a.",
    },
    ninjaFlight: {
      instruction: "Tape chak lèt pou voye ninja a sote rive nan drapo a.",
    },
    mazeRunner: {
      instruction: "Tape chak lèt pou avanse nan laberent rive nan pòt la.",
    },
    starBlaster: {
      instruction: "Tape chak lèt pou eksploze pwochen zetwal la nan syèl la.",
    },
    carRace: {
      instruction: "Tape chak lèt pou kondwi rive nan drapo damye a.",
    },
  },

  progress: {
    stageOf: "Etap {current} sou {total}",
  },
};

export default ht;
