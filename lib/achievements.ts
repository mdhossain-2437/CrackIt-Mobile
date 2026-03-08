import type { UserData, ExamType } from "./questions";

export interface AchievementDefinition {
  key: string;
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
  icon: string;
  category: "milestone" | "streak" | "accuracy" | "speed" | "social" | "special";
  condition: string;
  threshold: number;
  xpReward: number;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    key: "first_question",
    name: "First Step",
    nameBn: "প্রথম পদক্ষেপ",
    description: "Answer your first question",
    descriptionBn: "তোমার প্রথম প্রশ্নের উত্তর দাও",
    icon: "flag",
    category: "milestone",
    condition: "total_questions",
    threshold: 1,
    xpReward: 10,
    rarity: "common",
  },
  {
    key: "ten_questions",
    name: "Getting Started",
    nameBn: "শুরু হলো",
    description: "Answer 10 questions",
    descriptionBn: "১০টি প্রশ্নের উত্তর দাও",
    icon: "trending-up",
    category: "milestone",
    condition: "total_questions",
    threshold: 10,
    xpReward: 25,
    rarity: "common",
  },
  {
    key: "fifty_questions",
    name: "Half Century",
    nameBn: "অর্ধশতক",
    description: "Answer 50 questions",
    descriptionBn: "৫০টি প্রশ্নের উত্তর দাও",
    icon: "star",
    category: "milestone",
    condition: "total_questions",
    threshold: 50,
    xpReward: 50,
    rarity: "common",
  },
  {
    key: "hundred_questions",
    name: "Centurion",
    nameBn: "শতক",
    description: "Answer 100 questions",
    descriptionBn: "১০০টি প্রশ্নের উত্তর দাও",
    icon: "medal",
    category: "milestone",
    condition: "total_questions",
    threshold: 100,
    xpReward: 100,
    rarity: "uncommon",
  },
  {
    key: "five_hundred_questions",
    name: "Knowledge Seeker",
    nameBn: "জ্ঞান অন্বেষী",
    description: "Answer 500 questions",
    descriptionBn: "৫০০টি প্রশ্নের উত্তর দাও",
    icon: "school",
    category: "milestone",
    condition: "total_questions",
    threshold: 500,
    xpReward: 250,
    rarity: "rare",
  },
  {
    key: "thousand_questions",
    name: "Scholar",
    nameBn: "পণ্ডিত",
    description: "Answer 1000 questions",
    descriptionBn: "১০০০টি প্রশ্নের উত্তর দাও",
    icon: "ribbon",
    category: "milestone",
    condition: "total_questions",
    threshold: 1000,
    xpReward: 500,
    rarity: "epic",
  },
  {
    key: "two_thousand_questions",
    name: "Grandmaster",
    nameBn: "গ্র্যান্ডমাস্টার",
    description: "Answer 2000 questions",
    descriptionBn: "২০০০টি প্রশ্নের উত্তর দাও",
    icon: "trophy",
    category: "milestone",
    condition: "total_questions",
    threshold: 2000,
    xpReward: 1000,
    rarity: "legendary",
  },
  {
    key: "streak_3",
    name: "Consistent",
    nameBn: "ধারাবাহিক",
    description: "Maintain a 3-day streak",
    descriptionBn: "৩ দিনের ধারাবাহিকতা বজায় রাখো",
    icon: "flame",
    category: "streak",
    condition: "streak",
    threshold: 3,
    xpReward: 30,
    rarity: "common",
  },
  {
    key: "streak_7",
    name: "Week Warrior",
    nameBn: "সাপ্তাহিক যোদ্ধা",
    description: "Maintain a 7-day streak",
    descriptionBn: "৭ দিনের ধারাবাহিকতা বজায় রাখো",
    icon: "flame",
    category: "streak",
    condition: "streak",
    threshold: 7,
    xpReward: 75,
    rarity: "uncommon",
  },
  {
    key: "streak_14",
    name: "Fortnight Focus",
    nameBn: "পাক্ষিক মনোযোগ",
    description: "Maintain a 14-day streak",
    descriptionBn: "১৪ দিনের ধারাবাহিকতা বজায় রাখো",
    icon: "flame",
    category: "streak",
    condition: "streak",
    threshold: 14,
    xpReward: 150,
    rarity: "rare",
  },
  {
    key: "streak_30",
    name: "Monthly Master",
    nameBn: "মাসিক মাস্টার",
    description: "Maintain a 30-day streak",
    descriptionBn: "৩০ দিনের ধারাবাহিকতা বজায় রাখো",
    icon: "flame",
    category: "streak",
    condition: "streak",
    threshold: 30,
    xpReward: 300,
    rarity: "epic",
  },
  {
    key: "streak_100",
    name: "Unstoppable",
    nameBn: "অপ্রতিরোধ্য",
    description: "Maintain a 100-day streak",
    descriptionBn: "১০০ দিনের ধারাবাহিকতা বজায় রাখো",
    icon: "flame",
    category: "streak",
    condition: "streak",
    threshold: 100,
    xpReward: 1000,
    rarity: "legendary",
  },
  {
    key: "perfect_5",
    name: "Sharp Mind",
    nameBn: "তীক্ষ্ণ মন",
    description: "Get a perfect score with 5+ questions",
    descriptionBn: "৫+ প্রশ্নে পূর্ণ নম্বর পাও",
    icon: "checkmark-done",
    category: "accuracy",
    condition: "perfect_score_min_questions",
    threshold: 5,
    xpReward: 50,
    rarity: "uncommon",
  },
  {
    key: "perfect_10",
    name: "Flawless",
    nameBn: "নিখুঁত",
    description: "Get a perfect score with 10+ questions",
    descriptionBn: "১০+ প্রশ্নে পূর্ণ নম্বর পাও",
    icon: "checkmark-done",
    category: "accuracy",
    condition: "perfect_score_min_questions",
    threshold: 10,
    xpReward: 100,
    rarity: "rare",
  },
  {
    key: "perfect_20",
    name: "Perfectionist",
    nameBn: "পরিপূর্ণতাবাদী",
    description: "Get a perfect score with 20+ questions",
    descriptionBn: "২০+ প্রশ্নে পূর্ণ নম্বর পাও",
    icon: "diamond",
    category: "accuracy",
    condition: "perfect_score_min_questions",
    threshold: 20,
    xpReward: 250,
    rarity: "epic",
  },
  {
    key: "accuracy_80",
    name: "Accurate",
    nameBn: "নির্ভুল",
    description: "Achieve 80% overall accuracy (50+ questions)",
    descriptionBn: "৮০% সামগ্রিক নির্ভুলতা অর্জন করো (৫০+ প্রশ্ন)",
    icon: "analytics",
    category: "accuracy",
    condition: "overall_accuracy",
    threshold: 80,
    xpReward: 100,
    rarity: "uncommon",
  },
  {
    key: "accuracy_90",
    name: "Expert",
    nameBn: "বিশেষজ্ঞ",
    description: "Achieve 90% overall accuracy (100+ questions)",
    descriptionBn: "৯০% সামগ্রিক নির্ভুলতা অর্জন করো (১০০+ প্রশ্ন)",
    icon: "analytics",
    category: "accuracy",
    condition: "overall_accuracy",
    threshold: 90,
    xpReward: 250,
    rarity: "rare",
  },
  {
    key: "speed_demon",
    name: "Speed Demon",
    nameBn: "গতির রাক্ষস",
    description: "Complete a speed round with 80%+ accuracy",
    descriptionBn: "৮০%+ নির্ভুলতায় স্পিড রাউন্ড সম্পন্ন করো",
    icon: "flash",
    category: "speed",
    condition: "speed_round_accuracy",
    threshold: 80,
    xpReward: 75,
    rarity: "uncommon",
  },
  {
    key: "marathon_runner",
    name: "Marathon Runner",
    nameBn: "ম্যারাথন রানার",
    description: "Answer 50+ questions in one session",
    descriptionBn: "একটি সেশনে ৫০+ প্রশ্নের উত্তর দাও",
    icon: "walk",
    category: "milestone",
    condition: "session_questions",
    threshold: 50,
    xpReward: 100,
    rarity: "rare",
  },
  {
    key: "night_owl",
    name: "Night Owl",
    nameBn: "রাতের পেঁচা",
    description: "Study after 11 PM",
    descriptionBn: "রাত ১১টার পরে পড়াশোনা করো",
    icon: "moon",
    category: "special",
    condition: "study_hour",
    threshold: 23,
    xpReward: 25,
    rarity: "common",
  },
  {
    key: "early_bird",
    name: "Early Bird",
    nameBn: "ভোরের পাখি",
    description: "Study before 6 AM",
    descriptionBn: "সকাল ৬টার আগে পড়াশোনা করো",
    icon: "sunny",
    category: "special",
    condition: "study_hour_before",
    threshold: 6,
    xpReward: 25,
    rarity: "common",
  },
  {
    key: "subject_master",
    name: "Subject Master",
    nameBn: "বিষয়ের মাস্টার",
    description: "Achieve 90%+ accuracy in any subject (30+ questions)",
    descriptionBn: "যেকোনো বিষয়ে ৯০%+ নির্ভুলতা অর্জন করো (৩০+ প্রশ্ন)",
    icon: "school",
    category: "accuracy",
    condition: "subject_accuracy",
    threshold: 90,
    xpReward: 200,
    rarity: "rare",
  },
  {
    key: "all_rounder",
    name: "All-Rounder",
    nameBn: "সর্বগুণী",
    description: "Practice at least 5 different subjects",
    descriptionBn: "কমপক্ষে ৫টি ভিন্ন বিষয়ে অনুশীলন করো",
    icon: "apps",
    category: "milestone",
    condition: "subjects_practiced",
    threshold: 5,
    xpReward: 75,
    rarity: "uncommon",
  },
  {
    key: "community_contributor",
    name: "Community Contributor",
    nameBn: "সম্প্রদায়ের অবদানকারী",
    description: "Create your first community question",
    descriptionBn: "তোমার প্রথম সম্প্রদায়ের প্রশ্ন তৈরি করো",
    icon: "people",
    category: "social",
    condition: "community_questions_created",
    threshold: 1,
    xpReward: 50,
    rarity: "uncommon",
  },
  {
    key: "xp_1000",
    name: "Rising Star",
    nameBn: "উদীয়মান তারকা",
    description: "Earn 1000 XP",
    descriptionBn: "১০০০ এক্সপি অর্জন করো",
    icon: "star",
    category: "milestone",
    condition: "xp",
    threshold: 1000,
    xpReward: 50,
    rarity: "uncommon",
  },
  {
    key: "xp_5000",
    name: "Superstar",
    nameBn: "সুপারস্টার",
    description: "Earn 5000 XP",
    descriptionBn: "৫০০০ এক্সপি অর্জন করো",
    icon: "star",
    category: "milestone",
    condition: "xp",
    threshold: 5000,
    xpReward: 150,
    rarity: "rare",
  },
  {
    key: "xp_10000",
    name: "Legend",
    nameBn: "কিংবদন্তী",
    description: "Earn 10000 XP",
    descriptionBn: "১০০০০ এক্সপি অর্জন করো",
    icon: "star",
    category: "milestone",
    condition: "xp",
    threshold: 10000,
    xpReward: 500,
    rarity: "epic",
  },
];

