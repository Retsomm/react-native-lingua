import mascotPinkCreature from "../assets/images/mascot-pink-creature.png";
import earth from "../assets/images/earth.png";
import earthCropped from "../assets/images/EarthCropped.png";
import palace from "../assets/images/palace.png";
import streakFire from "../assets/images/streak-fire.png";
import treasure from "../assets/images/treasure.png";
import lessonCafeSceneMascot from "../assets/images/lesson-cafe-scene-mascot.png";
import lessonHomeBackground from "../assets/images/lesson-home-background.png";
import chineseFlag from "../assets/images/flags/chinese.png";
import englishFlag from "../assets/images/flags/english.png";
import frenchFlag from "../assets/images/flags/french.png";
import japaneseFlag from "../assets/images/flags/japanese.png";
import koreanFlag from "../assets/images/flags/korean.png";
import spanishFlag from "../assets/images/flags/spanish.png";

export const images = {
  earth,
  earthCropped,
  flags: {
    chinese: chineseFlag,
    english: englishFlag,
    french: frenchFlag,
    japanese: japaneseFlag,
    korean: koreanFlag,
    spanish: spanishFlag,
  },
  aiTeacherFoxSweater: mascotPinkCreature,
  mascotAuth: mascotPinkCreature,
  mascotLogo: mascotPinkCreature,
  mascotWelcome: mascotPinkCreature,
  palace,
  streakFire,
  teacherPortrait: mascotPinkCreature,
  treasure,
  lessonArt: {
    cafe: lessonCafeSceneMascot,
    cafeScene: lessonCafeSceneMascot,
    completed: mascotPinkCreature,
    homeBackground: lessonHomeBackground,
    inProgress: treasure,
    notStarted: palace,
    practice: earth,
  },
};
