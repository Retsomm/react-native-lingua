import mascotLogo from "../assets/images/mascot-logo.png";
import mascotAuth from "../assets/images/mascot-auth.png";
import mascotWelcome from "../assets/images/mascot-welcome.png";
import aiTeacherFoxSweater from "../assets/images/ai-teacher-fox-sweater.png";
import earth from "../assets/images/earth.png";
import earthCropped from "../assets/images/EarthCropped.png";
import palace from "../assets/images/palace.png";
import streakFire from "../assets/images/streak-fire.png";
import treasure from "../assets/images/treasure.png";
import lessonCafeScene from "../assets/images/lesson-cafe-scene.png";
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
  aiTeacherFoxSweater,
  mascotAuth,
  mascotLogo,
  mascotWelcome,
  palace,
  streakFire,
  teacherPortrait: mascotAuth,
  treasure,
  lessonArt: {
    cafe: {
      uri: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=900&auto=format&fit=crop",
    },
    cafeScene: lessonCafeScene,
    completed: mascotLogo,
    homeBackground: lessonHomeBackground,
    inProgress: treasure,
    notStarted: palace,
    practice: earth,
  },
};