export interface CheckResult {
  newlyEarned: AchievementDefinition[];
  totalXpEarned: number;
}

export function checkAchievements(
  userData: UserData,
  earnedKeys: Set<string>,
  context?: {
    sessionQuestions?: number;
    sessionAccuracy?: number;
    practiceMode?: string;
    perfectScore?: boolean;
    totalQuestionsInSession?: number;
  }
): CheckResult {
  const newlyEarned: AchievementDefinition[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (earnedKeys.has(achievement.key)) continue;

    let earned = false;

    switch (achievement.condition) {
      case "total_questions":
        earned = userData.totalQuestionsSolved >= achievement.threshold;
        break;
      case "streak":
        earned = userData.streak >= achievement.threshold;
        break;
      case "overall_accuracy":
        if (userData.totalQuestionsSolved >= (achievement.threshold >= 90 ? 100 : 50)) {
          const accuracy = (userData.totalCorrect / userData.totalQuestionsSolved) * 100;
          earned = accuracy >= achievement.threshold;
        }
        break;
      case "perfect_score_min_questions":
        if (context?.perfectScore && context.totalQuestionsInSession) {
          earned = context.totalQuestionsInSession >= achievement.threshold;
        }
        break;
      case "speed_round_accuracy":
        if (context?.practiceMode === "speed" && context.sessionAccuracy) {
          earned = context.sessionAccuracy >= achievement.threshold;
        }
        break;
      case "session_questions":
        if (context?.sessionQuestions) {
          earned = context.sessionQuestions >= achievement.threshold;
        }
        break;
      case "study_hour": {
        const hour = new Date().getHours();
        earned = hour >= achievement.threshold;
        break;
      }
      case "study_hour_before": {
        const hourBefore = new Date().getHours();
        earned = hourBefore < achievement.threshold;
        break;
      }
      case "subject_accuracy": {
        for (const [key, progress] of Object.entries(userData.subjectProgress)) {
          if (progress.total >= 30) {
            const acc = (progress.correct / progress.total) * 100;
            if (acc >= achievement.threshold) {
              earned = true;
              break;
            }
          }
        }
        break;
      }
      case "subjects_practiced": {
        const subjects = new Set<string>();
        for (const key of Object.keys(userData.topicProgress)) {
          const [subject] = key.split("::");
          if (subject) subjects.add(subject);
        }
        earned = subjects.size >= achievement.threshold;
        break;
      }
      case "xp":
        earned = userData.xp >= achievement.threshold;
        break;
    }

    if (earned) {
      newlyEarned.push(achievement);
    }
  }

  const totalXpEarned = newlyEarned.reduce((sum, a) => sum + a.xpReward, 0);
  return { newlyEarned, totalXpEarned };
}

export function getAchievementProgress(
  userData: UserData,
  achievement: AchievementDefinition
): number {
  switch (achievement.condition) {
    case "total_questions":
      return Math.min(1, userData.totalQuestionsSolved / achievement.threshold);
    case "streak":
      return Math.min(1, userData.streak / achievement.threshold);
    case "overall_accuracy": {
      if (userData.totalQuestionsSolved === 0) return 0;
      const accuracy = (userData.totalCorrect / userData.totalQuestionsSolved) * 100;
      return Math.min(1, accuracy / achievement.threshold);
    }
    case "xp":
      return Math.min(1, userData.xp / achievement.threshold);
    case "subjects_practiced": {
      const subjects = new Set<string>();
      for (const key of Object.keys(userData.topicProgress)) {
        const [subject] = key.split("::");
        if (subject) subjects.add(subject);
      }
      return Math.min(1, subjects.size / achievement.threshold);
    }
    default:
      return 0;
  }
}

export function getRarityColor(rarity: AchievementDefinition["rarity"]): string {
  switch (rarity) {
    case "common": return "#78909C";
    case "uncommon": return "#43A047";
    case "rare": return "#1E88E5";
    case "epic": return "#8E24AA";
    case "legendary": return "#FF6F00";
  }
}
