import type { Language } from "./i18n";

export type ExamType = "bcs" | "medical" | "engineering" | "university" | "ssc" | "hsc" | "jsc" | "psc" | "madrasah";
export type Difficulty = "easy" | "medium" | "hard";
export type PracticeMode = "relaxed" | "timed" | "speed" | "marathon";

export interface Question {
  id: string;
  examType: ExamType;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  language: Language;
}

export interface SubjectInfo {
  id: string;
  name: string;
  nameBn: string;
  icon: string;
  color: string;
  topics: string[];
  topicsBn: string[];
}

export interface ExamTypeInfo {
  id: ExamType;
  name: string;
  nameBn: string;
  icon: string;
  description: string;
  descriptionBn: string;
  category: "competitive" | "board";
  subjects: SubjectInfo[];
}

export interface ExamConfig {
  subject: string;
  topic?: string;
  difficulty?: Difficulty;
  count: number;
  timePerQuestion: number;
  questions: Question[];
  adaptive?: boolean;
  practiceMode?: PracticeMode;
}

export interface ExamAnswer {
  questionId: string;
  selectedOption: number | null;
  timeSpent: number;
  markedForReview: boolean;
}

export interface ExamResult {
  id: string;
  date: string;
  subject: string;
  topic?: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skipped: number;
  totalTime: number;
  answers: ExamAnswer[];
  questions: Question[];
  score: number;
  adaptive?: boolean;
  difficultyProgression?: Difficulty[];
  practiceMode?: PracticeMode;
}

export interface SubjectProgress {
  total: number;
  correct: number;
}

export interface TopicProgress {
  total: number;
  correct: number;
  lastPracticed: string;
  consecutiveCorrect: number;
}

export interface UserData {
  examType: ExamType;
  streak: number;
  lastPracticeDate: string;
  totalQuestionsSolved: number;
  totalCorrect: number;
  subjectProgress: Record<string, SubjectProgress>;
  topicProgress: Record<string, TopicProgress>;
  examHistory: ExamResult[];
  onboarded: boolean;
  xp: number;
  language: Language;
}

export const EXAM_TYPES: ExamTypeInfo[] = [
  {
    id: "bcs", name: "BCS", nameBn: "বিসিএস", icon: "briefcase-outline",
    description: "Bangladesh Civil Service", descriptionBn: "বাংলাদেশ সিভিল সার্ভিস", category: "competitive",
    subjects: [
      { id: "bd-affairs", name: "Bangladesh Affairs", nameBn: "বাংলাদেশ বিষয়াবলী", icon: "flag-outline", color: "#E53935", topics: ["Liberation War", "Constitution", "Geography", "Economy"], topicsBn: ["মুক্তিযুদ্ধ", "সংবিধান", "ভূগোল", "অর্থনীতি"] },
      { id: "english", name: "English", nameBn: "ইংরেজি", icon: "chatbubble-ellipses-outline", color: "#1565C0", topics: ["Grammar", "Vocabulary", "Comprehension"], topicsBn: ["ব্যাকরণ", "শব্দভান্ডার", "বোধগম্যতা"] },
      { id: "bangla", name: "Bangla", nameBn: "বাংলা", icon: "book-outline", color: "#D84315", topics: ["Grammar", "Literature"], topicsBn: ["ব্যাকরণ", "সাহিত্য"] },
      { id: "gen-science", name: "General Science", nameBn: "সাধারণ বিজ্ঞান", icon: "flask-outline", color: "#00897B", topics: ["Biology", "Physics", "Chemistry"], topicsBn: ["জীববিজ্ঞান", "পদার্থবিজ্ঞান", "রসায়ন"] },
      { id: "math-reasoning", name: "Mathematics", nameBn: "গণিত", icon: "calculator-outline", color: "#6A1B9A", topics: ["Arithmetic", "Algebra", "Geometry"], topicsBn: ["পাটিগণিত", "বীজগণিত", "জ্যামিতি"] },
      { id: "intl-affairs", name: "International Affairs", nameBn: "আন্তর্জাতিক বিষয়াবলী", icon: "globe-outline", color: "#00838F", topics: ["Organizations", "Current Affairs"], topicsBn: ["সংস্থাসমূহ", "সাম্প্রতিক বিষয়"] },
      { id: "computer", name: "Computer & IT", nameBn: "কম্পিউটার ও আইসিটি", icon: "desktop-outline", color: "#37474F", topics: ["Basics", "Networking", "Programming"], topicsBn: ["মৌলিক", "নেটওয়ার্কিং", "প্রোগ্রামিং"] },
    ],
  },
  {
    id: "medical", name: "Medical", nameBn: "মেডিকেল", icon: "medkit-outline",
    description: "Medical Admission", descriptionBn: "মেডিকেল ভর্তি", category: "competitive",
    subjects: [
      { id: "biology", name: "Biology", nameBn: "জীববিজ্ঞান", icon: "leaf-outline", color: "#2E7D32", topics: ["Cell Biology", "Genetics", "Human Physiology", "Botany", "Zoology", "Ecology"], topicsBn: ["কোষবিদ্যা", "জিনতত্ত্ব", "মানবদেহতত্ত্ব", "উদ্ভিদবিদ্যা", "প্রাণিবিদ্যা", "বাস্তুবিদ্যা"] },
      { id: "chemistry", name: "Chemistry", nameBn: "রসায়ন", icon: "color-filter-outline", color: "#EF6C00", topics: ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry"], topicsBn: ["জৈব রসায়ন", "অজৈব রসায়ন", "ভৌত রসায়ন"] },
      { id: "physics", name: "Physics", nameBn: "পদার্থবিজ্ঞান", icon: "flash-outline", color: "#0277BD", topics: ["Mechanics", "Optics", "Electricity", "Thermodynamics"], topicsBn: ["বলবিদ্যা", "আলোকবিজ্ঞান", "তড়িৎবিদ্যা", "তাপগতিবিদ্যা"] },
    ],
  },
  {
    id: "engineering", name: "Engineering", nameBn: "ইঞ্জিনিয়ারিং", icon: "construct-outline",
    description: "Engineering Admission", descriptionBn: "ইঞ্জিনিয়ারিং ভর্তি", category: "competitive",
    subjects: [
      { id: "eng-math", name: "Mathematics", nameBn: "গণিত", icon: "calculator-outline", color: "#6A1B9A", topics: ["Calculus", "Algebra", "Trigonometry", "Coordinate Geometry"], topicsBn: ["ক্যালকুলাস", "বীজগণিত", "ত্রিকোণমিতি", "স্থানাঙ্ক জ্যামিতি"] },
      { id: "eng-physics", name: "Physics", nameBn: "পদার্থবিজ্ঞান", icon: "flash-outline", color: "#0277BD", topics: ["Mechanics", "Waves", "Electromagnetism", "Modern Physics"], topicsBn: ["বলবিদ্যা", "তরঙ্গ", "তড়িৎচুম্বকত্ব", "আধুনিক পদার্থবিজ্ঞান"] },
      { id: "eng-chemistry", name: "Chemistry", nameBn: "রসায়ন", icon: "color-filter-outline", color: "#EF6C00", topics: ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry"], topicsBn: ["জৈব রসায়ন", "অজৈব রসায়ন", "ভৌত রসায়ন"] },
    ],
  },
  {
    id: "university", name: "University", nameBn: "বিশ্ববিদ্যালয়", icon: "school-outline",
    description: "University Admission", descriptionBn: "বিশ্ববিদ্যালয় ভর্তি", category: "competitive",
    subjects: [
      { id: "uni-english", name: "English", nameBn: "ইংরেজি", icon: "chatbubble-ellipses-outline", color: "#1565C0", topics: ["Grammar", "Vocabulary", "Reading Comprehension"], topicsBn: ["ব্যাকরণ", "শব্দভান্ডার", "পড়ে বোঝা"] },
      { id: "uni-bangla", name: "Bangla", nameBn: "বাংলা", icon: "book-outline", color: "#D84315", topics: ["Grammar", "Literature"], topicsBn: ["ব্যাকরণ", "সাহিত্য"] },
      { id: "uni-gk", name: "General Knowledge", nameBn: "সাধারণ জ্ঞান", icon: "bulb-outline", color: "#AD1457", topics: ["Bangladesh", "International", "Science & Tech"], topicsBn: ["বাংলাদেশ", "আন্তর্জাতিক", "বিজ্ঞান ও প্রযুক্তি"] },
      { id: "uni-math", name: "Mathematics", nameBn: "গণিত", icon: "calculator-outline", color: "#6A1B9A", topics: ["Algebra", "Geometry", "Arithmetic"], topicsBn: ["বীজগণিত", "জ্যামিতি", "পাটিগণিত"] },
    ],
  },
  {
    id: "ssc", name: "SSC", nameBn: "এসএসসি", icon: "ribbon-outline",
    description: "Secondary School Certificate", descriptionBn: "মাধ্যমিক স্কুল সার্টিফিকেট", category: "board",
    subjects: [
      { id: "ssc-bangla", name: "Bangla", nameBn: "বাংলা", icon: "book-outline", color: "#D84315", topics: ["Grammar", "Literature", "Composition"], topicsBn: ["ব্যাকরণ", "সাহিত্য", "রচনা"] },
      { id: "ssc-english", name: "English", nameBn: "ইংরেজি", icon: "chatbubble-ellipses-outline", color: "#1565C0", topics: ["Grammar", "Vocabulary", "Comprehension"], topicsBn: ["ব্যাকরণ", "শব্দভান্ডার", "বোধগম্যতা"] },
      { id: "ssc-math", name: "Mathematics", nameBn: "গণিত", icon: "calculator-outline", color: "#6A1B9A", topics: ["Algebra", "Geometry", "Arithmetic", "Trigonometry", "Statistics"], topicsBn: ["বীজগণিত", "জ্যামিতি", "পাটিগণিত", "ত্রিকোণমিতি", "পরিসংখ্যান"] },
      { id: "ssc-gen-science", name: "General Science", nameBn: "সাধারণ বিজ্ঞান", icon: "flask-outline", color: "#00897B", topics: ["Biology", "Physics", "Chemistry"], topicsBn: ["জীববিজ্ঞান", "পদার্থবিজ্ঞান", "রসায়ন"] },
      { id: "ssc-physics", name: "Physics", nameBn: "পদার্থবিজ্ঞান", icon: "flash-outline", color: "#0277BD", topics: ["Mechanics", "Light", "Sound", "Heat", "Electricity"], topicsBn: ["বলবিদ্যা", "আলো", "শব্দ", "তাপ", "তড়িৎবিদ্যা"] },
      { id: "ssc-chemistry", name: "Chemistry", nameBn: "রসায়ন", icon: "color-filter-outline", color: "#EF6C00", topics: ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry"], topicsBn: ["জৈব রসায়ন", "অজৈব রসায়ন", "ভৌত রসায়ন"] },
      { id: "ssc-biology", name: "Biology", nameBn: "জীববিজ্ঞান", icon: "leaf-outline", color: "#2E7D32", topics: ["Cell Biology", "Human Physiology", "Botany", "Ecology"], topicsBn: ["কোষবিদ্যা", "মানবদেহতত্ত্ব", "উদ্ভিদবিদ্যা", "বাস্তুবিদ্যা"] },
      { id: "ssc-higher-math", name: "Higher Mathematics", nameBn: "উচ্চতর গণিত", icon: "calculator-outline", color: "#4A148C", topics: ["Set Theory", "Algebra", "Trigonometry", "Coordinate Geometry"], topicsBn: ["সেট তত্ত্ব", "বীজগণিত", "ত্রিকোণমিতি", "স্থানাঙ্ক জ্যামিতি"] },
      { id: "ssc-bd-global", name: "Bangladesh & Global Studies", nameBn: "বাংলাদেশ ও বিশ্বপরিচয়", icon: "globe-outline", color: "#00838F", topics: ["History", "Geography", "Economy", "Current Affairs"], topicsBn: ["ইতিহাস", "ভূগোল", "অর্থনীতি", "সাম্প্রতিক বিষয়"] },
      { id: "ssc-ict", name: "ICT", nameBn: "আইসিটি", icon: "desktop-outline", color: "#37474F", topics: ["Basics", "Networking", "Programming"], topicsBn: ["মৌলিক", "নেটওয়ার্কিং", "প্রোগ্রামিং"] },
    ],
  },
  {
    id: "hsc", name: "HSC", nameBn: "এইচএসসি", icon: "trophy-outline",
    description: "Higher Secondary Certificate", descriptionBn: "উচ্চ মাধ্যমিক সার্টিফিকেট", category: "board",
    subjects: [
      { id: "hsc-bangla", name: "Bangla", nameBn: "বাংলা", icon: "book-outline", color: "#D84315", topics: ["Grammar", "Literature", "Composition"], topicsBn: ["ব্যাকরণ", "সাহিত্য", "রচনা"] },
      { id: "hsc-english", name: "English", nameBn: "ইংরেজি", icon: "chatbubble-ellipses-outline", color: "#1565C0", topics: ["Grammar", "Vocabulary", "Reading Comprehension"], topicsBn: ["ব্যাকরণ", "শব্দভান্ডার", "পড়ে বোঝা"] },
      { id: "hsc-physics", name: "Physics", nameBn: "পদার্থবিজ্ঞান", icon: "flash-outline", color: "#0277BD", topics: ["Mechanics", "Waves", "Optics", "Electricity", "Modern Physics"], topicsBn: ["বলবিদ্যা", "তরঙ্গ", "আলোকবিজ্ঞান", "তড়িৎবিদ্যা", "আধুনিক পদার্থবিজ্ঞান"] },
      { id: "hsc-chemistry", name: "Chemistry", nameBn: "রসায়ন", icon: "color-filter-outline", color: "#EF6C00", topics: ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry"], topicsBn: ["জৈব রসায়ন", "অজৈব রসায়ন", "ভৌত রসায়ন"] },
      { id: "hsc-biology", name: "Biology", nameBn: "জীববিজ্ঞান", icon: "leaf-outline", color: "#2E7D32", topics: ["Cell Biology", "Genetics", "Human Physiology", "Botany", "Ecology"], topicsBn: ["কোষবিদ্যা", "জিনতত্ত্ব", "মানবদেহতত্ত্ব", "উদ্ভিদবিদ্যা", "বাস্তুবিদ্যা"] },
      { id: "hsc-higher-math", name: "Higher Mathematics", nameBn: "উচ্চতর গণিত", icon: "calculator-outline", color: "#4A148C", topics: ["Calculus", "Algebra", "Trigonometry", "Coordinate Geometry", "Statistics"], topicsBn: ["ক্যালকুলাস", "বীজগণিত", "ত্রিকোণমিতি", "স্থানাঙ্ক জ্যামিতি", "পরিসংখ্যান"] },
      { id: "hsc-ict", name: "ICT", nameBn: "আইসিটি", icon: "desktop-outline", color: "#37474F", topics: ["Basics", "Networking", "Programming"], topicsBn: ["মৌলিক", "নেটওয়ার্কিং", "প্রোগ্রামিং"] },
      { id: "hsc-economics", name: "Economics", nameBn: "অর্থনীতি", icon: "trending-up-outline", color: "#558B2F", topics: ["Basics", "Economy"], topicsBn: ["মৌলিক", "অর্থনীতি"] },
      { id: "hsc-accounting", name: "Accounting", nameBn: "হিসাববিজ্ঞান", icon: "document-text-outline", color: "#5D4037", topics: ["Basics", "General"], topicsBn: ["মৌলিক", "সাধারণ"] },
    ],
  },
  {
    id: "jsc", name: "JSC", nameBn: "জেএসসি", icon: "medal-outline",
    description: "Junior School Certificate", descriptionBn: "জুনিয়র স্কুল সার্টিফিকেট", category: "board",
    subjects: [
      { id: "jsc-bangla", name: "Bangla", nameBn: "বাংলা", icon: "book-outline", color: "#D84315", topics: ["Grammar", "Literature"], topicsBn: ["ব্যাকরণ", "সাহিত্য"] },
      { id: "jsc-english", name: "English", nameBn: "ইংরেজি", icon: "chatbubble-ellipses-outline", color: "#1565C0", topics: ["Grammar", "Vocabulary", "Comprehension"], topicsBn: ["ব্যাকরণ", "শব্দভান্ডার", "বোধগম্যতা"] },
      { id: "jsc-math", name: "Mathematics", nameBn: "গণিত", icon: "calculator-outline", color: "#6A1B9A", topics: ["Arithmetic", "Algebra", "Geometry"], topicsBn: ["পাটিগণিত", "বীজগণিত", "জ্যামিতি"] },
      { id: "jsc-science", name: "Science", nameBn: "বিজ্ঞান", icon: "flask-outline", color: "#00897B", topics: ["Biology", "Physics", "Chemistry"], topicsBn: ["জীববিজ্ঞান", "পদার্থবিজ্ঞান", "রসায়ন"] },
      { id: "jsc-bd-global", name: "Bangladesh & Global Studies", nameBn: "বাংলাদেশ ও বিশ্বপরিচয়", icon: "globe-outline", color: "#00838F", topics: ["History", "Geography"], topicsBn: ["ইতিহাস", "ভূগোল"] },
      { id: "jsc-ict", name: "ICT", nameBn: "আইসিটি", icon: "desktop-outline", color: "#37474F", topics: ["Basics"], topicsBn: ["মৌলিক"] },
    ],
  },
  {
    id: "psc", name: "PSC", nameBn: "পিএসসি", icon: "star-outline",
    description: "Primary School Certificate", descriptionBn: "প্রাথমিক শিক্ষা সমাপনী", category: "board",
    subjects: [
      { id: "psc-bangla", name: "Bangla", nameBn: "বাংলা", icon: "book-outline", color: "#D84315", topics: ["Grammar", "Literature"], topicsBn: ["ব্যাকরণ", "সাহিত্য"] },
      { id: "psc-english", name: "English", nameBn: "ইংরেজি", icon: "chatbubble-ellipses-outline", color: "#1565C0", topics: ["Grammar", "Vocabulary"], topicsBn: ["ব্যাকরণ", "শব্দভান্ডার"] },
      { id: "psc-math", name: "Mathematics", nameBn: "গণিত", icon: "calculator-outline", color: "#6A1B9A", topics: ["Arithmetic", "Geometry", "Measurement"], topicsBn: ["পাটিগণিত", "জ্যামিতি", "পরিমাপ"] },
      { id: "psc-science", name: "Science", nameBn: "বিজ্ঞান", icon: "flask-outline", color: "#00897B", topics: ["Environment", "General"], topicsBn: ["পরিবেশ", "সাধারণ"] },
      { id: "psc-bd-global", name: "Bangladesh & Global Studies", nameBn: "বাংলাদেশ ও বিশ্বপরিচয়", icon: "globe-outline", color: "#00838F", topics: ["Bangladesh", "History"], topicsBn: ["বাংলাদেশ", "ইতিহাস"] },
    ],
  },
  {
    id: "madrasah", name: "Madrasah", nameBn: "মাদ্রাসা", icon: "moon-outline",
    description: "Madrasah Education", descriptionBn: "মাদ্রাসা শিক্ষা", category: "board",
    subjects: [
      { id: "mad-arabic", name: "Arabic", nameBn: "আরবি", icon: "language-outline", color: "#1B5E20", topics: ["Nahw & Sarf", "Arabic Literature"], topicsBn: ["নাহু ও সরফ", "আরবি সাহিত্য"] },
      { id: "mad-quran", name: "Quran Studies", nameBn: "কুরআন শিক্ষা", icon: "book-outline", color: "#004D40", topics: ["Tafsir", "General"], topicsBn: ["তাফসীর", "সাধারণ"] },
      { id: "mad-islamic", name: "Islamic Studies", nameBn: "ইসলাম শিক্ষা", icon: "moon-outline", color: "#006064", topics: ["Hadith", "Fiqh", "Aqeedah"], topicsBn: ["হাদিস", "ফিকহ", "আকিদা"] },
      { id: "mad-bangla", name: "Bangla", nameBn: "বাংলা", icon: "book-outline", color: "#D84315", topics: ["Grammar", "Literature"], topicsBn: ["ব্যাকরণ", "সাহিত্য"] },
      { id: "mad-english", name: "English", nameBn: "ইংরেজি", icon: "chatbubble-ellipses-outline", color: "#1565C0", topics: ["Grammar", "Vocabulary"], topicsBn: ["ব্যাকরণ", "শব্দভান্ডার"] },
      { id: "mad-math", name: "Mathematics", nameBn: "গণিত", icon: "calculator-outline", color: "#6A1B9A", topics: ["Arithmetic", "Algebra", "Geometry"], topicsBn: ["পাটিগণিত", "বীজগণিত", "জ্যামিতি"] },
      { id: "mad-science", name: "Science", nameBn: "বিজ্ঞান", icon: "flask-outline", color: "#00897B", topics: ["Biology", "Physics", "Chemistry"], topicsBn: ["জীববিজ্ঞান", "পদার্থবিজ্ঞান", "রসায়ন"] },
    ],
  },
];

export const QUESTIONS: Question[] = [
  // ===== BCS - Bangladesh Affairs =====
  { id: "bcs-bd-001", examType: "bcs", subject: "Bangladesh Affairs", topic: "Liberation War", difficulty: "easy", language: "en", question: "In which year did Bangladesh gain independence?", options: ["1947", "1965", "1971", "1975"], correctAnswer: 2, explanation: "Bangladesh gained independence on March 26, 1971, after a nine-month liberation war against Pakistan." },
  { id: "bcs-bd-002", examType: "bcs", subject: "Bangladesh Affairs", topic: "Liberation War", difficulty: "medium", language: "en", question: "Who was the first Prime Minister of Bangladesh?", options: ["Sheikh Mujibur Rahman", "Tajuddin Ahmad", "Syed Nazrul Islam", "M. Mansur Ali"], correctAnswer: 1, explanation: "Tajuddin Ahmad served as the first Prime Minister during the Mujibnagar government in 1971." },
  { id: "bcs-bd-003", examType: "bcs", subject: "Bangladesh Affairs", topic: "Constitution", difficulty: "medium", language: "en", question: "How many fundamental principles are stated in the Constitution of Bangladesh?", options: ["3", "4", "5", "6"], correctAnswer: 1, explanation: "The Constitution has 4 fundamental principles: Nationalism, Socialism, Democracy, and Secularism." },
  { id: "bcs-bd-004", examType: "bcs", subject: "Bangladesh Affairs", topic: "Geography", difficulty: "easy", language: "en", question: "What is the largest district of Bangladesh by area?", options: ["Dhaka", "Chittagong", "Rangamati", "Sylhet"], correctAnswer: 2, explanation: "Rangamati is the largest district covering approximately 6,116 square kilometers." },
  { id: "bcs-bd-005", examType: "bcs", subject: "Bangladesh Affairs", topic: "Economy", difficulty: "medium", language: "en", question: "Which sector contributes most to Bangladesh's export earnings?", options: ["Agriculture", "Ready-Made Garments", "IT Services", "Remittance"], correctAnswer: 1, explanation: "The RMG sector contributes over 80% of total export earnings." },
  { id: "bcs-bd-006", examType: "bcs", subject: "Bangladesh Affairs", topic: "Liberation War", difficulty: "hard", language: "en", question: "How many sectors was Bangladesh divided into during the Liberation War?", options: ["9", "10", "11", "12"], correctAnswer: 2, explanation: "Bangladesh was divided into 11 sectors, each commanded by a sector commander." },
  { id: "bcs-bd-007", examType: "bcs", subject: "Bangladesh Affairs", topic: "Constitution", difficulty: "hard", language: "en", question: "How many articles are there in the Constitution of Bangladesh?", options: ["135", "143", "153", "167"], correctAnswer: 2, explanation: "The Constitution of Bangladesh contains 153 articles in 11 parts." },
  { id: "bcs-bd-008", examType: "bcs", subject: "Bangladesh Affairs", topic: "Geography", difficulty: "medium", language: "en", question: "Which is the longest river in Bangladesh?", options: ["Padma", "Meghna", "Jamuna", "Surma"], correctAnswer: 0, explanation: "The Padma is the longest river flowing through Bangladesh, a distributary of the Ganges." },

  // ===== BCS - Bangla =====
  { id: "bcs-bn-001", examType: "bcs", subject: "Bangla", topic: "Grammar", difficulty: "easy", language: "bn", question: "'সন্ধি' শব্দের অর্থ কী?", options: ["বিচ্ছেদ", "মিলন", "বিভক্তি", "প্রত্যয়"], correctAnswer: 1, explanation: "'সন্ধি' শব্দের অর্থ মিলন। দুটি ধ্বনির মিলনকে সন্ধি বলে।" },
  { id: "bcs-bn-002", examType: "bcs", subject: "Bangla", topic: "Grammar", difficulty: "medium", language: "bn", question: "'চাঁদ' শব্দের সমার্থক শব্দ কোনটি?", options: ["রবি", "শশী", "তারা", "সূর্য"], correctAnswer: 1, explanation: "'চাঁদ' শব্দের সমার্থক শব্দ হলো 'শশী'। এছাড়াও চন্দ্র, ইন্দু, হিমাংশু ইত্যাদি।" },
  { id: "bcs-bn-003", examType: "bcs", subject: "Bangla", topic: "Literature", difficulty: "medium", language: "bn", question: "'গীতাঞ্জলি' কাব্যগ্রন্থের রচয়িতা কে?", options: ["কাজী নজরুল ইসলাম", "রবীন্দ্রনাথ ঠাকুর", "জীবনানন্দ দাশ", "মাইকেল মধুসূদন দত্ত"], correctAnswer: 1, explanation: "'গীতাঞ্জলি' রবীন্দ্রনাথ ঠাকুরের বিখ্যাত কাব্যগ্রন্থ যার জন্য তিনি ১৯১৩ সালে নোবেল পুরস্কার পান।" },
  { id: "bcs-bn-004", examType: "bcs", subject: "Bangla", topic: "Grammar", difficulty: "easy", language: "bn", question: "বাংলা বর্ণমালায় স্বরবর্ণ কয়টি?", options: ["৯", "১০", "১১", "১২"], correctAnswer: 2, explanation: "বাংলা বর্ণমালায় মোট ১১টি স্বরবর্ণ আছে: অ, আ, ই, ঈ, উ, ঊ, ঋ, এ, ঐ, ও, ঔ।" },
  { id: "bcs-bn-005", examType: "bcs", subject: "Bangla", topic: "Literature", difficulty: "hard", language: "bn", question: "'মেঘনাদবধ কাব্য' কোন ছন্দে রচিত?", options: ["পয়ার", "অমিত্রাক্ষর", "মাত্রাবৃত্ত", "স্বরবৃত্ত"], correctAnswer: 1, explanation: "'মেঘনাদবধ কাব্য' মাইকেল মধুসূদন দত্ত কর্তৃক অমিত্রাক্ষর ছন্দে রচিত। এটি বাংলা সাহিত্যের প্রথম মহাকাব্য।" },
  { id: "bcs-bn-006", examType: "bcs", subject: "Bangla", topic: "Grammar", difficulty: "medium", language: "bn", question: "'বৃষ্টি' শব্দটি কোন ধরনের শব্দ?", options: ["তৎসম", "তদ্ভব", "দেশি", "বিদেশি"], correctAnswer: 0, explanation: "'বৃষ্টি' একটি তৎসম শব্দ। সংস্কৃত থেকে অবিকৃতভাবে বাংলায় এসেছে।" },

  // ===== BCS - English =====
  { id: "bcs-en-001", examType: "bcs", subject: "English", topic: "Grammar", difficulty: "easy", language: "en", question: "Choose the correct article: '___ European country'", options: ["A", "An", "The", "No article needed"], correctAnswer: 0, explanation: "'European' starts with a consonant sound /j/, so 'a' is used." },
  { id: "bcs-en-002", examType: "bcs", subject: "English", topic: "Vocabulary", difficulty: "medium", language: "en", question: "What is the synonym of 'ubiquitous'?", options: ["Rare", "Omnipresent", "Unique", "Obscure"], correctAnswer: 1, explanation: "'Ubiquitous' means present everywhere. 'Omnipresent' has the same meaning." },
  { id: "bcs-en-003", examType: "bcs", subject: "English", topic: "Grammar", difficulty: "medium", language: "en", question: "Select the correct form: 'He ___ here since 2020.'", options: ["is living", "has been living", "was living", "had lived"], correctAnswer: 1, explanation: "Present perfect continuous 'has been living' is used for an action continuing from the past." },
  { id: "bcs-en-004", examType: "bcs", subject: "English", topic: "Vocabulary", difficulty: "easy", language: "en", question: "What is the antonym of 'benevolent'?", options: ["Kind", "Generous", "Malevolent", "Charitable"], correctAnswer: 2, explanation: "'Benevolent' means well-meaning; 'malevolent' means wishing evil." },
  { id: "bcs-en-005", examType: "bcs", subject: "English", topic: "Comprehension", difficulty: "medium", language: "en", question: "Which sentence is grammatically correct?", options: ["Each of the boys have a book.", "Each of the boys has a book.", "Each of the boys are having a book.", "Each of the boys were having books."], correctAnswer: 1, explanation: "'Each' is singular and takes a singular verb: 'has'." },

  // ===== BCS - General Science =====
  { id: "bcs-gs-001", examType: "bcs", subject: "General Science", topic: "Biology", difficulty: "easy", language: "en", question: "What is the process by which plants make their own food?", options: ["Respiration", "Transpiration", "Photosynthesis", "Osmosis"], correctAnswer: 2, explanation: "Photosynthesis uses sunlight, CO2, and water to produce glucose and oxygen." },
  { id: "bcs-gs-002", examType: "bcs", subject: "General Science", topic: "Physics", difficulty: "easy", language: "en", question: "What is the SI unit of electric current?", options: ["Volt", "Watt", "Ohm", "Ampere"], correctAnswer: 3, explanation: "The SI unit of electric current is the Ampere (A)." },
  { id: "bcs-gs-003", examType: "bcs", subject: "General Science", topic: "Chemistry", difficulty: "easy", language: "en", question: "What is the pH value of pure water?", options: ["0", "5", "7", "14"], correctAnswer: 2, explanation: "Pure water has a pH of 7, which is neutral." },

  // ===== BCS - Mathematics =====
  { id: "bcs-mr-001", examType: "bcs", subject: "Mathematics", topic: "Arithmetic", difficulty: "easy", language: "en", question: "What is the LCM of 12 and 18?", options: ["6", "24", "36", "72"], correctAnswer: 2, explanation: "LCM of 12 and 18 = 36." },
  { id: "bcs-mr-002", examType: "bcs", subject: "Mathematics", topic: "Arithmetic", difficulty: "medium", language: "en", question: "If a product costs Tk. 500 and is sold at 20% profit, what is the selling price?", options: ["Tk. 550", "Tk. 580", "Tk. 600", "Tk. 620"], correctAnswer: 2, explanation: "Selling price = 500 + (20% of 500) = 500 + 100 = Tk. 600." },
  { id: "bcs-mr-003", examType: "bcs", subject: "Mathematics", topic: "Geometry", difficulty: "medium", language: "en", question: "What is the area of a circle with radius 7 cm? (pi = 22/7)", options: ["44 sq cm", "88 sq cm", "154 sq cm", "308 sq cm"], correctAnswer: 2, explanation: "Area = pi x r^2 = (22/7) x 49 = 154 sq cm." },

  // ===== Medical - Biology =====
  { id: "med-bio-001", examType: "medical", subject: "Biology", topic: "Cell Biology", difficulty: "easy", language: "en", question: "Which organelle is known as the 'powerhouse of the cell'?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"], correctAnswer: 2, explanation: "Mitochondria produce ATP through cellular respiration." },
  { id: "med-bio-002", examType: "medical", subject: "Biology", topic: "Genetics", difficulty: "easy", language: "en", question: "How many chromosomes are found in a normal human cell?", options: ["23", "44", "46", "48"], correctAnswer: 2, explanation: "Normal human cells contain 46 chromosomes (23 pairs)." },
  { id: "med-bio-003", examType: "medical", subject: "Biology", topic: "Human Physiology", difficulty: "easy", language: "en", question: "Which blood group is known as the universal donor?", options: ["A positive", "B positive", "AB positive", "O negative"], correctAnswer: 3, explanation: "O negative lacks A, B, and Rh antigens, safe for all recipients." },
  { id: "med-bio-004", examType: "medical", subject: "Biology", topic: "Human Physiology", difficulty: "medium", language: "en", question: "Which hormone regulates blood sugar levels?", options: ["Thyroxine", "Insulin", "Adrenaline", "Cortisol"], correctAnswer: 1, explanation: "Insulin from the pancreas facilitates glucose uptake into cells." },
  { id: "med-bio-005", examType: "medical", subject: "Biology", topic: "Botany", difficulty: "medium", language: "en", question: "Which tissue is responsible for the transport of water in plants?", options: ["Phloem", "Xylem", "Cambium", "Epidermis"], correctAnswer: 1, explanation: "Xylem transports water and minerals from roots to other plant parts." },
  { id: "med-bio-006", examType: "medical", subject: "Biology", topic: "Genetics", difficulty: "hard", language: "en", question: "In Mendel's dihybrid cross (RrYy x RrYy), what is the phenotypic ratio?", options: ["3:1", "1:2:1", "9:3:3:1", "1:1:1:1"], correctAnswer: 2, explanation: "Dihybrid cross produces a 9:3:3:1 ratio in F2 generation." },

  // ===== Medical - Chemistry =====
  { id: "med-chem-001", examType: "medical", subject: "Chemistry", topic: "Inorganic Chemistry", difficulty: "easy", language: "en", question: "What is the atomic number of Carbon?", options: ["4", "6", "8", "12"], correctAnswer: 1, explanation: "Carbon has 6 protons, so atomic number is 6." },
  { id: "med-chem-002", examType: "medical", subject: "Chemistry", topic: "Inorganic Chemistry", difficulty: "easy", language: "en", question: "Which gas is most abundant in Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], correctAnswer: 2, explanation: "Nitrogen makes up about 78% of Earth's atmosphere." },
  { id: "med-chem-003", examType: "medical", subject: "Chemistry", topic: "Physical Chemistry", difficulty: "medium", language: "en", question: "What is the chemical formula of sulfuric acid?", options: ["HCl", "HNO3", "H2SO4", "H3PO4"], correctAnswer: 2, explanation: "Sulfuric acid is H2SO4, a strong diprotic acid." },
  { id: "med-chem-004", examType: "medical", subject: "Chemistry", topic: "Organic Chemistry", difficulty: "medium", language: "en", question: "What is the functional group of alcohols?", options: ["-COOH", "-OH", "-CHO", "-NH2"], correctAnswer: 1, explanation: "Alcohols contain the hydroxyl (-OH) functional group." },

  // ===== Medical - Physics =====
  { id: "med-phy-001", examType: "medical", subject: "Physics", topic: "Mechanics", difficulty: "easy", language: "en", question: "What is the SI unit of force?", options: ["Joule", "Pascal", "Newton", "Watt"], correctAnswer: 2, explanation: "The SI unit of force is Newton (N). 1 N = 1 kg.m/s^2." },
  { id: "med-phy-002", examType: "medical", subject: "Physics", topic: "Optics", difficulty: "easy", language: "en", question: "What is the approximate speed of light in vacuum?", options: ["3 x 10^6 m/s", "3 x 10^8 m/s", "3 x 10^10 m/s", "3 x 10^12 m/s"], correctAnswer: 1, explanation: "Speed of light in vacuum is approximately 3 x 10^8 m/s." },
  { id: "med-phy-003", examType: "medical", subject: "Physics", topic: "Electricity", difficulty: "easy", language: "en", question: "According to Ohm's law, V = ?", options: ["I / R", "I x R", "R / I", "I + R"], correctAnswer: 1, explanation: "Ohm's law: V = IR (Voltage = Current x Resistance)." },
  { id: "med-phy-004", examType: "medical", subject: "Physics", topic: "Thermodynamics", difficulty: "medium", language: "en", question: "Which law of thermodynamics states that energy can neither be created nor destroyed?", options: ["Zeroth Law", "First Law", "Second Law", "Third Law"], correctAnswer: 1, explanation: "The First Law (Conservation of Energy) states energy is conserved." },

  // ===== Engineering - Mathematics =====
  { id: "eng-math-001", examType: "engineering", subject: "Mathematics", topic: "Calculus", difficulty: "medium", language: "en", question: "What is the derivative of x^3?", options: ["x^2", "2x^2", "3x^2", "3x^3"], correctAnswer: 2, explanation: "Power rule: d/dx(x^n) = nx^(n-1). So d/dx(x^3) = 3x^2." },
  { id: "eng-math-002", examType: "engineering", subject: "Mathematics", topic: "Calculus", difficulty: "medium", language: "en", question: "What is the integral of 2x dx?", options: ["x + C", "x^2 + C", "2x^2 + C", "x^2/2 + C"], correctAnswer: 1, explanation: "Integral of 2x dx = 2(x^2/2) + C = x^2 + C." },
  { id: "eng-math-003", examType: "engineering", subject: "Mathematics", topic: "Trigonometry", difficulty: "easy", language: "en", question: "What is the value of sin 30 degrees?", options: ["0", "0.5", "0.707", "1"], correctAnswer: 1, explanation: "Sin 30 degrees = 1/2 = 0.5." },
  { id: "eng-math-004", examType: "engineering", subject: "Mathematics", topic: "Algebra", difficulty: "easy", language: "en", question: "What is log base 10 of 1000?", options: ["1", "2", "3", "4"], correctAnswer: 2, explanation: "log10(1000) = log10(10^3) = 3." },
  { id: "eng-math-005", examType: "engineering", subject: "Mathematics", topic: "Algebra", difficulty: "hard", language: "en", question: "If the determinant of a 2x2 matrix is 0, then the matrix is:", options: ["Symmetric", "Orthogonal", "Singular", "Diagonal"], correctAnswer: 2, explanation: "A matrix with determinant 0 is singular (no inverse)." },

  // ===== Engineering - Physics =====
  { id: "eng-phy-001", examType: "engineering", subject: "Physics", topic: "Mechanics", difficulty: "easy", language: "en", question: "What is the standard acceleration due to gravity?", options: ["8.9 m/s^2", "9.8 m/s^2", "10.8 m/s^2", "11.2 m/s^2"], correctAnswer: 1, explanation: "g on Earth's surface is approximately 9.8 m/s^2." },
  { id: "eng-phy-002", examType: "engineering", subject: "Physics", topic: "Waves", difficulty: "medium", language: "en", question: "What is the SI unit of frequency?", options: ["Second", "Hertz", "Meter", "Radian"], correctAnswer: 1, explanation: "The SI unit of frequency is Hertz (Hz). 1 Hz = 1 cycle/s." },
  { id: "eng-phy-003", examType: "engineering", subject: "Physics", topic: "Electromagnetism", difficulty: "medium", language: "en", question: "What is the SI unit of capacitance?", options: ["Henry", "Farad", "Tesla", "Weber"], correctAnswer: 1, explanation: "The SI unit of capacitance is Farad (F)." },
  { id: "eng-phy-004", examType: "engineering", subject: "Physics", topic: "Mechanics", difficulty: "medium", language: "en", question: "A body of mass 5 kg moves at 10 m/s. What is its kinetic energy?", options: ["50 J", "100 J", "250 J", "500 J"], correctAnswer: 2, explanation: "KE = 1/2 x m x v^2 = 1/2 x 5 x 100 = 250 J." },

  // ===== University =====
  { id: "uni-en-001", examType: "university", subject: "English", topic: "Grammar", difficulty: "easy", language: "en", question: "Choose the correct sentence:", options: ["He don't know the answer.", "He doesn't knows the answer.", "He doesn't know the answer.", "He not know the answer."], correctAnswer: 2, explanation: "'Doesn't' + base form: 'He doesn't know' is correct." },
  { id: "uni-en-002", examType: "university", subject: "English", topic: "Vocabulary", difficulty: "medium", language: "en", question: "The word 'ephemeral' means:", options: ["Permanent", "Lasting for a very short time", "Important", "Ancient"], correctAnswer: 1, explanation: "'Ephemeral' means transitory, lasting very briefly." },
  { id: "uni-gk-001", examType: "university", subject: "General Knowledge", topic: "Bangladesh", difficulty: "easy", language: "en", question: "What is the national flower of Bangladesh?", options: ["Rose", "Sunflower", "Water Lily (Shapla)", "Lotus"], correctAnswer: 2, explanation: "The Water Lily (Shapla) is the national flower of Bangladesh." },
  { id: "uni-gk-002", examType: "university", subject: "General Knowledge", topic: "International", difficulty: "medium", language: "en", question: "Which organization has its headquarters in Geneva, Switzerland?", options: ["UNESCO", "WHO", "UNICEF", "IMF"], correctAnswer: 1, explanation: "WHO headquarters is in Geneva. UNESCO is Paris, UNICEF is New York." },
  { id: "uni-gk-003", examType: "university", subject: "General Knowledge", topic: "Science & Tech", difficulty: "medium", language: "en", question: "Who is known as the father of the World Wide Web?", options: ["Bill Gates", "Steve Jobs", "Tim Berners-Lee", "Mark Zuckerberg"], correctAnswer: 2, explanation: "Tim Berners-Lee invented the WWW in 1989 at CERN." },
  { id: "uni-math-001", examType: "university", subject: "Mathematics", topic: "Arithmetic", difficulty: "easy", language: "en", question: "What is 25% of 400?", options: ["75", "100", "125", "150"], correctAnswer: 1, explanation: "25% of 400 = (25/100) x 400 = 100." },

  // ===== SSC - Bangla Questions =====
  { id: "ssc-bn-001", examType: "ssc", subject: "Bangla", topic: "Grammar", difficulty: "easy", language: "bn", question: "'পদ' কাকে বলে?", options: ["বিভক্তিযুক্ত শব্দকে পদ বলে", "অর্থবোধক ধ্বনিকে পদ বলে", "দুটি শব্দের মিলনকে পদ বলে", "ক্রিয়ার মূলকে পদ বলে"], correctAnswer: 0, explanation: "বিভক্তিযুক্ত শব্দকে পদ বলে। বাক্যে ব্যবহৃত প্রতিটি শব্দই পদ।" },
  { id: "ssc-bn-002", examType: "ssc", subject: "Bangla", topic: "Grammar", difficulty: "medium", language: "bn", question: "'সূর্য' শব্দের প্রতিশব্দ কোনটি?", options: ["শশী", "রবি", "তারা", "চন্দ্র"], correctAnswer: 1, explanation: "'সূর্য' শব্দের প্রতিশব্দ হলো 'রবি'। এছাড়াও আদিত্য, ভাস্কর, দিবাকর ইত্যাদি।" },
  { id: "ssc-bn-003", examType: "ssc", subject: "Bangla", topic: "Literature", difficulty: "medium", language: "bn", question: "'কবর' নাটকের রচয়িতা কে?", options: ["রবীন্দ্রনাথ ঠাকুর", "কাজী নজরুল ইসলাম", "মুনীর চৌধুরী", "সৈয়দ শামসুল হক"], correctAnswer: 2, explanation: "'কবর' নাটকটি মুনীর চৌধুরী রচিত। এটি ১৯৫২ সালের ভাষা আন্দোলনের পটভূমিতে রচিত।" },
  { id: "ssc-bn-004", examType: "ssc", subject: "Bangla", topic: "Grammar", difficulty: "easy", language: "bn", question: "বাংলা ভাষায় ব্যঞ্জনবর্ণ কয়টি?", options: ["৩৫", "৩৭", "৩৯", "৪১"], correctAnswer: 2, explanation: "বাংলা বর্ণমালায় মোট ৩৯টি ব্যঞ্জনবর্ণ আছে।" },
  { id: "ssc-bn-005", examType: "ssc", subject: "Bangla", topic: "Grammar", difficulty: "medium", language: "bn", question: "'নদী' শব্দের সমার্থক শব্দ কোনটি?", options: ["সাগর", "তটিনী", "সরোবর", "জলাশয়"], correctAnswer: 1, explanation: "'নদী' শব্দের সমার্থক শব্দ 'তটিনী'। এছাড়াও স্রোতস্বিনী, প্রবাহিনী ইত্যাদি।" },

  // ===== SSC - Mathematics =====
  { id: "ssc-math-001", examType: "ssc", subject: "Mathematics", topic: "Algebra", difficulty: "easy", language: "en", question: "If x + 5 = 12, what is x?", options: ["5", "6", "7", "8"], correctAnswer: 2, explanation: "x + 5 = 12, so x = 12 - 5 = 7." },
  { id: "ssc-math-002", examType: "ssc", subject: "Mathematics", topic: "Geometry", difficulty: "medium", language: "en", question: "What is the sum of all angles in a triangle?", options: ["90 degrees", "180 degrees", "270 degrees", "360 degrees"], correctAnswer: 1, explanation: "The sum of all interior angles of a triangle is always 180 degrees." },
  { id: "ssc-math-003", examType: "ssc", subject: "Mathematics", topic: "Arithmetic", difficulty: "easy", language: "en", question: "What is the square root of 144?", options: ["10", "11", "12", "13"], correctAnswer: 2, explanation: "12 x 12 = 144, so the square root of 144 is 12." },
  { id: "ssc-math-004", examType: "ssc", subject: "Mathematics", topic: "Trigonometry", difficulty: "medium", language: "en", question: "What is cos 60 degrees?", options: ["0", "0.5", "0.707", "1"], correctAnswer: 1, explanation: "cos 60 degrees = 1/2 = 0.5." },
  { id: "ssc-math-005", examType: "ssc", subject: "Mathematics", topic: "Statistics", difficulty: "easy", language: "en", question: "What is the mean of 2, 4, 6, 8, 10?", options: ["4", "5", "6", "7"], correctAnswer: 2, explanation: "Mean = (2+4+6+8+10)/5 = 30/5 = 6." },
  { id: "ssc-math-006", examType: "ssc", subject: "Mathematics", topic: "Algebra", difficulty: "medium", language: "bn", question: "যদি 2x - 3 = 7 হয়, তাহলে x = ?", options: ["3", "4", "5", "6"], correctAnswer: 2, explanation: "2x - 3 = 7, তাই 2x = 10, তাই x = 5।" },
  { id: "ssc-math-007", examType: "ssc", subject: "Mathematics", topic: "Geometry", difficulty: "easy", language: "bn", question: "বৃত্তের পরিধি নির্ণয়ের সূত্র কোনটি?", options: ["πr²", "2πr", "πd²", "2πd"], correctAnswer: 1, explanation: "বৃত্তের পরিধি = 2πr, যেখানে r = ব্যাসার্ধ।" },

  // ===== SSC - Physics =====
  { id: "ssc-phy-001", examType: "ssc", subject: "Physics", topic: "Light", difficulty: "easy", language: "en", question: "What type of lens is used in a magnifying glass?", options: ["Concave lens", "Convex lens", "Plano lens", "Cylindrical lens"], correctAnswer: 1, explanation: "A convex (converging) lens is used in a magnifying glass to enlarge images." },
  { id: "ssc-phy-002", examType: "ssc", subject: "Physics", topic: "Sound", difficulty: "easy", language: "en", question: "Sound cannot travel through:", options: ["Air", "Water", "Steel", "Vacuum"], correctAnswer: 3, explanation: "Sound requires a medium to travel and cannot propagate through a vacuum." },
  { id: "ssc-phy-003", examType: "ssc", subject: "Physics", topic: "Heat", difficulty: "medium", language: "en", question: "At what temperature does water boil (at standard pressure)?", options: ["90°C", "95°C", "100°C", "110°C"], correctAnswer: 2, explanation: "Water boils at 100°C (212°F) at standard atmospheric pressure." },
  { id: "ssc-phy-004", examType: "ssc", subject: "Physics", topic: "Mechanics", difficulty: "easy", language: "bn", question: "বেগের SI একক কী?", options: ["m/s", "m/s²", "kg.m/s", "N"], correctAnswer: 0, explanation: "বেগের SI একক হলো m/s (মিটার/সেকেন্ড)।" },

  // ===== SSC - Chemistry =====
  { id: "ssc-chem-001", examType: "ssc", subject: "Chemistry", topic: "Inorganic Chemistry", difficulty: "easy", language: "en", question: "What is the chemical symbol for Gold?", options: ["Go", "Gd", "Au", "Ag"], correctAnswer: 2, explanation: "Gold's chemical symbol Au comes from the Latin word 'Aurum'." },
  { id: "ssc-chem-002", examType: "ssc", subject: "Chemistry", topic: "Inorganic Chemistry", difficulty: "easy", language: "bn", question: "পানির রাসায়নিক সংকেত কী?", options: ["HO", "H2O", "H2O2", "HO2"], correctAnswer: 1, explanation: "পানির রাসায়নিক সংকেত হলো H2O (দুটি হাইড্রোজেন ও একটি অক্সিজেন পরমাণু)।" },

  // ===== SSC - Biology =====
  { id: "ssc-bio-001", examType: "ssc", subject: "Biology", topic: "Cell Biology", difficulty: "easy", language: "en", question: "What is the basic unit of life?", options: ["Atom", "Molecule", "Cell", "Tissue"], correctAnswer: 2, explanation: "The cell is the basic structural and functional unit of all living organisms." },
  { id: "ssc-bio-002", examType: "ssc", subject: "Biology", topic: "Human Physiology", difficulty: "medium", language: "en", question: "How many chambers does the human heart have?", options: ["2", "3", "4", "5"], correctAnswer: 2, explanation: "The human heart has 4 chambers: 2 atria and 2 ventricles." },
  { id: "ssc-bio-003", examType: "ssc", subject: "Biology", topic: "Ecology", difficulty: "easy", language: "bn", question: "সালোকসংশ্লেষণে কোন গ্যাস উৎপন্ন হয়?", options: ["কার্বন ডাই অক্সাইড", "নাইট্রোজেন", "অক্সিজেন", "হাইড্রোজেন"], correctAnswer: 2, explanation: "সালোকসংশ্লেষণ প্রক্রিয়ায় উদ্ভিদ সূর্যালোক, পানি ও CO2 ব্যবহার করে গ্লুকোজ ও অক্সিজেন (O2) উৎপন্ন করে।" },

  // ===== SSC - Bangladesh & Global Studies =====
  { id: "ssc-bdg-001", examType: "ssc", subject: "Bangladesh & Global Studies", topic: "History", difficulty: "easy", language: "en", question: "When was the Language Movement in Bangladesh?", options: ["1947", "1952", "1966", "1971"], correctAnswer: 1, explanation: "The Language Movement took place on February 21, 1952, to establish Bangla as a state language." },
  { id: "ssc-bdg-002", examType: "ssc", subject: "Bangladesh & Global Studies", topic: "Geography", difficulty: "medium", language: "en", question: "Which is the largest mangrove forest in the world?", options: ["Amazon Rainforest", "Sundarbans", "Congo Forest", "Daintree Forest"], correctAnswer: 1, explanation: "The Sundarbans, shared by Bangladesh and India, is the largest mangrove forest." },
  { id: "ssc-bdg-003", examType: "ssc", subject: "Bangladesh & Global Studies", topic: "History", difficulty: "easy", language: "bn", question: "বাংলাদেশের বিজয় দিবস কবে?", options: ["২৬শে মার্চ", "২১শে ফেব্রুয়ারি", "১৬ই ডিসেম্বর", "১৪ই এপ্রিল"], correctAnswer: 2, explanation: "১৯৭১ সালের ১৬ই ডিসেম্বর পাকিস্তানি সেনাবাহিনীর আত্মসমর্পণের মধ্য দিয়ে বাংলাদেশ বিজয় অর্জন করে।" },
  { id: "ssc-bdg-004", examType: "ssc", subject: "Bangladesh & Global Studies", topic: "Geography", difficulty: "easy", language: "bn", question: "বাংলাদেশের রাজধানী কোথায়?", options: ["চট্টগ্রাম", "রাজশাহী", "ঢাকা", "সিলেট"], correctAnswer: 2, explanation: "বাংলাদেশের রাজধানী ঢাকা। এটি দেশের বৃহত্তম শহরও।" },

  // ===== HSC - Physics =====
  { id: "hsc-phy-001", examType: "hsc", subject: "Physics", topic: "Mechanics", difficulty: "medium", language: "en", question: "What is the formula for gravitational potential energy?", options: ["mgh", "1/2 mv^2", "Fd", "kx^2/2"], correctAnswer: 0, explanation: "Gravitational PE = mgh (mass x gravity x height)." },
  { id: "hsc-phy-002", examType: "hsc", subject: "Physics", topic: "Waves", difficulty: "medium", language: "en", question: "What is the relationship between frequency (f) and wavelength (lambda)?", options: ["v = f + lambda", "v = f x lambda", "v = f / lambda", "v = lambda / f"], correctAnswer: 1, explanation: "Wave speed v = f x lambda (frequency x wavelength)." },
  { id: "hsc-phy-003", examType: "hsc", subject: "Physics", topic: "Modern Physics", difficulty: "hard", language: "en", question: "What is the energy equivalent of mass according to Einstein?", options: ["E = mv", "E = mc", "E = mc^2", "E = 1/2 mc^2"], correctAnswer: 2, explanation: "Einstein's mass-energy equivalence: E = mc^2." },
  { id: "hsc-phy-004", examType: "hsc", subject: "Physics", topic: "Electricity", difficulty: "medium", language: "bn", question: "কুলম্বের সূত্র অনুসারে দুটি চার্জের মধ্যে বল কিসের উপর নির্ভর করে?", options: ["শুধু দূরত্ব", "শুধু চার্জের পরিমাণ", "চার্জের পরিমাণ ও দূরত্ব উভয়", "চার্জের ভর"], correctAnswer: 2, explanation: "কুলম্বের সূত্র: F = kq1q2/r². বল চার্জের গুণফলের সমানুপাতিক এবং দূরত্বের বর্গের ব্যস্তানুপাতিক।" },

  // ===== HSC - Chemistry =====
  { id: "hsc-chem-001", examType: "hsc", subject: "Chemistry", topic: "Organic Chemistry", difficulty: "medium", language: "en", question: "What is the general formula of alkanes?", options: ["CnH2n", "CnH2n+2", "CnH2n-2", "CnHn"], correctAnswer: 1, explanation: "Alkanes have the general formula CnH2n+2 (e.g., CH4, C2H6)." },
  { id: "hsc-chem-002", examType: "hsc", subject: "Chemistry", topic: "Physical Chemistry", difficulty: "medium", language: "en", question: "What is Avogadro's number?", options: ["6.022 x 10^20", "6.022 x 10^23", "6.022 x 10^26", "3.14 x 10^23"], correctAnswer: 1, explanation: "Avogadro's number is 6.022 x 10^23, the number of entities in one mole." },
  { id: "hsc-chem-003", examType: "hsc", subject: "Chemistry", topic: "Inorganic Chemistry", difficulty: "medium", language: "bn", question: "পর্যায় সারণিতে মোট কয়টি পর্যায় আছে?", options: ["৫", "৬", "৭", "৮"], correctAnswer: 2, explanation: "আধুনিক পর্যায় সারণিতে ৭টি পর্যায় (Period) আছে।" },

  // ===== HSC - Biology =====
  { id: "hsc-bio-001", examType: "hsc", subject: "Biology", topic: "Genetics", difficulty: "medium", language: "en", question: "What is the full form of DNA?", options: ["Deoxyribonucleic Acid", "Dinucleotide Acid", "Deoxyribonitrate Acid", "Dinitrogen Acid"], correctAnswer: 0, explanation: "DNA = Deoxyribonucleic Acid, the molecule carrying genetic instructions." },
  { id: "hsc-bio-002", examType: "hsc", subject: "Biology", topic: "Cell Biology", difficulty: "medium", language: "bn", question: "কোষ বিভাজনের কোন ধাপে ক্রোমোজোম মধ্যরেখায় সজ্জিত হয়?", options: ["প্রোফেজ", "মেটাফেজ", "অ্যানাফেজ", "টেলোফেজ"], correctAnswer: 1, explanation: "মেটাফেজ ধাপে ক্রোমোজোমগুলো কোষের মধ্যরেখা বা বিষুবীয় তলে সজ্জিত হয়।" },

  // ===== HSC - Higher Mathematics =====
  { id: "hsc-hm-001", examType: "hsc", subject: "Higher Mathematics", topic: "Calculus", difficulty: "medium", language: "en", question: "What is d/dx(sin x)?", options: ["-cos x", "cos x", "-sin x", "tan x"], correctAnswer: 1, explanation: "The derivative of sin x is cos x." },
  { id: "hsc-hm-002", examType: "hsc", subject: "Higher Mathematics", topic: "Calculus", difficulty: "hard", language: "en", question: "What is the integral of 1/x dx?", options: ["x", "1/x^2", "ln|x| + C", "e^x + C"], correctAnswer: 2, explanation: "The integral of 1/x dx = ln|x| + C (natural logarithm)." },

  // ===== JSC Questions =====
  { id: "jsc-bn-001", examType: "jsc", subject: "Bangla", topic: "Grammar", difficulty: "easy", language: "bn", question: "'বাক্য' কী?", options: ["একটি শব্দ", "একটি ধ্বনি", "পরিপূর্ণ অর্থ প্রকাশক শব্দসমষ্টি", "দুটি শব্দের মিলন"], correctAnswer: 2, explanation: "যে শব্দসমষ্টি দ্বারা বক্তার মনোভাব পরিপূর্ণভাবে প্রকাশিত হয় তাকে বাক্য বলে।" },
  { id: "jsc-bn-002", examType: "jsc", subject: "Bangla", topic: "Literature", difficulty: "easy", language: "bn", question: "'আমার সোনার বাংলা' গানটি কে রচনা করেছেন?", options: ["কাজী নজরুল ইসলাম", "রবীন্দ্রনাথ ঠাকুর", "লালন শাহ", "জসীমউদ্দীন"], correctAnswer: 1, explanation: "'আমার সোনার বাংলা' বাংলাদেশের জাতীয় সংগীত, রবীন্দ্রনাথ ঠাকুর কর্তৃক রচিত।" },
  { id: "jsc-math-001", examType: "jsc", subject: "Mathematics", topic: "Arithmetic", difficulty: "easy", language: "en", question: "What is 15% of 200?", options: ["20", "25", "30", "35"], correctAnswer: 2, explanation: "15% of 200 = (15/100) x 200 = 30." },
  { id: "jsc-math-002", examType: "jsc", subject: "Mathematics", topic: "Geometry", difficulty: "easy", language: "bn", question: "আয়তক্ষেত্রের ক্ষেত্রফলের সূত্র কী?", options: ["দৈর্ঘ্য + প্রস্থ", "দৈর্ঘ্য x প্রস্থ", "2(দৈর্ঘ্য + প্রস্থ)", "দৈর্ঘ্য² x প্রস্থ"], correctAnswer: 1, explanation: "আয়তক্ষেত্রের ক্ষেত্রফল = দৈর্ঘ্য x প্রস্থ।" },
  { id: "jsc-sci-001", examType: "jsc", subject: "Science", topic: "Biology", difficulty: "easy", language: "en", question: "What gas do we breathe in for respiration?", options: ["Nitrogen", "Carbon Dioxide", "Oxygen", "Hydrogen"], correctAnswer: 2, explanation: "We breathe in Oxygen (O2) for cellular respiration." },
  { id: "jsc-sci-002", examType: "jsc", subject: "Science", topic: "Physics", difficulty: "easy", language: "bn", question: "পৃথিবী সূর্যের চারদিকে কত দিনে একবার ঘোরে?", options: ["২৪ দিন", "৩০ দিন", "৩৬৫ দিন", "৩০০ দিন"], correctAnswer: 2, explanation: "পৃথিবী সূর্যের চারদিকে প্রায় ৩৬৫ দিনে (১ বছরে) একবার ঘোরে।" },

  // ===== PSC Questions =====
  { id: "psc-bn-001", examType: "psc", subject: "Bangla", topic: "Grammar", difficulty: "easy", language: "bn", question: "'ক' বর্ণটি কোন ধরনের বর্ণ?", options: ["স্বরবর্ণ", "ব্যঞ্জনবর্ণ", "যুক্তবর্ণ", "অনুস্বার"], correctAnswer: 1, explanation: "'ক' একটি ব্যঞ্জনবর্ণ। বাংলা ভাষায় ৩৯টি ব্যঞ্জনবর্ণ আছে।" },
  { id: "psc-bn-002", examType: "psc", subject: "Bangla", topic: "Literature", difficulty: "easy", language: "bn", question: "'ছোটদের রবীন্দ্রনাথ' কে?", options: ["কাজী নজরুল ইসলাম", "সুকুমার রায়", "উপেন্দ্রকিশোর রায়চৌধুরী", "রবীন্দ্রনাথ ঠাকুর"], correctAnswer: 3, explanation: "রবীন্দ্রনাথ ঠাকুর শিশুদের জন্য অনেক কবিতা ও গল্প লিখেছেন তাই তাকে 'ছোটদের রবীন্দ্রনাথ' বলা হয়।" },
  { id: "psc-math-001", examType: "psc", subject: "Mathematics", topic: "Arithmetic", difficulty: "easy", language: "en", question: "What is 7 x 8?", options: ["48", "54", "56", "64"], correctAnswer: 2, explanation: "7 x 8 = 56." },
  { id: "psc-math-002", examType: "psc", subject: "Mathematics", topic: "Arithmetic", difficulty: "easy", language: "bn", question: "১২ + ১৮ = ?", options: ["২৮", "২৯", "৩০", "৩১"], correctAnswer: 2, explanation: "১২ + ১৮ = ৩০।" },
  { id: "psc-sci-001", examType: "psc", subject: "Science", topic: "Environment", difficulty: "easy", language: "en", question: "What do plants need to make food?", options: ["Only water", "Only sunlight", "Sunlight, water, and CO2", "Only soil"], correctAnswer: 2, explanation: "Plants need sunlight, water, and carbon dioxide for photosynthesis." },
  { id: "psc-sci-002", examType: "psc", subject: "Science", topic: "General", difficulty: "easy", language: "bn", question: "পানি কত ডিগ্রিতে জমে যায়?", options: ["০°C", "৪°C", "১০°C", "১০০°C"], correctAnswer: 0, explanation: "বিশুদ্ধ পানি ০°C (সেলসিয়াস) তাপমাত্রায় জমে বরফ হয়।" },
  { id: "psc-bd-001", examType: "psc", subject: "Bangladesh & Global Studies", topic: "Bangladesh", difficulty: "easy", language: "bn", question: "বাংলাদেশের জাতীয় পাখি কী?", options: ["কাক", "দোয়েল", "ময়না", "শালিক"], correctAnswer: 1, explanation: "বাংলাদেশের জাতীয় পাখি দোয়েল। এটি সুমধুর গান গায়।" },

  // ===== Madrasah Questions =====
  { id: "mad-isl-001", examType: "madrasah", subject: "Islamic Studies", topic: "Hadith", difficulty: "easy", language: "bn", question: "ইসলামের স্তম্ভ কয়টি?", options: ["৩টি", "৪টি", "৫টি", "৬টি"], correctAnswer: 2, explanation: "ইসলামের স্তম্ভ ৫টি: কালেমা, নামাজ, রোজা, হজ্জ ও যাকাত।" },
  { id: "mad-isl-002", examType: "madrasah", subject: "Islamic Studies", topic: "Fiqh", difficulty: "medium", language: "bn", question: "দৈনিক ফরজ নামাজ কত ওয়াক্ত?", options: ["৩ ওয়াক্ত", "৪ ওয়াক্ত", "৫ ওয়াক্ত", "৬ ওয়াক্ত"], correctAnswer: 2, explanation: "দৈনিক ৫ ওয়াক্ত ফরজ নামাজ: ফজর, যোহর, আসর, মাগরিব ও ইশা।" },
  { id: "mad-isl-003", examType: "madrasah", subject: "Islamic Studies", topic: "Aqeedah", difficulty: "easy", language: "bn", question: "পবিত্র কুরআনে মোট কতটি সূরা আছে?", options: ["১০০", "১১০", "১১৪", "১২০"], correctAnswer: 2, explanation: "পবিত্র কুরআনে মোট ১১৪টি সূরা আছে।" },
  { id: "mad-quran-001", examType: "madrasah", subject: "Quran Studies", topic: "General", difficulty: "easy", language: "bn", question: "পবিত্র কুরআনের প্রথম সূরার নাম কী?", options: ["সূরা বাকারা", "সূরা ফাতিহা", "সূরা ইখলাস", "সূরা নাস"], correctAnswer: 1, explanation: "পবিত্র কুরআনের প্রথম সূরা হলো সূরা আল-ফাতিহা।" },
  { id: "mad-quran-002", examType: "madrasah", subject: "Quran Studies", topic: "Tafsir", difficulty: "medium", language: "bn", question: "পবিত্র কুরআনের দীর্ঘতম সূরা কোনটি?", options: ["সূরা আলে ইমরান", "সূরা বাকারা", "সূরা নিসা", "সূরা মায়িদা"], correctAnswer: 1, explanation: "সূরা আল-বাকারা কুরআনের দীর্ঘতম সূরা, যাতে ২৮৬টি আয়াত আছে।" },
  { id: "mad-arabic-001", examType: "madrasah", subject: "Arabic", topic: "Nahw & Sarf", difficulty: "medium", language: "bn", question: "আরবি বর্ণমালায় মোট কতটি হরফ আছে?", options: ["২৬", "২৮", "৩০", "৩২"], correctAnswer: 1, explanation: "আরবি বর্ণমালায় মোট ২৮টি হরফ (অক্ষর) আছে।" },
  { id: "mad-math-001", examType: "madrasah", subject: "Mathematics", topic: "Arithmetic", difficulty: "easy", language: "bn", question: "১/২ + ১/৪ = ?", options: ["১/৬", "২/৬", "৩/৪", "২/৪"], correctAnswer: 2, explanation: "১/২ + ১/৪ = ২/৪ + ১/৪ = ৩/৪।" },

  // ===== More Bangla Questions across types =====
  { id: "bcs-bd-bn-001", examType: "bcs", subject: "Bangladesh Affairs", topic: "Liberation War", difficulty: "easy", language: "bn", question: "বাংলাদেশের স্বাধীনতা দিবস কবে?", options: ["২১শে ফেব্রুয়ারি", "২৬শে মার্চ", "১৬ই ডিসেম্বর", "১লা মে"], correctAnswer: 1, explanation: "১৯৭১ সালের ২৬শে মার্চ বাংলাদেশের স্বাধীনতা ঘোষণা করা হয়।" },
  { id: "bcs-bd-bn-002", examType: "bcs", subject: "Bangladesh Affairs", topic: "Constitution", difficulty: "medium", language: "bn", question: "বাংলাদেশের সংবিধান কত সালে প্রণীত হয়?", options: ["১৯৭১", "১৯৭২", "১৯৭৩", "১৯৭৫"], correctAnswer: 1, explanation: "বাংলাদেশের সংবিধান ১৯৭২ সালের ৪ঠা নভেম্বর গণপরিষদে গৃহীত হয়।" },
  { id: "bcs-gs-bn-001", examType: "bcs", subject: "General Science", topic: "Biology", difficulty: "easy", language: "bn", question: "মানবদেহের সবচেয়ে বড় অঙ্গ কোনটি?", options: ["হৃৎপিণ্ড", "যকৃৎ", "ত্বক", "ফুসফুস"], correctAnswer: 2, explanation: "ত্বক (Skin) মানবদেহের সবচেয়ে বড় অঙ্গ।" },
  { id: "med-bio-bn-001", examType: "medical", subject: "Biology", topic: "Cell Biology", difficulty: "easy", language: "bn", question: "কোষের ভেতরে DNA কোথায় থাকে?", options: ["রাইবোজোম", "মাইটোকন্ড্রিয়া", "নিউক্লিয়াস", "গলগি বডি"], correctAnswer: 2, explanation: "কোষের DNA মূলত নিউক্লিয়াসে (কোষকেন্দ্রে) থাকে।" },
  { id: "med-chem-bn-001", examType: "medical", subject: "Chemistry", topic: "Organic Chemistry", difficulty: "medium", language: "bn", question: "মিথেনের সংকেত কী?", options: ["C2H6", "CH4", "C2H4", "C3H8"], correctAnswer: 1, explanation: "মিথেন হলো সরলতম হাইড্রোকার্বন, এর সংকেত CH4।" },
  { id: "eng-math-bn-001", examType: "engineering", subject: "Mathematics", topic: "Trigonometry", difficulty: "medium", language: "bn", question: "tan 45° এর মান কত?", options: ["০", "১", "√3", "১/√3"], correctAnswer: 1, explanation: "tan 45° = sin 45°/cos 45° = 1।" },
  { id: "eng-phy-bn-001", examType: "engineering", subject: "Physics", topic: "Mechanics", difficulty: "easy", language: "bn", question: "নিউটনের প্রথম সূত্র অনুসারে, বাহ্যিক বল প্রযুক্ত না হলে বস্তু কী করবে?", options: ["ত্বরান্বিত হবে", "থামবে", "স্থির থাকবে বা সমবেগে চলবে", "বিপরীত দিকে যাবে"], correctAnswer: 2, explanation: "নিউটনের প্রথম সূত্র (জড়তার সূত্র): বাহ্যিক বল প্রযুক্ত না হলে স্থির বস্তু স্থিরই থাকবে এবং গতিশীল বস্তু সমবেগে সরলরেখায় চলতে থাকবে।" },
  { id: "uni-gk-bn-001", examType: "university", subject: "General Knowledge", topic: "Bangladesh", difficulty: "easy", language: "bn", question: "বাংলাদেশের জাতীয় ফুল কী?", options: ["গোলাপ", "শাপলা", "পদ্ম", "রজনীগন্ধা"], correctAnswer: 1, explanation: "শাপলা (Nymphaea nouchali) বাংলাদেশের জাতীয় ফুল।" },
  { id: "hsc-math-bn-001", examType: "hsc", subject: "Higher Mathematics", topic: "Calculus", difficulty: "medium", language: "bn", question: "d/dx(e^x) = ?", options: ["xe^x", "e^x", "e^(x-1)", "x.e^(x-1)"], correctAnswer: 1, explanation: "e^x এর ডেরিভেটিভ হলো e^x ই। এটি ক্যালকুলাসের একটি মৌলিক সূত্র।" },

  // ===== Additional SSC/HSC ICT =====
  { id: "ssc-ict-001", examType: "ssc", subject: "ICT", topic: "Basics", difficulty: "easy", language: "en", question: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Unit"], correctAnswer: 0, explanation: "CPU = Central Processing Unit, the brain of the computer." },
  { id: "ssc-ict-002", examType: "ssc", subject: "ICT", topic: "Basics", difficulty: "easy", language: "bn", question: "১ কিলোবাইট (KB) = কত বাইট?", options: ["৫১২ বাইট", "১০০০ বাইট", "১০২৪ বাইট", "২০৪৮ বাইট"], correctAnswer: 2, explanation: "১ কিলোবাইট = ১০২৪ বাইট (2^10 বাইট)।" },
  { id: "hsc-ict-001", examType: "hsc", subject: "ICT", topic: "Programming", difficulty: "medium", language: "en", question: "Which programming language is known as the 'mother of all languages'?", options: ["Python", "Java", "C", "Assembly"], correctAnswer: 2, explanation: "C is considered the mother of all programming languages due to its influence." },

  // ===== More BCS - Computer & IT =====
  { id: "bcs-comp-001", examType: "bcs", subject: "Computer & IT", topic: "Basics", difficulty: "easy", language: "en", question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"], correctAnswer: 0, explanation: "HTML = HyperText Markup Language, the standard language for web pages." },
  { id: "bcs-comp-002", examType: "bcs", subject: "Computer & IT", topic: "Networking", difficulty: "medium", language: "en", question: "What does IP stand for in networking?", options: ["Internet Protocol", "Internal Program", "Interface Port", "Indexed Processing"], correctAnswer: 0, explanation: "IP = Internet Protocol, the principal communications protocol for the internet." },

  // ===== University - Bangla =====
  { id: "uni-bn-001", examType: "university", subject: "Bangla", topic: "Grammar", difficulty: "medium", language: "bn", question: "'কর্তৃকারকে শূন্য বিভক্তি' কোন বাক্যে আছে?", options: ["ছেলেটি বই পড়ে", "আমাকে বই দাও", "টেবিলে বই আছে", "বইটি ভালো"], correctAnswer: 0, explanation: "'ছেলেটি বই পড়ে' বাক্যে 'ছেলেটি' কর্তৃকারকে শূন্য (অ) বিভক্তি যুক্ত।" },
  { id: "uni-bn-002", examType: "university", subject: "Bangla", topic: "Literature", difficulty: "medium", language: "bn", question: "'বিদ্রোহী' কবিতার রচয়িতা কে?", options: ["রবীন্দ্রনাথ ঠাকুর", "কাজী নজরুল ইসলাম", "জীবনানন্দ দাশ", "সুকান্ত ভট্টাচার্য"], correctAnswer: 1, explanation: "'বিদ্রোহী' কবিতা কাজী নজরুল ইসলামের সবচেয়ে বিখ্যাত কবিতাগুলোর একটি।" },

  // ===== HSC - Bangla =====
  { id: "hsc-bn-001", examType: "hsc", subject: "Bangla", topic: "Grammar", difficulty: "medium", language: "bn", question: "'প্রত্যয়' কাকে বলে?", options: ["শব্দের আগে যুক্ত অংশ", "শব্দের পরে যুক্ত অংশ", "দুটি শব্দের মিলন", "ধাতুর রূপ পরিবর্তন"], correctAnswer: 1, explanation: "শব্দ বা ধাতুর পরে যে অংশ যুক্ত হয়ে নতুন শব্দ গঠন করে তাকে প্রত্যয় বলে।" },
  { id: "hsc-bn-002", examType: "hsc", subject: "Bangla", topic: "Literature", difficulty: "hard", language: "bn", question: "'পথের পাঁচালী' উপন্যাসের লেখক কে?", options: ["শরৎচন্দ্র চট্টোপাধ্যায়", "বিভূতিভূষণ বন্দ্যোপাধ্যায়", "তারাশঙ্কর বন্দ্যোপাধ্যায়", "মানিক বন্দ্যোপাধ্যায়"], correctAnswer: 1, explanation: "'পথের পাঁচালী' বিভূতিভূষণ বন্দ্যোপাধ্যায়ের বিখ্যাত উপন্যাস, পরে সত্যজিৎ রায় এটি চলচ্চিত্রে রূপ দেন।" },

  // ===== EXPANDED QUESTION BANK =====

  // ===== BCS - Bangladesh Affairs (Additional) =====
  { id: "bcs-bd-009", examType: "bcs", subject: "Bangladesh Affairs", topic: "Liberation War", difficulty: "medium", language: "en", question: "Who was the Commander-in-Chief of the Bangladesh Liberation War?", options: ["General Osmani", "Major Zia", "Major Khalid", "Colonel Taher"], correctAnswer: 0, explanation: "General M. A. G. Osmani was appointed as the Commander-in-Chief of the Bangladesh Forces during the Liberation War." },
  { id: "bcs-bd-010", examType: "bcs", subject: "Bangladesh Affairs", topic: "Constitution", difficulty: "hard", language: "en", question: "When was the Constitution of Bangladesh adopted?", options: ["26 March 1972", "16 December 1972", "4 November 1972", "17 April 1972"], correctAnswer: 2, explanation: "The Constitution was adopted on 4 November 1972 and came into effect on 16 December 1972." },
  { id: "bcs-bd-011", examType: "bcs", subject: "Bangladesh Affairs", topic: "Geography", difficulty: "easy", language: "en", question: "What is the capital of Bangladesh?", options: ["Chittagong", "Dhaka", "Rajshahi", "Sylhet"], correctAnswer: 1, explanation: "Dhaka is the capital and largest city of Bangladesh." },
  { id: "bcs-bd-012", examType: "bcs", subject: "Bangladesh Affairs", topic: "Economy", difficulty: "hard", language: "en", question: "What is the currency of Bangladesh?", options: ["Rupee", "Taka", "Dollar", "Ringgit"], correctAnswer: 1, explanation: "The Bangladeshi Taka (BDT) is the official currency of Bangladesh." },
  { id: "bcs-bd-013", examType: "bcs", subject: "Bangladesh Affairs", topic: "Liberation War", difficulty: "easy", language: "bn", question: "মুক্তিযুদ্ধে বাংলাদেশকে কতটি সেক্টরে ভাগ করা হয়েছিল?", options: ["৯", "১০", "১১", "১২"], correctAnswer: 2, explanation: "মুক্তিযুদ্ধে বাংলাদেশকে ১১টি সেক্টরে ভাগ করা হয়েছিল।" },
  { id: "bcs-bd-014", examType: "bcs", subject: "Bangladesh Affairs", topic: "Constitution", difficulty: "medium", language: "bn", question: "বাংলাদেশের সংবিধানে মৌলিক অধিকার কোন ভাগে আছে?", options: ["দ্বিতীয় ভাগ", "তৃতীয় ভাগ", "চতুর্থ ভাগ", "পঞ্চম ভাগ"], correctAnswer: 1, explanation: "বাংলাদেশের সংবিধানে মৌলিক অধিকার তৃতীয় ভাগে (ধারা ২৬-৪৭ক) বর্ণিত আছে।" },
  { id: "bcs-bd-015", examType: "bcs", subject: "Bangladesh Affairs", topic: "Geography", difficulty: "medium", language: "bn", question: "বাংলাদেশের সবচেয়ে উঁচু পর্বতশৃঙ্গ কোনটি?", options: ["কেওক্রাডং", "তাজিংডং", "মোদক মুয়াল", "রাইখিয়াং"], correctAnswer: 1, explanation: "তাজিংডং (বিজয়) বাংলাদেশের সর্বোচ্চ পর্বতশৃঙ্গ, উচ্চতা ১,২৮০ মিটার।" },
  { id: "bcs-bd-016", examType: "bcs", subject: "Bangladesh Affairs", topic: "Economy", difficulty: "easy", language: "bn", question: "বাংলাদেশের প্রধান রপ্তানি পণ্য কোনটি?", options: ["চা", "পাট", "তৈরি পোশাক", "চামড়া"], correctAnswer: 2, explanation: "তৈরি পোশাক (RMG) বাংলাদেশের প্রধান রপ্তানি পণ্য, মোট রপ্তানি আয়ের ৮০% এর বেশি।" },

  // ===== BCS - English (Additional) =====
  { id: "bcs-en-006", examType: "bcs", subject: "English", topic: "Grammar", difficulty: "easy", language: "en", question: "Choose the correct sentence:", options: ["He go to school daily", "He goes to school daily", "He going to school daily", "He gone to school daily"], correctAnswer: 1, explanation: "Third person singular subjects take 'goes' in simple present tense." },
  { id: "bcs-en-007", examType: "bcs", subject: "English", topic: "Vocabulary", difficulty: "medium", language: "en", question: "The synonym of 'Benevolent' is:", options: ["Cruel", "Kind", "Angry", "Lazy"], correctAnswer: 1, explanation: "'Benevolent' means well-meaning and kindly, so 'Kind' is the synonym." },
  { id: "bcs-en-008", examType: "bcs", subject: "English", topic: "Grammar", difficulty: "hard", language: "en", question: "Which sentence uses the subjunctive mood correctly?", options: ["If I was you, I would go", "If I were you, I would go", "If I am you, I would go", "If I be you, I would go"], correctAnswer: 1, explanation: "The subjunctive mood uses 'were' for all subjects in hypothetical conditions." },
  { id: "bcs-en-009", examType: "bcs", subject: "English", topic: "Vocabulary", difficulty: "easy", language: "en", question: "The antonym of 'Abundant' is:", options: ["Plentiful", "Scarce", "Huge", "Rich"], correctAnswer: 1, explanation: "'Abundant' means plentiful, so 'Scarce' (insufficient) is its antonym." },
  { id: "bcs-en-010", examType: "bcs", subject: "English", topic: "Comprehension", difficulty: "medium", language: "en", question: "A 'bibliography' is:", options: ["A biography of a person", "A list of books and references", "A type of encyclopedia", "A map collection"], correctAnswer: 1, explanation: "A bibliography is a list of sources or references used in a work." },
  { id: "bcs-en-011", examType: "bcs", subject: "English", topic: "Grammar", difficulty: "medium", language: "en", question: "'Had I known, I would have come.' This is an example of:", options: ["First conditional", "Second conditional", "Third conditional", "Zero conditional"], correctAnswer: 2, explanation: "Third conditional expresses an unreal past condition using had + past participle." },

  // ===== BCS - Bangla (Additional) =====
  { id: "bcs-bn-006", examType: "bcs", subject: "Bangla", topic: "Grammar", difficulty: "medium", language: "bn", question: "'কারক' শব্দের অর্থ কী?", options: ["যে করে", "যা করে", "যে ক্রিয়া সম্পাদন করে", "ক্রিয়ার সাথে নামপদের সম্পর্ক"], correctAnswer: 3, explanation: "কারক হলো বাক্যের ক্রিয়াপদের সাথে নামপদের (বিশেষ্য বা সর্বনাম) যে সম্পর্ক তাকে কারক বলে।" },
  { id: "bcs-bn-007", examType: "bcs", subject: "Bangla", topic: "Grammar", difficulty: "hard", language: "bn", question: "'সমাস' কত প্রকার?", options: ["৪ প্রকার", "৫ প্রকার", "৬ প্রকার", "৭ প্রকার"], correctAnswer: 2, explanation: "সমাস ৬ প্রকার: দ্বন্দ্ব, কর্মধারয়, তৎপুরুষ, বহুব্রীহি, দ্বিগু ও অব্যয়ীভাব।" },
  { id: "bcs-bn-008", examType: "bcs", subject: "Bangla", topic: "Literature", difficulty: "easy", language: "bn", question: "'সোনার তরী' কবিতার রচয়িতা কে?", options: ["কাজী নজরুল ইসলাম", "রবীন্দ্রনাথ ঠাকুর", "জীবনানন্দ দাশ", "শামসুর রাহমান"], correctAnswer: 1, explanation: "'সোনার তরী' রবীন্দ্রনাথ ঠাকুরের একটি বিখ্যাত কবিতা।" },
  { id: "bcs-bn-009", examType: "bcs", subject: "Bangla", topic: "Grammar", difficulty: "easy", language: "bn", question: "বাংলা বর্ণমালায় ব্যঞ্জনবর্ণ কয়টি?", options: ["৩৫", "৩৬", "৩৯", "৪০"], correctAnswer: 2, explanation: "বাংলা বর্ণমালায় ৩৯টি ব্যঞ্জনবর্ণ আছে।" },
  { id: "bcs-bn-010", examType: "bcs", subject: "Bangla", topic: "Literature", difficulty: "medium", language: "bn", question: "জীবনানন্দ দাশের কাব্যগ্রন্থ কোনটি?", options: ["বলাকা", "রূপসী বাংলা", "অগ্নিবীণা", "সোনার তরী"], correctAnswer: 1, explanation: "'রূপসী বাংলা' জীবনানন্দ দাশের মৃত্যুর পর প্রকাশিত বিখ্যাত কাব্যগ্রন্থ।" },

  // ===== BCS - International Affairs =====
  { id: "bcs-intl-001", examType: "bcs", subject: "International Affairs", topic: "Organizations", difficulty: "easy", language: "en", question: "When was the United Nations established?", options: ["1944", "1945", "1946", "1950"], correctAnswer: 1, explanation: "The United Nations was established on October 24, 1945." },
  { id: "bcs-intl-002", examType: "bcs", subject: "International Affairs", topic: "Organizations", difficulty: "medium", language: "en", question: "Where is the headquarters of the International Court of Justice?", options: ["New York", "Geneva", "The Hague", "Vienna"], correctAnswer: 2, explanation: "The ICJ is located in The Hague, Netherlands." },
  { id: "bcs-intl-003", examType: "bcs", subject: "International Affairs", topic: "Current Affairs", difficulty: "medium", language: "en", question: "How many member states does the United Nations have?", options: ["189", "191", "193", "195"], correctAnswer: 2, explanation: "The UN currently has 193 member states." },
  { id: "bcs-intl-004", examType: "bcs", subject: "International Affairs", topic: "Organizations", difficulty: "easy", language: "bn", question: "জাতিসংঘের সদর দপ্তর কোথায়?", options: ["জেনেভা", "নিউইয়র্ক", "প্যারিস", "লন্ডন"], correctAnswer: 1, explanation: "জাতিসংঘের সদর দপ্তর যুক্তরাষ্ট্রের নিউইয়র্কে অবস্থিত।" },
  { id: "bcs-intl-005", examType: "bcs", subject: "International Affairs", topic: "Current Affairs", difficulty: "hard", language: "en", question: "Which country has the largest economy by GDP (nominal)?", options: ["China", "United States", "Japan", "Germany"], correctAnswer: 1, explanation: "The United States has the largest economy by nominal GDP." },

  // ===== BCS - General Science =====
  { id: "bcs-gs-001", examType: "bcs", subject: "General Science", topic: "Biology", difficulty: "easy", language: "en", question: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], correctAnswer: 2, explanation: "Mitochondria are called the powerhouse of the cell because they produce ATP." },
  { id: "bcs-gs-002", examType: "bcs", subject: "General Science", topic: "Physics", difficulty: "medium", language: "en", question: "What is the SI unit of force?", options: ["Joule", "Newton", "Pascal", "Watt"], correctAnswer: 1, explanation: "The SI unit of force is Newton (N), named after Sir Isaac Newton." },
  { id: "bcs-gs-003", examType: "bcs", subject: "General Science", topic: "Chemistry", difficulty: "easy", language: "en", question: "What is the chemical symbol for water?", options: ["HO", "H2O", "OH2", "H2O2"], correctAnswer: 1, explanation: "Water has the chemical formula H2O (two hydrogen atoms and one oxygen atom)." },
  { id: "bcs-gs-004", examType: "bcs", subject: "General Science", topic: "Biology", difficulty: "medium", language: "bn", question: "মানবদেহে মোট কতটি হাড় আছে?", options: ["১৯৬", "২০৬", "২১৬", "২২৬"], correctAnswer: 1, explanation: "একজন প্রাপ্তবয়স্ক মানুষের দেহে মোট ২০৬টি হাড় আছে।" },
  { id: "bcs-gs-005", examType: "bcs", subject: "General Science", topic: "Physics", difficulty: "hard", language: "en", question: "What is the speed of light in vacuum?", options: ["3 x 10^6 m/s", "3 x 10^8 m/s", "3 x 10^10 m/s", "3 x 10^12 m/s"], correctAnswer: 1, explanation: "The speed of light in vacuum is approximately 3 x 10^8 meters per second (299,792,458 m/s)." },

  // ===== BCS - Mathematics =====
  { id: "bcs-math-001", examType: "bcs", subject: "Mathematics", topic: "Arithmetic", difficulty: "easy", language: "en", question: "What is 15% of 200?", options: ["20", "25", "30", "35"], correctAnswer: 2, explanation: "15% of 200 = (15/100) x 200 = 30." },
  { id: "bcs-math-002", examType: "bcs", subject: "Mathematics", topic: "Algebra", difficulty: "medium", language: "en", question: "If x + y = 10 and x - y = 4, what is x?", options: ["5", "6", "7", "8"], correctAnswer: 2, explanation: "Adding the equations: 2x = 14, so x = 7." },
  { id: "bcs-math-003", examType: "bcs", subject: "Mathematics", topic: "Geometry", difficulty: "easy", language: "en", question: "How many degrees are in a triangle?", options: ["90", "180", "270", "360"], correctAnswer: 1, explanation: "The sum of all angles in a triangle is always 180 degrees." },
  { id: "bcs-math-004", examType: "bcs", subject: "Mathematics", topic: "Arithmetic", difficulty: "medium", language: "bn", question: "একটি সংখ্যার ২০% = ৪০ হলে, সংখ্যাটি কত?", options: ["১০০", "১৫০", "২০০", "২৫০"], correctAnswer: 2, explanation: "সংখ্যাটি = ৪০ × ১০০/২০ = ২০০।" },
  { id: "bcs-math-005", examType: "bcs", subject: "Mathematics", topic: "Algebra", difficulty: "hard", language: "en", question: "What is the value of log2(32)?", options: ["3", "4", "5", "6"], correctAnswer: 2, explanation: "log2(32) = 5 because 2^5 = 32." },

  // ===== Medical - Biology (Additional) =====
  { id: "med-bio-006", examType: "medical", subject: "Biology", topic: "Cell Biology", difficulty: "easy", language: "en", question: "Which organelle is responsible for protein synthesis?", options: ["Mitochondria", "Ribosome", "Lysosome", "Golgi apparatus"], correctAnswer: 1, explanation: "Ribosomes are the cellular organelles responsible for protein synthesis." },
  { id: "med-bio-007", examType: "medical", subject: "Biology", topic: "Genetics", difficulty: "medium", language: "en", question: "How many chromosomes do human somatic cells have?", options: ["23", "44", "46", "48"], correctAnswer: 2, explanation: "Human somatic cells contain 46 chromosomes (23 pairs)." },
  { id: "med-bio-008", examType: "medical", subject: "Biology", topic: "Human Physiology", difficulty: "easy", language: "en", question: "Which blood group is known as the universal donor?", options: ["A", "B", "AB", "O"], correctAnswer: 3, explanation: "Blood group O negative is the universal donor as it lacks A, B antigens and Rh factor." },
  { id: "med-bio-009", examType: "medical", subject: "Biology", topic: "Botany", difficulty: "medium", language: "en", question: "Photosynthesis takes place in which part of the plant cell?", options: ["Mitochondria", "Nucleus", "Chloroplast", "Cell membrane"], correctAnswer: 2, explanation: "Photosynthesis occurs in chloroplasts, which contain chlorophyll pigment." },
  { id: "med-bio-010", examType: "medical", subject: "Biology", topic: "Zoology", difficulty: "hard", language: "en", question: "Which phylum includes animals with a notochord?", options: ["Arthropoda", "Mollusca", "Chordata", "Annelida"], correctAnswer: 2, explanation: "Phylum Chordata includes all animals that possess a notochord at some stage of development." },
  { id: "med-bio-011", examType: "medical", subject: "Biology", topic: "Genetics", difficulty: "hard", language: "en", question: "Crossing over occurs during which phase of meiosis?", options: ["Prophase I", "Metaphase I", "Anaphase I", "Telophase I"], correctAnswer: 0, explanation: "Crossing over occurs during Prophase I of meiosis, specifically during the pachytene stage." },
  { id: "med-bio-012", examType: "medical", subject: "Biology", topic: "Cell Biology", difficulty: "medium", language: "bn", question: "কোষের 'আত্মঘাতী থলি' বলা হয় কাকে?", options: ["রাইবোসোম", "লাইসোসোম", "গলজি বডি", "সেন্ট্রোসোম"], correctAnswer: 1, explanation: "লাইসোসোমকে কোষের 'আত্মঘাতী থলি' বলা হয় কারণ এটি কোষের ক্ষতিগ্রস্ত অংশ ধ্বংস করে।" },
  { id: "med-bio-013", examType: "medical", subject: "Biology", topic: "Human Physiology", difficulty: "easy", language: "bn", question: "মানবদেহের সবচেয়ে বড় অঙ্গ কোনটি?", options: ["যকৃত", "ফুসফুস", "ত্বক", "হৃৎপিণ্ড"], correctAnswer: 2, explanation: "ত্বক মানবদেহের সবচেয়ে বড় অঙ্গ।" },
  { id: "med-bio-014", examType: "medical", subject: "Biology", topic: "Ecology", difficulty: "medium", language: "en", question: "What is the primary producer in most food chains?", options: ["Herbivores", "Carnivores", "Green plants", "Decomposers"], correctAnswer: 2, explanation: "Green plants are primary producers as they convert sunlight to food through photosynthesis." },
  { id: "med-bio-015", examType: "medical", subject: "Biology", topic: "Botany", difficulty: "easy", language: "bn", question: "উদ্ভিদের খাদ্য তৈরির প্রক্রিয়াকে কী বলে?", options: ["শ্বসন", "সালোকসংশ্লেষণ", "রেচন", "অভিস্রবণ"], correctAnswer: 1, explanation: "সালোকসংশ্লেষণ প্রক্রিয়ায় উদ্ভিদ সূর্যালোক, পানি ও CO2 ব্যবহার করে খাদ্য তৈরি করে।" },

  // ===== Medical - Chemistry (Additional) =====
  { id: "med-chem-006", examType: "medical", subject: "Chemistry", topic: "Organic Chemistry", difficulty: "medium", language: "en", question: "What is the functional group of alcohols?", options: ["-COOH", "-OH", "-CHO", "-NH2"], correctAnswer: 1, explanation: "Alcohols contain the hydroxyl (-OH) functional group." },
  { id: "med-chem-007", examType: "medical", subject: "Chemistry", topic: "Inorganic Chemistry", difficulty: "easy", language: "en", question: "What is the atomic number of Carbon?", options: ["4", "6", "8", "12"], correctAnswer: 1, explanation: "Carbon has atomic number 6, meaning it has 6 protons." },
  { id: "med-chem-008", examType: "medical", subject: "Chemistry", topic: "Physical Chemistry", difficulty: "hard", language: "en", question: "According to the ideal gas law, PV = nRT, what does R represent?", options: ["Rate constant", "Universal gas constant", "Resistance", "Radius"], correctAnswer: 1, explanation: "R is the universal gas constant (8.314 J/(mol·K))." },
  { id: "med-chem-009", examType: "medical", subject: "Chemistry", topic: "Organic Chemistry", difficulty: "medium", language: "bn", question: "মিথেনের আণবিক সংকেত কী?", options: ["CH3", "CH4", "C2H6", "C2H4"], correctAnswer: 1, explanation: "মিথেনের আণবিক সংকেত CH4। এটি সবচেয়ে সরল হাইড্রোকার্বন।" },
  { id: "med-chem-010", examType: "medical", subject: "Chemistry", topic: "Inorganic Chemistry", difficulty: "easy", language: "bn", question: "পর্যায় সারণিতে মোট কতটি পর্যায় আছে?", options: ["৫", "৬", "৭", "৮"], correctAnswer: 2, explanation: "আধুনিক পর্যায় সারণিতে ৭টি পর্যায় আছে।" },

  // ===== Medical - Physics (Additional) =====
  { id: "med-phy-006", examType: "medical", subject: "Physics", topic: "Mechanics", difficulty: "easy", language: "en", question: "What is the SI unit of acceleration?", options: ["m/s", "m/s^2", "km/h", "N"], correctAnswer: 1, explanation: "The SI unit of acceleration is meters per second squared (m/s^2)." },
  { id: "med-phy-007", examType: "medical", subject: "Physics", topic: "Optics", difficulty: "medium", language: "en", question: "What type of mirror is used in car headlights?", options: ["Plane mirror", "Convex mirror", "Concave mirror", "None"], correctAnswer: 2, explanation: "Concave mirrors are used in headlights to produce a parallel beam of light." },
  { id: "med-phy-008", examType: "medical", subject: "Physics", topic: "Electricity", difficulty: "medium", language: "en", question: "What is Ohm's law?", options: ["V = IR", "V = I/R", "V = I + R", "V = I - R"], correctAnswer: 0, explanation: "Ohm's law states V = IR, where V is voltage, I is current, and R is resistance." },
  { id: "med-phy-009", examType: "medical", subject: "Physics", topic: "Thermodynamics", difficulty: "hard", language: "en", question: "What is absolute zero in Celsius?", options: ["-100°C", "-200°C", "-273.15°C", "-373.15°C"], correctAnswer: 2, explanation: "Absolute zero is -273.15°C (0 Kelvin), the lowest possible temperature." },
  { id: "med-phy-010", examType: "medical", subject: "Physics", topic: "Mechanics", difficulty: "easy", language: "bn", question: "বেগের SI একক কী?", options: ["m/s", "km/h", "m/s^2", "N"], correctAnswer: 0, explanation: "বেগের SI একক হলো মিটার/সেকেন্ড (m/s)।" },

  // ===== Engineering - Mathematics (Additional) =====
  { id: "eng-math-006", examType: "engineering", subject: "Mathematics", topic: "Calculus", difficulty: "medium", language: "en", question: "What is the derivative of sin(x)?", options: ["-cos(x)", "cos(x)", "tan(x)", "-sin(x)"], correctAnswer: 1, explanation: "The derivative of sin(x) with respect to x is cos(x)." },
  { id: "eng-math-007", examType: "engineering", subject: "Mathematics", topic: "Algebra", difficulty: "easy", language: "en", question: "What is the value of i^2 (where i is imaginary unit)?", options: ["1", "-1", "0", "i"], correctAnswer: 1, explanation: "By definition, i^2 = -1, where i is the imaginary unit." },
  { id: "eng-math-008", examType: "engineering", subject: "Mathematics", topic: "Trigonometry", difficulty: "medium", language: "en", question: "What is sin(90°)?", options: ["0", "0.5", "1", "-1"], correctAnswer: 2, explanation: "sin(90°) = 1." },
  { id: "eng-math-009", examType: "engineering", subject: "Mathematics", topic: "Coordinate Geometry", difficulty: "hard", language: "en", question: "What is the equation of a circle with center (0,0) and radius r?", options: ["x + y = r", "x^2 + y^2 = r", "x^2 + y^2 = r^2", "x^2 - y^2 = r^2"], correctAnswer: 2, explanation: "The standard equation of a circle centered at origin is x^2 + y^2 = r^2." },
  { id: "eng-math-010", examType: "engineering", subject: "Mathematics", topic: "Calculus", difficulty: "hard", language: "en", question: "What is the integral of 1/x dx?", options: ["x", "1/x^2", "ln|x| + C", "e^x + C"], correctAnswer: 2, explanation: "The integral of 1/x dx = ln|x| + C, where C is the constant of integration." },
  { id: "eng-math-011", examType: "engineering", subject: "Mathematics", topic: "Algebra", difficulty: "medium", language: "bn", question: "x^2 - 5x + 6 = 0 সমীকরণের মূল দুটি কত?", options: ["1, 6", "2, 3", "-2, -3", "1, 5"], correctAnswer: 1, explanation: "x^2 - 5x + 6 = (x-2)(x-3) = 0, তাই x = 2 বা x = 3।" },
  { id: "eng-math-012", examType: "engineering", subject: "Mathematics", topic: "Trigonometry", difficulty: "easy", language: "bn", question: "cos(0°) = কত?", options: ["0", "1", "-1", "অসীম"], correctAnswer: 1, explanation: "cos(0°) = 1।" },

  // ===== Engineering - Physics (Additional) =====
  { id: "eng-phy-006", examType: "engineering", subject: "Physics", topic: "Mechanics", difficulty: "easy", language: "en", question: "Newton's first law is also known as the law of:", options: ["Acceleration", "Inertia", "Gravity", "Momentum"], correctAnswer: 1, explanation: "Newton's first law is the law of inertia: an object at rest stays at rest." },
  { id: "eng-phy-007", examType: "engineering", subject: "Physics", topic: "Waves", difficulty: "medium", language: "en", question: "What is the SI unit of frequency?", options: ["Watt", "Hertz", "Joule", "Pascal"], correctAnswer: 1, explanation: "The SI unit of frequency is Hertz (Hz), equal to one cycle per second." },
  { id: "eng-phy-008", examType: "engineering", subject: "Physics", topic: "Electromagnetism", difficulty: "hard", language: "en", question: "What is the SI unit of magnetic flux?", options: ["Tesla", "Weber", "Gauss", "Henry"], correctAnswer: 1, explanation: "The SI unit of magnetic flux is Weber (Wb). Tesla is the unit of magnetic flux density." },
  { id: "eng-phy-009", examType: "engineering", subject: "Physics", topic: "Modern Physics", difficulty: "hard", language: "en", question: "What is the energy equivalent of mass according to Einstein?", options: ["E = mc", "E = mc^2", "E = m^2c", "E = 2mc"], correctAnswer: 1, explanation: "Einstein's mass-energy equivalence: E = mc^2, where c is the speed of light." },
  { id: "eng-phy-010", examType: "engineering", subject: "Physics", topic: "Mechanics", difficulty: "medium", language: "bn", question: "ভরবেগের সংরক্ষণ সূত্র অনুযায়ী, বাহ্যিক বল শূন্য হলে কী ঘটে?", options: ["ভরবেগ বাড়ে", "ভরবেগ কমে", "ভরবেগ ধ্রুবক থাকে", "ভরবেগ শূন্য হয়"], correctAnswer: 2, explanation: "বাহ্যিক বল শূন্য হলে সিস্টেমের মোট ভরবেগ ধ্রুবক থাকে।" },

  // ===== Engineering - Chemistry (Additional) =====
  { id: "eng-chem-006", examType: "engineering", subject: "Chemistry", topic: "Physical Chemistry", difficulty: "medium", language: "en", question: "What is the pH of a neutral solution at 25°C?", options: ["0", "5", "7", "14"], correctAnswer: 2, explanation: "A neutral solution at 25°C has a pH of 7." },
  { id: "eng-chem-007", examType: "engineering", subject: "Chemistry", topic: "Organic Chemistry", difficulty: "hard", language: "en", question: "What is the IUPAC name of CH3-CH2-OH?", options: ["Methanol", "Ethanol", "Propanol", "Butanol"], correctAnswer: 1, explanation: "CH3-CH2-OH is ethanol (two-carbon alcohol)." },
  { id: "eng-chem-008", examType: "engineering", subject: "Chemistry", topic: "Inorganic Chemistry", difficulty: "easy", language: "en", question: "Which element has the highest electronegativity?", options: ["Oxygen", "Nitrogen", "Fluorine", "Chlorine"], correctAnswer: 2, explanation: "Fluorine has the highest electronegativity (3.98 on the Pauling scale)." },

  // ===== University - English (Additional) =====
  { id: "uni-en-001", examType: "university", subject: "English", topic: "Grammar", difficulty: "easy", language: "en", question: "Choose the correct form: 'Neither of the boys ___ present.'", options: ["are", "were", "was", "have been"], correctAnswer: 2, explanation: "'Neither of' takes a singular verb, so 'was' is correct." },
  { id: "uni-en-002", examType: "university", subject: "English", topic: "Vocabulary", difficulty: "medium", language: "en", question: "The word 'Ubiquitous' means:", options: ["Rare", "Present everywhere", "Invisible", "Ancient"], correctAnswer: 1, explanation: "'Ubiquitous' means present, appearing, or found everywhere." },
  { id: "uni-en-003", examType: "university", subject: "English", topic: "Reading Comprehension", difficulty: "hard", language: "en", question: "An 'allegory' is:", options: ["A type of poetry", "A story with hidden meaning", "A historical narrative", "A scientific report"], correctAnswer: 1, explanation: "An allegory is a narrative in which characters and events represent abstract ideas or moral qualities." },
  { id: "uni-en-004", examType: "university", subject: "English", topic: "Grammar", difficulty: "medium", language: "en", question: "'The book, together with the pens, ___ on the table.' Choose correct verb:", options: ["are", "is", "were", "have been"], correctAnswer: 1, explanation: "When 'together with' separates subject from verb, the verb agrees with the first subject (book = singular)." },
  { id: "uni-en-005", examType: "university", subject: "English", topic: "Vocabulary", difficulty: "easy", language: "en", question: "The synonym of 'Eloquent' is:", options: ["Silent", "Articulate", "Boring", "Confused"], correctAnswer: 1, explanation: "'Eloquent' means fluent and persuasive in speaking or writing, so 'Articulate' is the synonym." },

  // ===== University - General Knowledge =====
  { id: "uni-gk-001", examType: "university", subject: "General Knowledge", topic: "Bangladesh", difficulty: "easy", language: "en", question: "What is the national flower of Bangladesh?", options: ["Rose", "Lotus", "Water Lily", "Sunflower"], correctAnswer: 2, explanation: "The Water Lily (Shapla) is the national flower of Bangladesh." },
  { id: "uni-gk-002", examType: "university", subject: "General Knowledge", topic: "International", difficulty: "medium", language: "en", question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correctAnswer: 1, explanation: "Mars is known as the Red Planet due to its reddish appearance from iron oxide on its surface." },
  { id: "uni-gk-003", examType: "university", subject: "General Knowledge", topic: "Science & Tech", difficulty: "medium", language: "en", question: "Who invented the telephone?", options: ["Thomas Edison", "Nikola Tesla", "Alexander Graham Bell", "Guglielmo Marconi"], correctAnswer: 2, explanation: "Alexander Graham Bell is credited with inventing the first practical telephone in 1876." },
  { id: "uni-gk-004", examType: "university", subject: "General Knowledge", topic: "Bangladesh", difficulty: "easy", language: "bn", question: "বাংলাদেশের জাতীয় পশু কোনটি?", options: ["হাতি", "রয়েল বেঙ্গল টাইগার", "হরিণ", "ভালুক"], correctAnswer: 1, explanation: "রয়েল বেঙ্গল টাইগার বাংলাদেশের জাতীয় পশু।" },
  { id: "uni-gk-005", examType: "university", subject: "General Knowledge", topic: "International", difficulty: "hard", language: "en", question: "Which country has the most UNESCO World Heritage Sites?", options: ["China", "Italy", "Spain", "France"], correctAnswer: 1, explanation: "Italy has the most UNESCO World Heritage Sites in the world." },

  // ===== University - Mathematics =====
  { id: "uni-math-001", examType: "university", subject: "Mathematics", topic: "Algebra", difficulty: "easy", language: "en", question: "What is the sum of the first 10 natural numbers?", options: ["45", "50", "55", "60"], correctAnswer: 2, explanation: "Sum = n(n+1)/2 = 10(11)/2 = 55." },
  { id: "uni-math-002", examType: "university", subject: "Mathematics", topic: "Geometry", difficulty: "medium", language: "en", question: "What is the area of a circle with radius 7?", options: ["44", "132", "154", "196"], correctAnswer: 2, explanation: "Area = pi*r^2 = (22/7)*49 = 154 square units." },
  { id: "uni-math-003", examType: "university", subject: "Mathematics", topic: "Arithmetic", difficulty: "easy", language: "bn", question: "৩, ৫, ৭, ৯, ... ধারার ১০ম পদ কত?", options: ["১৯", "২১", "২৩", "২৫"], correctAnswer: 1, explanation: "সমান্তর ধারা, a=3, d=2। ১০ম পদ = 3 + (10-1)×2 = 3 + 18 = 21।" },
  { id: "uni-math-004", examType: "university", subject: "Mathematics", topic: "Algebra", difficulty: "hard", language: "en", question: "If f(x) = x^3 - 3x + 2, what is f(1)?", options: ["-2", "0", "2", "4"], correctAnswer: 1, explanation: "f(1) = 1 - 3 + 2 = 0." },

  // ===== University - Bangla (Additional) =====
  { id: "uni-bn-003", examType: "university", subject: "Bangla", topic: "Grammar", difficulty: "hard", language: "bn", question: "'তৎসম' শব্দ কোনটি?", options: ["হাত", "চাঁদ", "চন্দ্র", "চামচ"], correctAnswer: 2, explanation: "'চন্দ্র' একটি তৎসম শব্দ, যা সংস্কৃত থেকে সরাসরি বাংলায় এসেছে।" },
  { id: "uni-bn-004", examType: "university", subject: "Bangla", topic: "Literature", difficulty: "easy", language: "bn", question: "'কবর' নাটকের রচয়িতা কে?", options: ["নূরুল মোমেন", "মুনীর চৌধুরী", "সৈয়দ ওয়ালীউল্লাহ", "সেলিম আল দীন"], correctAnswer: 1, explanation: "'কবর' নাটক মুনীর চৌধুরীর রচনা, যা ভাষা আন্দোলনের পটভূমিতে রচিত।" },
  { id: "uni-bn-005", examType: "university", subject: "Bangla", topic: "Grammar", difficulty: "medium", language: "bn", question: "'প্রত্যয়' কত প্রকার?", options: ["২ প্রকার", "৩ প্রকার", "৪ প্রকার", "৫ প্রকার"], correctAnswer: 0, explanation: "প্রত্যয় ২ প্রকার: কৃৎ প্রত্যয় (ধাতুর সাথে যুক্ত) ও তদ্ধিত প্রত্যয় (শব্দের সাথে যুক্ত)।" },

  // ===== SSC - Bangla (Additional) =====
  { id: "ssc-bn-006", examType: "ssc", subject: "Bangla", topic: "Grammar", difficulty: "easy", language: "bn", question: "'বিশেষ্য' পদ কাকে বলে?", options: ["গুণ বোঝায়", "নাম বোঝায়", "ক্রিয়া বোঝায়", "সম্পর্ক বোঝায়"], correctAnswer: 1, explanation: "যে পদ দ্বারা কোনো ব্যক্তি, বস্তু, স্থান, গুণ, অবস্থা ইত্যাদির নাম বোঝায়, তাকে বিশেষ্য পদ বলে।" },
  { id: "ssc-bn-007", examType: "ssc", subject: "Bangla", topic: "Literature", difficulty: "medium", language: "bn", question: "'আমার সন্তান যেন থাকে দুধে ভাতে' - এই প্রার্থনা কার?", options: ["ঈশ্বরী পাটনী", "অন্নদা", "চাঁদ সওদাগর", "বেহুলা"], correctAnswer: 0, explanation: "ভারতচন্দ্রের 'অন্নদামঙ্গল' কাব্যে ঈশ্বরী পাটনী এই প্রার্থনা করেছিলেন।" },
  { id: "ssc-bn-008", examType: "ssc", subject: "Bangla", topic: "Grammar", difficulty: "medium", language: "bn", question: "'উপসর্গ' কাকে বলে?", options: ["শব্দের পরে যুক্ত অংশ", "শব্দের আগে যুক্ত অংশ", "দুটি শব্দের মিলন", "ধ্বনি পরিবর্তন"], correctAnswer: 1, explanation: "শব্দের পূর্বে যে অব্যয়সূচক শব্দাংশ যুক্ত হয়ে নতুন শব্দ গঠন করে তাকে উপসর্গ বলে।" },

  // ===== SSC - English (Additional) =====
  { id: "ssc-en-006", examType: "ssc", subject: "English", topic: "Grammar", difficulty: "easy", language: "en", question: "Which is a countable noun?", options: ["Water", "Milk", "Book", "Rice"], correctAnswer: 2, explanation: "'Book' is countable (one book, two books). Water, milk, and rice are uncountable." },
  { id: "ssc-en-007", examType: "ssc", subject: "English", topic: "Vocabulary", difficulty: "medium", language: "en", question: "The meaning of 'Annual' is:", options: ["Monthly", "Weekly", "Yearly", "Daily"], correctAnswer: 2, explanation: "'Annual' means occurring once every year." },
  { id: "ssc-en-008", examType: "ssc", subject: "English", topic: "Grammar", difficulty: "hard", language: "en", question: "'He asked me where I lived.' This is an example of:", options: ["Direct speech", "Indirect speech", "Imperative sentence", "Exclamatory sentence"], correctAnswer: 1, explanation: "This is indirect (reported) speech, where the original question is embedded in a statement." },
  { id: "ssc-en-009", examType: "ssc", subject: "English", topic: "Comprehension", difficulty: "easy", language: "en", question: "What is a 'synonym'?", options: ["A word with opposite meaning", "A word with similar meaning", "A word with no meaning", "A foreign word"], correctAnswer: 1, explanation: "A synonym is a word that has the same or nearly the same meaning as another word." },
  { id: "ssc-en-010", examType: "ssc", subject: "English", topic: "Vocabulary", difficulty: "medium", language: "en", question: "The opposite of 'Ancient' is:", options: ["Old", "Modern", "Historical", "Traditional"], correctAnswer: 1, explanation: "'Ancient' means very old, so 'Modern' (new/recent) is the opposite." },

  // ===== SSC - Mathematics (Additional) =====
  { id: "ssc-math-006", examType: "ssc", subject: "Mathematics", topic: "Algebra", difficulty: "easy", language: "en", question: "What is the value of (a+b)^2 when a=2 and b=3?", options: ["10", "13", "20", "25"], correctAnswer: 3, explanation: "(2+3)^2 = 5^2 = 25." },
  { id: "ssc-math-007", examType: "ssc", subject: "Mathematics", topic: "Geometry", difficulty: "medium", language: "en", question: "The sum of interior angles of a hexagon is:", options: ["360°", "540°", "720°", "900°"], correctAnswer: 2, explanation: "Sum of interior angles = (n-2) x 180° = (6-2) x 180° = 720°." },
  { id: "ssc-math-008", examType: "ssc", subject: "Mathematics", topic: "Arithmetic", difficulty: "easy", language: "bn", question: "সরল সুদে ৫০০ টাকার ২ বছরের সুদ ১০০ টাকা হলে, সুদের হার কত?", options: ["৫%", "১০%", "১৫%", "২০%"], correctAnswer: 1, explanation: "সুদের হার = (সুদ × ১০০)/(আসল × সময়) = (১০০ × ১০০)/(৫০০ × ২) = ১০%।" },
  { id: "ssc-math-009", examType: "ssc", subject: "Mathematics", topic: "Trigonometry", difficulty: "medium", language: "en", question: "What is tan(45°)?", options: ["0", "0.5", "1", "Undefined"], correctAnswer: 2, explanation: "tan(45°) = sin(45°)/cos(45°) = 1." },
  { id: "ssc-math-010", examType: "ssc", subject: "Mathematics", topic: "Statistics", difficulty: "easy", language: "en", question: "What is the mean of 2, 4, 6, 8, 10?", options: ["4", "5", "6", "8"], correctAnswer: 2, explanation: "Mean = (2+4+6+8+10)/5 = 30/5 = 6." },
  { id: "ssc-math-011", examType: "ssc", subject: "Mathematics", topic: "Algebra", difficulty: "hard", language: "bn", question: "যদি x + 1/x = 3 হয়, তবে x^2 + 1/x^2 = কত?", options: ["5", "7", "9", "11"], correctAnswer: 1, explanation: "(x + 1/x)^2 = x^2 + 2 + 1/x^2, তাই x^2 + 1/x^2 = 9 - 2 = 7।" },

  // ===== SSC - General Science (Additional) =====
  { id: "ssc-gs-006", examType: "ssc", subject: "General Science", topic: "Biology", difficulty: "easy", language: "en", question: "Which vitamin is produced by sunlight in human skin?", options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"], correctAnswer: 3, explanation: "Vitamin D is synthesized in the skin when exposed to sunlight (UV-B radiation)." },
  { id: "ssc-gs-007", examType: "ssc", subject: "General Science", topic: "Physics", difficulty: "medium", language: "en", question: "What is the unit of electrical resistance?", options: ["Ampere", "Volt", "Ohm", "Watt"], correctAnswer: 2, explanation: "The unit of electrical resistance is Ohm, named after Georg Simon Ohm." },
  { id: "ssc-gs-008", examType: "ssc", subject: "General Science", topic: "Chemistry", difficulty: "easy", language: "bn", question: "পানির রাসায়নিক সংকেত কী?", options: ["HO", "H2O", "OH2", "H2O2"], correctAnswer: 1, explanation: "পানির রাসায়নিক সংকেত H2O (দুটি হাইড্রোজেন ও একটি অক্সিজেন পরমাণু)।" },
  { id: "ssc-gs-009", examType: "ssc", subject: "General Science", topic: "Biology", difficulty: "medium", language: "bn", question: "রক্তের গ্রুপ কত প্রকার?", options: ["২ প্রকার", "৩ প্রকার", "৪ প্রকার", "৬ প্রকার"], correctAnswer: 2, explanation: "রক্তের গ্রুপ ৪ প্রকার: A, B, AB এবং O।" },

  // ===== SSC - Physics (Additional) =====
  { id: "ssc-phy-006", examType: "ssc", subject: "Physics", topic: "Mechanics", difficulty: "easy", language: "en", question: "What is the formula for velocity?", options: ["v = d/t", "v = d x t", "v = t/d", "v = d + t"], correctAnswer: 0, explanation: "Velocity = Distance / Time (v = d/t)." },
  { id: "ssc-phy-007", examType: "ssc", subject: "Physics", topic: "Light", difficulty: "medium", language: "en", question: "What is the phenomenon of bending of light called?", options: ["Reflection", "Refraction", "Diffraction", "Polarization"], correctAnswer: 1, explanation: "Refraction is the bending of light when it passes from one medium to another." },
  { id: "ssc-phy-008", examType: "ssc", subject: "Physics", topic: "Sound", difficulty: "easy", language: "bn", question: "শব্দ কোন মাধ্যমে চলতে পারে না?", options: ["বায়ু", "পানি", "লোহা", "শূন্যস্থান"], correctAnswer: 3, explanation: "শব্দ শূন্যস্থানে (vacuum) চলতে পারে না কারণ শব্দের জন্য জড় মাধ্যম প্রয়োজন।" },
  { id: "ssc-phy-009", examType: "ssc", subject: "Physics", topic: "Heat", difficulty: "medium", language: "en", question: "What is the boiling point of water in Celsius?", options: ["90°C", "100°C", "110°C", "120°C"], correctAnswer: 1, explanation: "Water boils at 100°C (212°F) at standard atmospheric pressure." },
  { id: "ssc-phy-010", examType: "ssc", subject: "Physics", topic: "Electricity", difficulty: "hard", language: "en", question: "What is the equivalent resistance of two 10-ohm resistors in parallel?", options: ["5 ohm", "10 ohm", "15 ohm", "20 ohm"], correctAnswer: 0, explanation: "For parallel resistors: 1/R = 1/R1 + 1/R2 = 1/10 + 1/10 = 1/5, so R = 5 ohm." },

  // ===== SSC - Chemistry (Additional) =====
  { id: "ssc-chem-006", examType: "ssc", subject: "Chemistry", topic: "Inorganic Chemistry", difficulty: "easy", language: "en", question: "What is the chemical symbol for Gold?", options: ["Go", "Gd", "Au", "Ag"], correctAnswer: 2, explanation: "Gold's chemical symbol is Au, from the Latin word 'Aurum'." },
  { id: "ssc-chem-007", examType: "ssc", subject: "Chemistry", topic: "Physical Chemistry", difficulty: "medium", language: "en", question: "What type of bond is formed between NaCl?", options: ["Covalent bond", "Ionic bond", "Metallic bond", "Hydrogen bond"], correctAnswer: 1, explanation: "NaCl (sodium chloride) is formed by an ionic bond between Na+ and Cl- ions." },
  { id: "ssc-chem-008", examType: "ssc", subject: "Chemistry", topic: "Organic Chemistry", difficulty: "hard", language: "en", question: "What is the general formula of alkanes?", options: ["CnH2n", "CnH2n+2", "CnH2n-2", "CnHn"], correctAnswer: 1, explanation: "The general formula of alkanes (saturated hydrocarbons) is CnH2n+2." },
  { id: "ssc-chem-009", examType: "ssc", subject: "Chemistry", topic: "Inorganic Chemistry", difficulty: "easy", language: "bn", question: "অক্সিজেনের রাসায়নিক প্রতীক কী?", options: ["Ox", "O", "O2", "On"], correctAnswer: 1, explanation: "অক্সিজেনের রাসায়নিক প্রতীক হলো O।" },

  // ===== SSC - Biology (Additional) =====
  { id: "ssc-bio-006", examType: "ssc", subject: "Biology", topic: "Cell Biology", difficulty: "easy", language: "en", question: "What is the basic unit of life?", options: ["Atom", "Molecule", "Cell", "Tissue"], correctAnswer: 2, explanation: "The cell is the basic structural and functional unit of all living organisms." },
  { id: "ssc-bio-007", examType: "ssc", subject: "Biology", topic: "Human Physiology", difficulty: "medium", language: "en", question: "Which organ pumps blood throughout the body?", options: ["Brain", "Liver", "Heart", "Kidney"], correctAnswer: 2, explanation: "The heart is a muscular organ that pumps blood through the circulatory system." },
  { id: "ssc-bio-008", examType: "ssc", subject: "Biology", topic: "Botany", difficulty: "easy", language: "bn", question: "উদ্ভিদের খাদ্য তৈরির জন্য কী প্রয়োজন?", options: ["শুধু পানি", "সূর্যালোক, পানি ও CO2", "শুধু মাটি", "শুধু বাতাস"], correctAnswer: 1, explanation: "সালোকসংশ্লেষণে সূর্যালোক, পানি ও কার্বন ডাই অক্সাইড (CO2) প্রয়োজন।" },
  { id: "ssc-bio-009", examType: "ssc", subject: "Biology", topic: "Ecology", difficulty: "medium", language: "en", question: "What is the study of ecosystems called?", options: ["Botany", "Zoology", "Ecology", "Genetics"], correctAnswer: 2, explanation: "Ecology is the study of ecosystems and the interactions between organisms and their environment." },

  // ===== SSC - Higher Mathematics =====
  { id: "ssc-hm-001", examType: "ssc", subject: "Higher Mathematics", topic: "Set Theory", difficulty: "easy", language: "en", question: "If A = {1,2,3} and B = {2,3,4}, what is A ∩ B?", options: ["{1,2,3,4}", "{2,3}", "{1,4}", "{1}"], correctAnswer: 1, explanation: "A ∩ B (intersection) contains elements common to both sets: {2,3}." },
  { id: "ssc-hm-002", examType: "ssc", subject: "Higher Mathematics", topic: "Algebra", difficulty: "medium", language: "en", question: "What is the discriminant of ax^2 + bx + c = 0?", options: ["b^2 + 4ac", "b^2 - 4ac", "4ac - b^2", "a^2 - 4bc"], correctAnswer: 1, explanation: "The discriminant is b^2 - 4ac. It determines the nature of roots." },
  { id: "ssc-hm-003", examType: "ssc", subject: "Higher Mathematics", topic: "Trigonometry", difficulty: "medium", language: "bn", question: "sin^2θ + cos^2θ = কত?", options: ["0", "1", "2", "θ"], correctAnswer: 1, explanation: "এটি ত্রিকোণমিতির মৌলিক অভেদ: sin^2θ + cos^2θ = 1।" },
  { id: "ssc-hm-004", examType: "ssc", subject: "Higher Mathematics", topic: "Coordinate Geometry", difficulty: "hard", language: "en", question: "What is the distance between points (1,2) and (4,6)?", options: ["3", "4", "5", "7"], correctAnswer: 2, explanation: "Distance = sqrt((4-1)^2 + (6-2)^2) = sqrt(9+16) = sqrt(25) = 5." },

  // ===== SSC - Bangladesh & Global Studies =====
  { id: "ssc-bg-001", examType: "ssc", subject: "Bangladesh & Global Studies", topic: "History", difficulty: "easy", language: "en", question: "When did the Language Movement take place?", options: ["1947", "1952", "1966", "1971"], correctAnswer: 1, explanation: "The Language Movement took place on February 21, 1952, for the recognition of Bangla as a state language." },
  { id: "ssc-bg-002", examType: "ssc", subject: "Bangladesh & Global Studies", topic: "Geography", difficulty: "medium", language: "en", question: "Which river is the lifeline of Bangladesh?", options: ["Ganges", "Brahmaputra", "Meghna", "All of the above"], correctAnswer: 3, explanation: "The Ganges, Brahmaputra, and Meghna river systems are collectively the lifeline of Bangladesh." },
  { id: "ssc-bg-003", examType: "ssc", subject: "Bangladesh & Global Studies", topic: "History", difficulty: "easy", language: "bn", question: "ভাষা আন্দোলন কত সালে হয়েছিল?", options: ["১৯৪৭", "১৯৫২", "১৯৬৬", "১৯৭১"], correctAnswer: 1, explanation: "ভাষা আন্দোলন ১৯৫২ সালের ২১ ফেব্রুয়ারি হয়েছিল।" },
  { id: "ssc-bg-004", examType: "ssc", subject: "Bangladesh & Global Studies", topic: "Economy", difficulty: "medium", language: "bn", question: "বাংলাদেশের GDP-তে সবচেয়ে বেশি অবদান কোন খাতের?", options: ["কৃষি", "শিল্প", "সেবা", "মৎস্য"], correctAnswer: 2, explanation: "সেবা খাত বাংলাদেশের GDP-তে সবচেয়ে বেশি অবদান রাখে।" },

  // ===== SSC - ICT (Additional) =====
  { id: "ssc-ict-003", examType: "ssc", subject: "ICT", topic: "Basics", difficulty: "easy", language: "en", question: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Computer Processing Unit"], correctAnswer: 0, explanation: "CPU stands for Central Processing Unit, the brain of the computer." },
  { id: "ssc-ict-004", examType: "ssc", subject: "ICT", topic: "Networking", difficulty: "medium", language: "en", question: "What does LAN stand for?", options: ["Large Area Network", "Local Access Network", "Local Area Network", "Long Area Network"], correctAnswer: 2, explanation: "LAN stands for Local Area Network, a network limited to a small geographic area." },
  { id: "ssc-ict-005", examType: "ssc", subject: "ICT", topic: "Programming", difficulty: "hard", language: "en", question: "Which generation of programming language is Assembly?", options: ["First", "Second", "Third", "Fourth"], correctAnswer: 1, explanation: "Assembly language is a second-generation programming language (2GL)." },

  // ===== HSC - English (Additional) =====
  { id: "hsc-en-001", examType: "hsc", subject: "English", topic: "Grammar", difficulty: "easy", language: "en", question: "Identify the passive voice: 'The cake was eaten by the children.'", options: ["Active voice", "Passive voice", "Imperative", "None"], correctAnswer: 1, explanation: "In passive voice, the object of the action becomes the subject. Here 'cake' receives the action." },
  { id: "hsc-en-002", examType: "hsc", subject: "English", topic: "Vocabulary", difficulty: "medium", language: "en", question: "The word 'Prolific' means:", options: ["Lazy", "Unproductive", "Producing abundantly", "Slow"], correctAnswer: 2, explanation: "'Prolific' means producing a lot of something, especially creative work." },
  { id: "hsc-en-003", examType: "hsc", subject: "English", topic: "Reading Comprehension", difficulty: "hard", language: "en", question: "What is an 'oxymoron'?", options: ["A type of metaphor", "Contradictory terms together", "A long sentence", "A type of alliteration"], correctAnswer: 1, explanation: "An oxymoron combines contradictory terms, like 'jumbo shrimp' or 'living dead'." },
  { id: "hsc-en-004", examType: "hsc", subject: "English", topic: "Grammar", difficulty: "medium", language: "en", question: "'Scarcely had I arrived ___ it started raining.' Fill in:", options: ["when", "than", "then", "before"], correctAnswer: 0, explanation: "'Scarcely...when' is a correlative conjunction pair used for sequential past events." },

  // ===== HSC - Physics (Additional) =====
  { id: "hsc-phy-006", examType: "hsc", subject: "Physics", topic: "Mechanics", difficulty: "easy", language: "en", question: "What is the formula for kinetic energy?", options: ["KE = mv", "KE = 1/2 mv^2", "KE = mgh", "KE = Fd"], correctAnswer: 1, explanation: "Kinetic energy = 1/2 mv^2, where m is mass and v is velocity." },
  { id: "hsc-phy-007", examType: "hsc", subject: "Physics", topic: "Waves", difficulty: "medium", language: "en", question: "What is the relationship between frequency and wavelength?", options: ["v = fλ", "v = f/λ", "v = f + λ", "v = f - λ"], correctAnswer: 0, explanation: "Wave speed = frequency x wavelength (v = fλ)." },
  { id: "hsc-phy-008", examType: "hsc", subject: "Physics", topic: "Optics", difficulty: "medium", language: "en", question: "Total internal reflection occurs when light travels from:", options: ["Rarer to denser medium", "Denser to rarer medium", "Vacuum to air", "Any medium to any medium"], correctAnswer: 1, explanation: "Total internal reflection occurs when light passes from a denser to a rarer medium at an angle greater than the critical angle." },
  { id: "hsc-phy-009", examType: "hsc", subject: "Physics", topic: "Electricity", difficulty: "hard", language: "en", question: "What is Kirchhoff's current law?", options: ["Sum of currents entering = sum leaving", "V = IR", "P = IV", "F = qvB"], correctAnswer: 0, explanation: "Kirchhoff's current law (KCL) states that the sum of currents entering a junction equals the sum leaving it." },
  { id: "hsc-phy-010", examType: "hsc", subject: "Physics", topic: "Modern Physics", difficulty: "hard", language: "en", question: "Who proposed the uncertainty principle?", options: ["Einstein", "Bohr", "Heisenberg", "Schrodinger"], correctAnswer: 2, explanation: "Werner Heisenberg proposed the uncertainty principle in 1927." },
  { id: "hsc-phy-011", examType: "hsc", subject: "Physics", topic: "Mechanics", difficulty: "easy", language: "bn", question: "মহাকর্ষ বলের সূত্র কে আবিষ্কার করেন?", options: ["আইনস্টাইন", "নিউটন", "গ্যালিলিও", "কেপলার"], correctAnswer: 1, explanation: "স্যার আইজ্যাক নিউটন মহাকর্ষ বলের সূত্র আবিষ্কার করেন।" },

  // ===== HSC - Chemistry (Additional) =====
  { id: "hsc-chem-006", examType: "hsc", subject: "Chemistry", topic: "Organic Chemistry", difficulty: "medium", language: "en", question: "What is the functional group of carboxylic acids?", options: ["-OH", "-CHO", "-COOH", "-CO"], correctAnswer: 2, explanation: "Carboxylic acids contain the -COOH (carboxyl) functional group." },
  { id: "hsc-chem-007", examType: "hsc", subject: "Chemistry", topic: "Physical Chemistry", difficulty: "hard", language: "en", question: "What is Avogadro's number?", options: ["6.022 x 10^20", "6.022 x 10^23", "6.022 x 10^26", "6.022 x 10^29"], correctAnswer: 1, explanation: "Avogadro's number is 6.022 x 10^23, the number of particles in one mole of substance." },
  { id: "hsc-chem-008", examType: "hsc", subject: "Chemistry", topic: "Inorganic Chemistry", difficulty: "easy", language: "bn", question: "পর্যায় সারণির আবিষ্কারক কে?", options: ["নিউটন", "মেন্ডেলিভ", "ডাল্টন", "বোর"], correctAnswer: 1, explanation: "দিমিত্রি মেন্ডেলিভ আধুনিক পর্যায় সারণির আবিষ্কারক।" },
  { id: "hsc-chem-009", examType: "hsc", subject: "Chemistry", topic: "Physical Chemistry", difficulty: "medium", language: "en", question: "What is the molar mass of CO2?", options: ["28 g/mol", "32 g/mol", "44 g/mol", "48 g/mol"], correctAnswer: 2, explanation: "CO2 molar mass = 12 (C) + 2 x 16 (O) = 44 g/mol." },

  // ===== HSC - Biology (Additional) =====
  { id: "hsc-bio-006", examType: "hsc", subject: "Biology", topic: "Cell Biology", difficulty: "easy", language: "en", question: "Which organelle stores genetic information?", options: ["Ribosome", "Nucleus", "Mitochondria", "Vacuole"], correctAnswer: 1, explanation: "The nucleus contains DNA and stores the genetic information of the cell." },
  { id: "hsc-bio-007", examType: "hsc", subject: "Biology", topic: "Genetics", difficulty: "medium", language: "en", question: "What is the shape of DNA?", options: ["Single helix", "Double helix", "Triple helix", "Flat ribbon"], correctAnswer: 1, explanation: "DNA has a double helix structure, discovered by Watson and Crick in 1953." },
  { id: "hsc-bio-008", examType: "hsc", subject: "Biology", topic: "Human Physiology", difficulty: "medium", language: "bn", question: "মানবদেহে সবচেয়ে বড় গ্রন্থি কোনটি?", options: ["থাইরয়েড", "যকৃত", "অগ্ন্যাশয়", "পিটুইটারি"], correctAnswer: 1, explanation: "যকৃত (Liver) মানবদেহের সবচেয়ে বড় গ্রন্থি।" },
  { id: "hsc-bio-009", examType: "hsc", subject: "Biology", topic: "Botany", difficulty: "easy", language: "en", question: "What gas do plants release during photosynthesis?", options: ["Carbon dioxide", "Nitrogen", "Oxygen", "Hydrogen"], correctAnswer: 2, explanation: "Plants release oxygen (O2) as a byproduct of photosynthesis." },
  { id: "hsc-bio-010", examType: "hsc", subject: "Biology", topic: "Ecology", difficulty: "hard", language: "en", question: "What is the term for the maximum population an environment can sustain?", options: ["Biome", "Niche", "Carrying capacity", "Biodiversity"], correctAnswer: 2, explanation: "Carrying capacity is the maximum number of individuals an environment can sustain indefinitely." },

  // ===== HSC - Higher Mathematics (Additional) =====
  { id: "hsc-hm-001", examType: "hsc", subject: "Higher Mathematics", topic: "Calculus", difficulty: "medium", language: "en", question: "What is the derivative of x^3?", options: ["x^2", "2x^2", "3x^2", "3x"], correctAnswer: 2, explanation: "Using the power rule: d/dx(x^3) = 3x^2." },
  { id: "hsc-hm-002", examType: "hsc", subject: "Higher Mathematics", topic: "Algebra", difficulty: "easy", language: "en", question: "What is 5! (5 factorial)?", options: ["20", "60", "100", "120"], correctAnswer: 3, explanation: "5! = 5 x 4 x 3 x 2 x 1 = 120." },
  { id: "hsc-hm-003", examType: "hsc", subject: "Higher Mathematics", topic: "Trigonometry", difficulty: "hard", language: "en", question: "What is the period of sin(2x)?", options: ["π/2", "π", "2π", "4π"], correctAnswer: 1, explanation: "The period of sin(kx) is 2π/k. So for sin(2x), the period is 2π/2 = π." },
  { id: "hsc-hm-004", examType: "hsc", subject: "Higher Mathematics", topic: "Coordinate Geometry", difficulty: "medium", language: "bn", question: "y = mx + c সমীকরণে m কী নির্দেশ করে?", options: ["y-অংশ", "x-অংশ", "ঢাল", "মূলবিন্দু"], correctAnswer: 2, explanation: "y = mx + c সমীকরণে m হলো সরলরেখার ঢাল (slope/gradient)।" },
  { id: "hsc-hm-005", examType: "hsc", subject: "Higher Mathematics", topic: "Statistics", difficulty: "easy", language: "en", question: "What is the median of 3, 7, 1, 5, 9?", options: ["3", "5", "7", "9"], correctAnswer: 1, explanation: "Arrange in order: 1, 3, 5, 7, 9. The middle value (median) is 5." },

  // ===== HSC - ICT (Additional) =====
  { id: "hsc-ict-002", examType: "hsc", subject: "ICT", topic: "Basics", difficulty: "easy", language: "en", question: "What is the binary equivalent of decimal 10?", options: ["1000", "1010", "1100", "1110"], correctAnswer: 1, explanation: "Decimal 10 = Binary 1010 (8+0+2+0)." },
  { id: "hsc-ict-003", examType: "hsc", subject: "ICT", topic: "Networking", difficulty: "medium", language: "en", question: "What does HTTP stand for?", options: ["Hyper Text Transfer Protocol", "High Tech Transfer Protocol", "Hyper Terminal Transfer Program", "Home Text Transfer Protocol"], correctAnswer: 0, explanation: "HTTP = HyperText Transfer Protocol, the foundation of data communication on the web." },
  { id: "hsc-ict-004", examType: "hsc", subject: "ICT", topic: "Programming", difficulty: "hard", language: "en", question: "What is the time complexity of binary search?", options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"], correctAnswer: 2, explanation: "Binary search has O(log n) time complexity as it halves the search space each step." },
  { id: "hsc-ict-005", examType: "hsc", subject: "ICT", topic: "Basics", difficulty: "easy", language: "bn", question: "RAM এর পূর্ণরূপ কী?", options: ["Read Access Memory", "Random Access Memory", "Run Access Memory", "Rapid Access Memory"], correctAnswer: 1, explanation: "RAM = Random Access Memory, কম্পিউটারের প্রাথমিক মেমোরি।" },

  // ===== HSC - Economics =====
  { id: "hsc-eco-001", examType: "hsc", subject: "Economics", topic: "Basics", difficulty: "easy", language: "en", question: "What is the law of demand?", options: ["Price up, demand up", "Price up, demand down", "Price down, demand down", "Price unchanged"], correctAnswer: 1, explanation: "The law of demand states that as price increases, quantity demanded decreases, ceteris paribus." },
  { id: "hsc-eco-002", examType: "hsc", subject: "Economics", topic: "Economy", difficulty: "medium", language: "en", question: "What is GDP?", options: ["Gross Domestic Product", "General Domestic Price", "Gross Development Plan", "General Development Product"], correctAnswer: 0, explanation: "GDP = Gross Domestic Product, the total value of goods and services produced in a country." },
  { id: "hsc-eco-003", examType: "hsc", subject: "Economics", topic: "Basics", difficulty: "easy", language: "bn", question: "অর্থনীতির জনক কে?", options: ["কার্ল মার্কস", "অ্যাডাম স্মিথ", "জন কেইনস", "ডেভিড রিকার্ডো"], correctAnswer: 1, explanation: "অ্যাডাম স্মিথকে আধুনিক অর্থনীতির জনক বলা হয়।" },

  // ===== HSC - Accounting =====
  { id: "hsc-acc-001", examType: "hsc", subject: "Accounting", topic: "Basics", difficulty: "easy", language: "en", question: "What is the accounting equation?", options: ["Assets = Liabilities + Equity", "Assets = Liabilities - Equity", "Assets + Liabilities = Equity", "Assets - Equity = Revenue"], correctAnswer: 0, explanation: "The fundamental accounting equation: Assets = Liabilities + Owner's Equity." },
  { id: "hsc-acc-002", examType: "hsc", subject: "Accounting", topic: "General", difficulty: "medium", language: "en", question: "Which financial statement shows profit or loss?", options: ["Balance Sheet", "Income Statement", "Cash Flow Statement", "Statement of Equity"], correctAnswer: 1, explanation: "The Income Statement (Profit & Loss Statement) shows revenue, expenses, and resulting profit or loss." },
  { id: "hsc-acc-003", examType: "hsc", subject: "Accounting", topic: "Basics", difficulty: "easy", language: "bn", question: "হিসাববিজ্ঞানের ভাষায় 'ডেবিট' অর্থ কী?", options: ["পাওনা", "দেনা", "বাম পাশ", "ডান পাশ"], correctAnswer: 2, explanation: "হিসাববিজ্ঞানে ডেবিট হলো হিসাবের বাম পাশে লেখা।" },

  // ===== HSC - Bangla (Additional) =====
  { id: "hsc-bn-003", examType: "hsc", subject: "Bangla", topic: "Grammar", difficulty: "easy", language: "bn", question: "'ণত্ব বিধান' কোন ধ্বনির জন্য প্রযোজ্য?", options: ["ন", "ণ", "ম", "ঙ"], correctAnswer: 1, explanation: "'ণত্ব বিধান' মূর্ধন্য 'ণ' ব্যবহারের নিয়ম।" },
  { id: "hsc-bn-004", examType: "hsc", subject: "Bangla", topic: "Literature", difficulty: "medium", language: "bn", question: "'নকশী কাঁথার মাঠ' এর রচয়িতা কে?", options: ["কাজী নজরুল ইসলাম", "জসীমউদ্দীন", "রবীন্দ্রনাথ ঠাকুর", "ফররুখ আহমদ"], correctAnswer: 1, explanation: "'নকশী কাঁথার মাঠ' পল্লীকবি জসীমউদ্দীনের বিখ্যাত কাব্যগ্রন্থ।" },
  { id: "hsc-bn-005", examType: "hsc", subject: "Bangla", topic: "Composition", difficulty: "hard", language: "bn", question: "'অপলাপ' শব্দের অর্থ কী?", options: ["অতিরিক্ত কথা", "অস্বীকার করা", "অল্প কথা", "সত্য কথা"], correctAnswer: 1, explanation: "'অপলাপ' শব্দের অর্থ অস্বীকার করা বা অন্যায়ভাবে অস্বীকার।" },

  // ===== JSC - Bangla (Additional) =====
  { id: "jsc-bn-001", examType: "jsc", subject: "Bangla", topic: "Grammar", difficulty: "easy", language: "bn", question: "'পদ' কাকে বলে?", options: ["বাক্যে ব্যবহৃত শব্দ", "অর্থহীন ধ্বনি", "বিভক্তিযুক্ত শব্দ", "সকল শব্দ"], correctAnswer: 2, explanation: "বিভক্তিযুক্ত শব্দকে পদ বলে। বাক্যে ব্যবহৃত প্রতিটি শব্দই পদ।" },
  { id: "jsc-bn-002", examType: "jsc", subject: "Bangla", topic: "Literature", difficulty: "easy", language: "bn", question: "'আমার ভাইয়ের রক্তে রাঙানো' গানটির রচয়িতা কে?", options: ["রবীন্দ্রনাথ ঠাকুর", "আব্দুল গাফফার চৌধুরী", "কাজী নজরুল ইসলাম", "শামসুর রাহমান"], correctAnswer: 1, explanation: "'আমার ভাইয়ের রক্তে রাঙানো' গানটি আব্দুল গাফফার চৌধুরীর রচনা, ভাষা আন্দোলনের পটভূমিতে।" },
  { id: "jsc-bn-003", examType: "jsc", subject: "Bangla", topic: "Grammar", difficulty: "medium", language: "bn", question: "বাক্য কত প্রকার?", options: ["২ প্রকার", "৩ প্রকার", "৪ প্রকার", "৫ প্রকার"], correctAnswer: 1, explanation: "গঠন অনুসারে বাক্য ৩ প্রকার: সরল, জটিল ও যৌগিক।" },

  // ===== JSC - English (Additional) =====
  { id: "jsc-en-001", examType: "jsc", subject: "English", topic: "Grammar", difficulty: "easy", language: "en", question: "What is the plural of 'child'?", options: ["Childs", "Childrens", "Children", "Childes"], correctAnswer: 2, explanation: "The plural of 'child' is 'children' (irregular plural)." },
  { id: "jsc-en-002", examType: "jsc", subject: "English", topic: "Vocabulary", difficulty: "easy", language: "en", question: "What does 'Beautiful' mean?", options: ["Ugly", "Pretty", "Sad", "Angry"], correctAnswer: 1, explanation: "'Beautiful' means pleasing to the senses, similar to 'pretty' or 'attractive'." },
  { id: "jsc-en-003", examType: "jsc", subject: "English", topic: "Grammar", difficulty: "medium", language: "en", question: "Which word is an adjective in: 'The tall boy runs fast'?", options: ["The", "tall", "runs", "fast"], correctAnswer: 1, explanation: "'Tall' is an adjective as it describes the noun 'boy'." },
  { id: "jsc-en-004", examType: "jsc", subject: "English", topic: "Comprehension", difficulty: "medium", language: "en", question: "What is a 'paragraph'?", options: ["A single word", "A group of related sentences", "A type of poem", "A long story"], correctAnswer: 1, explanation: "A paragraph is a group of related sentences that develop a single idea." },

  // ===== JSC - Mathematics (Additional) =====
  { id: "jsc-math-001", examType: "jsc", subject: "Mathematics", topic: "Arithmetic", difficulty: "easy", language: "en", question: "What is 25% of 80?", options: ["15", "20", "25", "30"], correctAnswer: 1, explanation: "25% of 80 = (25/100) x 80 = 20." },
  { id: "jsc-math-002", examType: "jsc", subject: "Mathematics", topic: "Algebra", difficulty: "medium", language: "en", question: "Solve: 2x + 3 = 11", options: ["x = 3", "x = 4", "x = 5", "x = 6"], correctAnswer: 1, explanation: "2x + 3 = 11; 2x = 8; x = 4." },
  { id: "jsc-math-003", examType: "jsc", subject: "Mathematics", topic: "Geometry", difficulty: "easy", language: "bn", question: "একটি আয়তক্ষেত্রের দৈর্ঘ্য ৮ সেমি ও প্রস্থ ৫ সেমি হলে ক্ষেত্রফল কত?", options: ["১৩ বর্গ সেমি", "২৬ বর্গ সেমি", "৪০ বর্গ সেমি", "৮০ বর্গ সেমি"], correctAnswer: 2, explanation: "আয়তক্ষেত্রের ক্ষেত্রফল = দৈর্ঘ্য × প্রস্থ = ৮ × ৫ = ৪০ বর্গ সেমি।" },
  { id: "jsc-math-004", examType: "jsc", subject: "Mathematics", topic: "Arithmetic", difficulty: "medium", language: "bn", question: "৩ : ৫ অনুপাতে ৪০০ টাকা ভাগ করলে বড় অংশ কত?", options: ["১৫০ টাকা", "২০০ টাকা", "২৫০ টাকা", "৩০০ টাকা"], correctAnswer: 2, explanation: "বড় অংশ = (৫/৮) × ৪০০ = ২৫০ টাকা।" },

  // ===== JSC - Science (Additional) =====
  { id: "jsc-sci-001", examType: "jsc", subject: "Science", topic: "Biology", difficulty: "easy", language: "en", question: "What is the largest organ in the human body?", options: ["Heart", "Liver", "Skin", "Brain"], correctAnswer: 2, explanation: "The skin is the largest organ of the human body." },
  { id: "jsc-sci-002", examType: "jsc", subject: "Science", topic: "Physics", difficulty: "easy", language: "bn", question: "পৃথিবীর মহাকর্ষীয় ত্বরণ কত?", options: ["৮.৮ m/s^2", "৯.৮ m/s^2", "১০.৮ m/s^2", "১১.৮ m/s^2"], correctAnswer: 1, explanation: "পৃথিবীর মহাকর্ষীয় ত্বরণ প্রায় ৯.৮ m/s^2।" },
  { id: "jsc-sci-003", examType: "jsc", subject: "Science", topic: "Chemistry", difficulty: "medium", language: "en", question: "What gas do we breathe in?", options: ["Carbon dioxide", "Nitrogen", "Oxygen", "Hydrogen"], correctAnswer: 2, explanation: "We breathe in oxygen (O2) which is essential for cellular respiration." },
  { id: "jsc-sci-004", examType: "jsc", subject: "Science", topic: "Biology", difficulty: "medium", language: "bn", question: "সালোকসংশ্লেষণে কোন গ্যাস উৎপন্ন হয়?", options: ["কার্বন ডাইঅক্সাইড", "নাইট্রোজেন", "অক্সিজেন", "হাইড্রোজেন"], correctAnswer: 2, explanation: "সালোকসংশ্লেষণ প্রক্রিয়ায় অক্সিজেন (O2) গ্যাস উৎপন্ন হয়।" },

  // ===== JSC - Bangladesh & Global Studies =====
  { id: "jsc-bg-001", examType: "jsc", subject: "Bangladesh & Global Studies", topic: "History", difficulty: "easy", language: "en", question: "When was Bangladesh liberated?", options: ["1947", "1952", "1966", "1971"], correctAnswer: 3, explanation: "Bangladesh was liberated on December 16, 1971, after a nine-month liberation war." },
  { id: "jsc-bg-002", examType: "jsc", subject: "Bangladesh & Global Studies", topic: "Geography", difficulty: "easy", language: "bn", question: "বাংলাদেশের মোট আয়তন কত?", options: ["১,০০,০০০ বর্গ কি.মি.", "১,৪৭,৫৭০ বর্গ কি.মি.", "১,৫০,০০০ বর্গ কি.মি.", "২,০০,০০০ বর্গ কি.মি."], correctAnswer: 1, explanation: "বাংলাদেশের মোট আয়তন প্রায় ১,৪৭,৫৭০ বর্গ কিলোমিটার।" },
  { id: "jsc-bg-003", examType: "jsc", subject: "Bangladesh & Global Studies", topic: "History", difficulty: "medium", language: "bn", question: "বাংলাদেশের স্বাধীনতা ঘোষণা কে করেন?", options: ["তাজউদ্দীন আহমদ", "সৈয়দ নজরুল ইসলাম", "বঙ্গবন্ধু শেখ মুজিবুর রহমান", "জিয়াউর রহমান"], correctAnswer: 2, explanation: "১৯৭১ সালের ২৬ মার্চ বঙ্গবন্ধু শেখ মুজিবুর রহমান বাংলাদেশের স্বাধীনতা ঘোষণা করেন।" },

  // ===== JSC - ICT =====
  { id: "jsc-ict-001", examType: "jsc", subject: "ICT", topic: "Basics", difficulty: "easy", language: "en", question: "What does ICT stand for?", options: ["Information and Communication Technology", "International Computer Technology", "Internet Communication Tool", "Intelligent Computing Technology"], correctAnswer: 0, explanation: "ICT = Information and Communication Technology." },
  { id: "jsc-ict-002", examType: "jsc", subject: "ICT", topic: "Basics", difficulty: "easy", language: "bn", question: "কম্পিউটারের মস্তিষ্ক বলা হয় কাকে?", options: ["RAM", "ROM", "CPU", "Hard Disk"], correctAnswer: 2, explanation: "CPU (Central Processing Unit) কে কম্পিউটারের মস্তিষ্ক বলা হয়।" },

  // ===== PSC - Bangla (Additional) =====
  { id: "psc-bn-001", examType: "psc", subject: "Bangla", topic: "Grammar", difficulty: "easy", language: "bn", question: "'মা' শব্দটি কোন পদ?", options: ["বিশেষ্য", "বিশেষণ", "সর্বনাম", "ক্রিয়া"], correctAnswer: 0, explanation: "'মা' একটি বিশেষ্য পদ কারণ এটি একটি সম্পর্কবাচক নাম।" },
  { id: "psc-bn-002", examType: "psc", subject: "Bangla", topic: "Literature", difficulty: "easy", language: "bn", question: "'আমাদের ছোট নদী' কবিতাটি কার লেখা?", options: ["কাজী নজরুল ইসলাম", "রবীন্দ্রনাথ ঠাকুর", "সুকুমার রায়", "যতীন্দ্রমোহন বাগচী"], correctAnswer: 1, explanation: "'আমাদের ছোট নদী' কবিতাটি রবীন্দ্রনাথ ঠাকুরের লেখা।" },
  { id: "psc-bn-003", examType: "psc", subject: "Bangla", topic: "Grammar", difficulty: "medium", language: "bn", question: "'আমি স্কুলে যাই' - এখানে 'যাই' কোন পদ?", options: ["বিশেষ্য", "বিশেষণ", "ক্রিয়া", "অব্যয়"], correctAnswer: 2, explanation: "'যাই' একটি ক্রিয়াপদ কারণ এটি কোনো কাজ করা বোঝায়।" },

  // ===== PSC - English (Additional) =====
  { id: "psc-en-001", examType: "psc", subject: "English", topic: "Grammar", difficulty: "easy", language: "en", question: "What is the opposite of 'big'?", options: ["Tall", "Small", "Wide", "Long"], correctAnswer: 1, explanation: "The opposite of 'big' is 'small'." },
  { id: "psc-en-002", examType: "psc", subject: "English", topic: "Vocabulary", difficulty: "easy", language: "en", question: "What is the meaning of 'Happy'?", options: ["Sad", "Angry", "Glad", "Tired"], correctAnswer: 2, explanation: "'Happy' means feeling glad or pleased." },
  { id: "psc-en-003", examType: "psc", subject: "English", topic: "Grammar", difficulty: "medium", language: "en", question: "Choose the correct article: '___ sun rises in the east.'", options: ["A", "An", "The", "No article"], correctAnswer: 2, explanation: "'The' is used before unique objects like the sun, the moon, the earth." },
  { id: "psc-en-004", examType: "psc", subject: "English", topic: "Vocabulary", difficulty: "easy", language: "en", question: "What is a 'doctor'?", options: ["A person who teaches", "A person who treats sick people", "A person who cooks", "A person who builds"], correctAnswer: 1, explanation: "A doctor is a person who treats sick and injured people." },

  // ===== PSC - Mathematics (Additional) =====
  { id: "psc-math-001", examType: "psc", subject: "Mathematics", topic: "Arithmetic", difficulty: "easy", language: "en", question: "What is 7 + 8?", options: ["13", "14", "15", "16"], correctAnswer: 2, explanation: "7 + 8 = 15." },
  { id: "psc-math-002", examType: "psc", subject: "Mathematics", topic: "Arithmetic", difficulty: "easy", language: "bn", question: "৯ × ৭ = কত?", options: ["৫৬", "৬৩", "৭২", "৮১"], correctAnswer: 1, explanation: "৯ × ৭ = ৬৩।" },
  { id: "psc-math-003", examType: "psc", subject: "Mathematics", topic: "Geometry", difficulty: "easy", language: "en", question: "How many sides does a triangle have?", options: ["2", "3", "4", "5"], correctAnswer: 1, explanation: "A triangle has 3 sides. 'Tri' means three." },
  { id: "psc-math-004", examType: "psc", subject: "Mathematics", topic: "Measurement", difficulty: "easy", language: "bn", question: "১ কিলোমিটার = কত মিটার?", options: ["১০ মিটার", "১০০ মিটার", "১০০০ মিটার", "১০০০০ মিটার"], correctAnswer: 2, explanation: "১ কিলোমিটার = ১০০০ মিটার।" },
  { id: "psc-math-005", examType: "psc", subject: "Mathematics", topic: "Arithmetic", difficulty: "medium", language: "en", question: "What is 144 divided by 12?", options: ["10", "11", "12", "13"], correctAnswer: 2, explanation: "144 / 12 = 12." },
  { id: "psc-math-006", examType: "psc", subject: "Mathematics", topic: "Geometry", difficulty: "easy", language: "bn", question: "বৃত্তের কেন্দ্র থেকে পরিধি পর্যন্ত দূরত্বকে কী বলে?", options: ["ব্যাস", "ব্যাসার্ধ", "জ্যা", "চাপ"], correctAnswer: 1, explanation: "বৃত্তের কেন্দ্র থেকে পরিধি পর্যন্ত দূরত্বকে ব্যাসার্ধ (radius) বলে।" },

  // ===== PSC - Science (Additional) =====
  { id: "psc-sci-001", examType: "psc", subject: "Science", topic: "Environment", difficulty: "easy", language: "en", question: "What do plants need to grow?", options: ["Only water", "Sunlight, water, and soil", "Only air", "Only soil"], correctAnswer: 1, explanation: "Plants need sunlight, water, and soil (nutrients) to grow." },
  { id: "psc-sci-002", examType: "psc", subject: "Science", topic: "General", difficulty: "easy", language: "bn", question: "পানির তিনটি অবস্থা কী কী?", options: ["কঠিন, তরল, গ্যাসীয়", "গরম, ঠান্ডা, কুসুম", "লাল, নীল, সবুজ", "ছোট, মাঝারি, বড়"], correctAnswer: 0, explanation: "পানির তিনটি অবস্থা হলো: কঠিন (বরফ), তরল (পানি), ও গ্যাসীয় (জলীয় বাষ্প)।" },
  { id: "psc-sci-003", examType: "psc", subject: "Science", topic: "Environment", difficulty: "easy", language: "en", question: "Which planet do we live on?", options: ["Mars", "Venus", "Earth", "Jupiter"], correctAnswer: 2, explanation: "We live on planet Earth, the third planet from the Sun." },
  { id: "psc-sci-004", examType: "psc", subject: "Science", topic: "General", difficulty: "medium", language: "bn", question: "কোন প্রাণী ডিম পাড়ে?", options: ["গরু", "ছাগল", "মুরগি", "ভেড়া"], correctAnswer: 2, explanation: "মুরগি ডিম পাড়ে। গরু, ছাগল ও ভেড়া বাচ্চা প্রসব করে।" },

  // ===== PSC - Bangladesh & Global Studies (Additional) =====
  { id: "psc-bg-001", examType: "psc", subject: "Bangladesh & Global Studies", topic: "Bangladesh", difficulty: "easy", language: "en", question: "What is the national anthem of Bangladesh?", options: ["Joy Bangla", "Amar Sonar Bangla", "Bangladesh Zindabad", "Ekushe February"], correctAnswer: 1, explanation: "'Amar Sonar Bangla' written by Rabindranath Tagore is the national anthem of Bangladesh." },
  { id: "psc-bg-002", examType: "psc", subject: "Bangladesh & Global Studies", topic: "Bangladesh", difficulty: "easy", language: "bn", question: "বাংলাদেশের জাতীয় ফুল কোনটি?", options: ["গোলাপ", "শাপলা", "পদ্ম", "জবা"], correctAnswer: 1, explanation: "শাপলা বাংলাদেশের জাতীয় ফুল।" },
  { id: "psc-bg-003", examType: "psc", subject: "Bangladesh & Global Studies", topic: "History", difficulty: "easy", language: "bn", question: "বাংলাদেশ কত সালে স্বাধীন হয়?", options: ["১৯৪৭", "১৯৫২", "১৯৬৬", "১৯৭১"], correctAnswer: 3, explanation: "বাংলাদেশ ১৯৭১ সালে স্বাধীন হয়।" },
  { id: "psc-bg-004", examType: "psc", subject: "Bangladesh & Global Studies", topic: "Bangladesh", difficulty: "medium", language: "en", question: "How many divisions are in Bangladesh?", options: ["6", "7", "8", "9"], correctAnswer: 2, explanation: "Bangladesh has 8 administrative divisions." },

  // ===== Madrasah - Arabic (Additional) =====
  { id: "mad-ar-001", examType: "madrasah", subject: "Arabic", topic: "Nahw & Sarf", difficulty: "easy", language: "bn", question: "আরবি বর্ণমালায় মোট কতটি অক্ষর আছে?", options: ["২৬", "২৮", "৩০", "৩২"], correctAnswer: 1, explanation: "আরবি বর্ণমালায় মোট ২৮টি অক্ষর আছে।" },
  { id: "mad-ar-002", examType: "madrasah", subject: "Arabic", topic: "Nahw & Sarf", difficulty: "medium", language: "bn", question: "'ইসম' (اسم) কাকে বলে?", options: ["ক্রিয়া", "বিশেষ্য/নাম", "অব্যয়", "সর্বনাম"], correctAnswer: 1, explanation: "আরবি ব্যাকরণে 'ইসম' হলো বিশেষ্য বা নাম পদ।" },
  { id: "mad-ar-003", examType: "madrasah", subject: "Arabic", topic: "Arabic Literature", difficulty: "hard", language: "bn", question: "আরবি ভাষায় 'মুআল্লাকাত' কী?", options: ["ধর্মীয় গ্রন্থ", "প্রাক-ইসলামী কাব্য সংকলন", "হাদিস গ্রন্থ", "তাফসীর গ্রন্থ"], correctAnswer: 1, explanation: "'মুআল্লাকাত' প্রাক-ইসলামী যুগের সাতটি বিখ্যাত কাব্যের সংকলন।" },

  // ===== Madrasah - Quran Studies (Additional) =====
  { id: "mad-qr-001", examType: "madrasah", subject: "Quran Studies", topic: "Tafsir", difficulty: "easy", language: "bn", question: "পবিত্র কুরআনে মোট কতটি সূরা আছে?", options: ["১১০", "১১৪", "১২০", "১২৪"], correctAnswer: 1, explanation: "পবিত্র কুরআনে মোট ১১৪টি সূরা আছে।" },
  { id: "mad-qr-002", examType: "madrasah", subject: "Quran Studies", topic: "General", difficulty: "easy", language: "bn", question: "কুরআনের সর্বপ্রথম নাযিলকৃত সূরা কোনটি?", options: ["সূরা ফাতিহা", "সূরা আলাক", "সূরা বাকারা", "সূরা ইখলাস"], correctAnswer: 1, explanation: "সূরা আলাক (ইকরা) কুরআনের সর্বপ্রথম নাযিলকৃত সূরা।" },
  { id: "mad-qr-003", examType: "madrasah", subject: "Quran Studies", topic: "Tafsir", difficulty: "medium", language: "bn", question: "কুরআনের দীর্ঘতম সূরা কোনটি?", options: ["সূরা আলে ইমরান", "সূরা বাকারা", "সূরা নিসা", "সূরা মায়িদাহ"], correctAnswer: 1, explanation: "সূরা বাকারা কুরআনের দীর্ঘতম সূরা, এতে ২৮৬টি আয়াত আছে।" },

  // ===== Madrasah - Islamic Studies (Additional) =====
  { id: "mad-is-001", examType: "madrasah", subject: "Islamic Studies", topic: "Hadith", difficulty: "easy", language: "bn", question: "ইসলামের স্তম্ভ কয়টি?", options: ["৩টি", "৪টি", "৫টি", "৬টি"], correctAnswer: 2, explanation: "ইসলামের স্তম্ভ ৫টি: কালেমা, নামাজ, রোজা, হজ্জ ও যাকাত।" },
  { id: "mad-is-002", examType: "madrasah", subject: "Islamic Studies", topic: "Fiqh", difficulty: "medium", language: "bn", question: "দৈনিক ফরজ নামাজ কত ওয়াক্ত?", options: ["৩ ওয়াক্ত", "৪ ওয়াক্ত", "৫ ওয়াক্ত", "৬ ওয়াক্ত"], correctAnswer: 2, explanation: "দৈনিক ফরজ নামাজ ৫ ওয়াক্ত: ফজর, যোহর, আসর, মাগরিব ও ইশা।" },
  { id: "mad-is-003", examType: "madrasah", subject: "Islamic Studies", topic: "Aqeedah", difficulty: "easy", language: "bn", question: "ইসলামের শেষ নবী কে?", options: ["হযরত ইব্রাহীম (আ.)", "হযরত মূসা (আ.)", "হযরত ঈসা (আ.)", "হযরত মুহাম্মদ (সা.)"], correctAnswer: 3, explanation: "হযরত মুহাম্মদ (সা.) ইসলামের সর্বশেষ ও সর্বশ্রেষ্ঠ নবী।" },
  { id: "mad-is-004", examType: "madrasah", subject: "Islamic Studies", topic: "Hadith", difficulty: "hard", language: "bn", question: "সহীহ বুখারী হাদিস গ্রন্থে মোট কতটি হাদিস আছে?", options: ["৫,৭৫৮", "৭,২৭৫", "৯,০৮২", "১০,০০০"], correctAnswer: 1, explanation: "সহীহ বুখারী গ্রন্থে পুনরাবৃত্তিসহ মোট ৭,২৭৫টি হাদিস আছে।" },
  { id: "mad-is-005", examType: "madrasah", subject: "Islamic Studies", topic: "Fiqh", difficulty: "medium", language: "bn", question: "যাকাত ফরজ হওয়ার নিসাব কত?", options: ["সাড়ে ৫ তোলা স্বর্ণ", "সাড়ে ৭ তোলা স্বর্ণ", "সাড়ে ৯ তোলা স্বর্ণ", "১০ তোলা স্বর্ণ"], correctAnswer: 1, explanation: "সাড়ে ৭ তোলা (৮৭.৪৮ গ্রাম) স্বর্ণ বা সাড়ে ৫২ তোলা রৌপ্য নিসাব।" },

  // ===== Madrasah - Bangla =====
  { id: "mad-bn-001", examType: "madrasah", subject: "Bangla", topic: "Grammar", difficulty: "easy", language: "bn", question: "'ক্রিয়া' পদ কাকে বলে?", options: ["নাম বোঝায়", "গুণ বোঝায়", "কাজ বোঝায়", "সম্পর্ক বোঝায়"], correctAnswer: 2, explanation: "যে পদ দ্বারা কোনো কাজ করা, হওয়া বা থাকা বোঝায় তাকে ক্রিয়া পদ বলে।" },
  { id: "mad-bn-002", examType: "madrasah", subject: "Bangla", topic: "Literature", difficulty: "medium", language: "bn", question: "'অগ্নিবীণা' কাব্যগ্রন্থের রচয়িতা কে?", options: ["রবীন্দ্রনাথ ঠাকুর", "কাজী নজরুল ইসলাম", "জীবনানন্দ দাশ", "সুকান্ত ভট্টাচার্য"], correctAnswer: 1, explanation: "'অগ্নিবীণা' কাজী নজরুল ইসলামের প্রথম কাব্যগ্রন্থ।" },

  // ===== Madrasah - English =====
  { id: "mad-en-001", examType: "madrasah", subject: "English", topic: "Grammar", difficulty: "easy", language: "en", question: "What is the past tense of 'go'?", options: ["Goes", "Gone", "Went", "Going"], correctAnswer: 2, explanation: "The past tense of 'go' is 'went' (irregular verb)." },
  { id: "mad-en-002", examType: "madrasah", subject: "English", topic: "Vocabulary", difficulty: "easy", language: "en", question: "The meaning of 'Student' is:", options: ["Teacher", "Learner", "Worker", "Player"], correctAnswer: 1, explanation: "A student is a learner, someone who studies or attends school." },

  // ===== Madrasah - Mathematics =====
  { id: "mad-math-001", examType: "madrasah", subject: "Mathematics", topic: "Arithmetic", difficulty: "easy", language: "bn", question: "১/২ + ১/৪ = কত?", options: ["১/৬", "২/৬", "৩/৪", "৩/৬"], correctAnswer: 2, explanation: "১/২ + ১/৪ = ২/৪ + ১/৪ = ৩/৪।" },
  { id: "mad-math-002", examType: "madrasah", subject: "Mathematics", topic: "Algebra", difficulty: "medium", language: "en", question: "Solve: 3x = 15", options: ["x = 3", "x = 4", "x = 5", "x = 6"], correctAnswer: 2, explanation: "3x = 15; x = 15/3 = 5." },
  { id: "mad-math-003", examType: "madrasah", subject: "Mathematics", topic: "Geometry", difficulty: "easy", language: "bn", question: "চতুর্ভুজের চার কোণের সমষ্টি কত?", options: ["১৮০°", "২৭০°", "৩৬০°", "৪৫০°"], correctAnswer: 2, explanation: "চতুর্ভুজের চার কোণের সমষ্টি ৩৬০°।" },

  // ===== Madrasah - Science =====
  { id: "mad-sci-001", examType: "madrasah", subject: "Science", topic: "Biology", difficulty: "easy", language: "en", question: "Which part of the plant absorbs water?", options: ["Leaf", "Stem", "Root", "Flower"], correctAnswer: 2, explanation: "Roots absorb water and minerals from the soil." },
  { id: "mad-sci-002", examType: "madrasah", subject: "Science", topic: "Physics", difficulty: "medium", language: "bn", question: "চুম্বকের কটি মেরু আছে?", options: ["১টি", "২টি", "৩টি", "৪টি"], correctAnswer: 1, explanation: "চুম্বকের ২টি মেরু আছে: উত্তর মেরু ও দক্ষিণ মেরু।" },
  { id: "mad-sci-003", examType: "madrasah", subject: "Science", topic: "Chemistry", difficulty: "easy", language: "en", question: "Salt is a compound of:", options: ["Sodium and Chlorine", "Sodium and Oxygen", "Potassium and Chlorine", "Calcium and Carbon"], correctAnswer: 0, explanation: "Common salt (NaCl) is a compound of Sodium (Na) and Chlorine (Cl)." },

  // ===== Additional BCS - Computer & IT =====
  { id: "bcs-comp-003", examType: "bcs", subject: "Computer & IT", topic: "Programming", difficulty: "medium", language: "en", question: "Which data structure follows FIFO principle?", options: ["Stack", "Queue", "Array", "Tree"], correctAnswer: 1, explanation: "Queue follows FIFO (First In, First Out) principle." },
  { id: "bcs-comp-004", examType: "bcs", subject: "Computer & IT", topic: "Basics", difficulty: "easy", language: "bn", question: "কম্পিউটারের স্থায়ী মেমোরি কোনটি?", options: ["RAM", "ROM", "Cache", "Register"], correctAnswer: 1, explanation: "ROM (Read Only Memory) কম্পিউটারের স্থায়ী মেমোরি।" },
  { id: "bcs-comp-005", examType: "bcs", subject: "Computer & IT", topic: "Networking", difficulty: "hard", language: "en", question: "Which layer of the OSI model handles routing?", options: ["Data Link", "Network", "Transport", "Session"], correctAnswer: 1, explanation: "The Network layer (Layer 3) handles routing and forwarding of data packets." },

  // ===== Additional Mixed Questions for Balance =====
  { id: "bcs-en-012", examType: "bcs", subject: "English", topic: "Vocabulary", difficulty: "hard", language: "en", question: "The word 'Ephemeral' means:", options: ["Eternal", "Short-lived", "Beautiful", "Mysterious"], correctAnswer: 1, explanation: "'Ephemeral' means lasting for a very short time." },
  { id: "bcs-en-013", examType: "bcs", subject: "English", topic: "Grammar", difficulty: "easy", language: "en", question: "Which is a preposition?", options: ["Run", "Beautiful", "Under", "Quickly"], correctAnswer: 2, explanation: "'Under' is a preposition showing position or location." },

  { id: "med-bio-016", examType: "medical", subject: "Biology", topic: "Genetics", difficulty: "easy", language: "en", question: "What does DNA stand for?", options: ["Deoxyribose Nucleic Acid", "Deoxyribonucleic Acid", "Dinitrogen Acid", "Dynamic Nucleic Acid"], correctAnswer: 1, explanation: "DNA stands for Deoxyribonucleic Acid, the molecule carrying genetic instructions." },
  { id: "med-bio-017", examType: "medical", subject: "Biology", topic: "Human Physiology", difficulty: "hard", language: "en", question: "Which hormone regulates blood sugar levels?", options: ["Thyroxine", "Adrenaline", "Insulin", "Cortisol"], correctAnswer: 2, explanation: "Insulin, produced by the pancreas, regulates blood glucose levels." },
  { id: "med-bio-018", examType: "medical", subject: "Biology", topic: "Zoology", difficulty: "medium", language: "bn", question: "স্তন্যপায়ী প্রাণীর বৈশিষ্ট্য কী?", options: ["ডিম পাড়ে", "পালক আছে", "দুধ দিয়ে বাচ্চা পালন করে", "ঠান্ডা রক্তের"], correctAnswer: 2, explanation: "স্তন্যপায়ী প্রাণী দুধ দিয়ে বাচ্চা পালন করে এবং উষ্ণ রক্তবিশিষ্ট।" },

  { id: "med-chem-011", examType: "medical", subject: "Chemistry", topic: "Physical Chemistry", difficulty: "medium", language: "en", question: "What is the SI unit of amount of substance?", options: ["Gram", "Kilogram", "Mole", "Liter"], correctAnswer: 2, explanation: "The mole (mol) is the SI unit of amount of substance." },
  { id: "med-chem-012", examType: "medical", subject: "Chemistry", topic: "Organic Chemistry", difficulty: "hard", language: "en", question: "Which type of isomerism is shown by compounds with the same molecular formula but different structural arrangements?", options: ["Optical isomerism", "Structural isomerism", "Geometric isomerism", "Conformational isomerism"], correctAnswer: 1, explanation: "Structural isomerism occurs when compounds have the same molecular formula but different structural arrangements." },

  { id: "eng-math-013", examType: "engineering", subject: "Mathematics", topic: "Calculus", difficulty: "easy", language: "en", question: "What is the derivative of a constant?", options: ["1", "0", "The constant itself", "Infinity"], correctAnswer: 1, explanation: "The derivative of any constant is 0." },
  { id: "eng-math-014", examType: "engineering", subject: "Mathematics", topic: "Algebra", difficulty: "hard", language: "en", question: "What is the determinant of a 2x2 matrix [[a,b],[c,d]]?", options: ["ac - bd", "ad - bc", "ab - cd", "ad + bc"], correctAnswer: 1, explanation: "The determinant of a 2x2 matrix [[a,b],[c,d]] = ad - bc." },

  { id: "ssc-phy-011", examType: "ssc", subject: "Physics", topic: "Mechanics", difficulty: "medium", language: "bn", question: "নিউটনের দ্বিতীয় সূত্র কী?", options: ["F = ma", "F = mv", "F = m/a", "F = a/m"], correctAnswer: 0, explanation: "নিউটনের দ্বিতীয় সূত্র: F = ma, যেখানে F = বল, m = ভর, a = ত্বরণ।" },
  { id: "ssc-phy-012", examType: "ssc", subject: "Physics", topic: "Light", difficulty: "easy", language: "en", question: "What are the primary colors of light?", options: ["Red, Blue, Yellow", "Red, Green, Blue", "Red, Yellow, Green", "Blue, Yellow, White"], correctAnswer: 1, explanation: "The primary colors of light are Red, Green, and Blue (RGB)." },

  { id: "hsc-phy-012", examType: "hsc", subject: "Physics", topic: "Waves", difficulty: "easy", language: "bn", question: "শব্দ কোন ধরনের তরঙ্গ?", options: ["আড় তরঙ্গ", "অনুদৈর্ঘ্য তরঙ্গ", "তড়িৎচুম্বকীয় তরঙ্গ", "স্থির তরঙ্গ"], correctAnswer: 1, explanation: "শব্দ একটি অনুদৈর্ঘ্য (longitudinal) তরঙ্গ।" },
  { id: "hsc-phy-013", examType: "hsc", subject: "Physics", topic: "Optics", difficulty: "hard", language: "en", question: "What is the critical angle for total internal reflection dependent on?", options: ["Wavelength only", "Refractive indices of the media", "Temperature only", "Pressure only"], correctAnswer: 1, explanation: "The critical angle depends on the refractive indices of the two media (sin C = n2/n1)." },

  { id: "hsc-chem-010", examType: "hsc", subject: "Chemistry", topic: "Organic Chemistry", difficulty: "easy", language: "en", question: "What is the simplest alkane?", options: ["Ethane", "Propane", "Methane", "Butane"], correctAnswer: 2, explanation: "Methane (CH4) is the simplest alkane with just one carbon atom." },
  { id: "hsc-chem-011", examType: "hsc", subject: "Chemistry", topic: "Inorganic Chemistry", difficulty: "medium", language: "bn", question: "ক্ষারধাতু কোনগুলো?", options: ["Na, K, Li", "Fe, Cu, Zn", "Ca, Mg, Ba", "Al, Si, B"], correctAnswer: 0, explanation: "Na (সোডিয়াম), K (পটাশিয়াম), Li (লিথিয়াম) হলো ক্ষারধাতু (Group 1 elements)।" },

  { id: "uni-en-006", examType: "university", subject: "English", topic: "Grammar", difficulty: "hard", language: "en", question: "Which sentence demonstrates correct use of the semicolon?", options: ["I love reading; it expands my mind", "I love; reading it expands my mind", "I love reading it; expands my mind", "I; love reading it expands my mind"], correctAnswer: 0, explanation: "A semicolon connects two independent clauses that are closely related in meaning." },
  { id: "uni-gk-006", examType: "university", subject: "General Knowledge", topic: "Science & Tech", difficulty: "easy", language: "bn", question: "কম্পিউটার আবিষ্কার করেন কে?", options: ["চার্লস ব্যাবেজ", "বিল গেটস", "স্টিভ জবস", "মার্ক জাকারবার্গ"], correctAnswer: 0, explanation: "চার্লস ব্যাবেজকে কম্পিউটারের জনক বলা হয়।" },

  { id: "ssc-bio-010", examType: "ssc", subject: "Biology", topic: "Human Physiology", difficulty: "hard", language: "en", question: "Which part of the brain controls balance and coordination?", options: ["Cerebrum", "Cerebellum", "Medulla", "Hypothalamus"], correctAnswer: 1, explanation: "The cerebellum controls balance, coordination, and fine motor movements." },
  { id: "ssc-chem-010", examType: "ssc", subject: "Chemistry", topic: "Physical Chemistry", difficulty: "medium", language: "bn", question: "pH এর মান ৭ এর কম হলে দ্রবণটি কী?", options: ["ক্ষারীয়", "নিরপেক্ষ", "আম্লিক", "লবণাক্ত"], correctAnswer: 2, explanation: "pH < 7 হলে দ্রবণ আম্লিক, pH = 7 হলে নিরপেক্ষ, pH > 7 হলে ক্ষারীয়।" },

  { id: "jsc-math-005", examType: "jsc", subject: "Mathematics", topic: "Geometry", difficulty: "easy", language: "en", question: "What is the perimeter of a square with side 5 cm?", options: ["10 cm", "15 cm", "20 cm", "25 cm"], correctAnswer: 2, explanation: "Perimeter of a square = 4 x side = 4 x 5 = 20 cm." },
  { id: "jsc-en-005", examType: "jsc", subject: "English", topic: "Vocabulary", difficulty: "medium", language: "en", question: "The opposite of 'Generous' is:", options: ["Kind", "Brave", "Stingy", "Gentle"], correctAnswer: 2, explanation: "'Generous' means giving freely; 'Stingy' means unwilling to give or spend." },

  { id: "psc-en-005", examType: "psc", subject: "English", topic: "Grammar", difficulty: "easy", language: "en", question: "Which is a vowel?", options: ["B", "C", "E", "D"], correctAnswer: 2, explanation: "E is a vowel. The five vowels are A, E, I, O, U." },
  { id: "psc-math-007", examType: "psc", subject: "Mathematics", topic: "Arithmetic", difficulty: "easy", language: "en", question: "What is 50 - 23?", options: ["25", "26", "27", "28"], correctAnswer: 2, explanation: "50 - 23 = 27." },

  { id: "bcs-bn-011", examType: "bcs", subject: "Bangla", topic: "Grammar", difficulty: "hard", language: "bn", question: "'দ্বন্দ্ব সমাস' এর উদাহরণ কোনটি?", options: ["মহারাজ", "নীলপদ্ম", "দম্পতি", "চৌরাস্তা"], correctAnswer: 2, explanation: "'দম্পতি' (দম + পতি → পতি ও পত্নী) দ্বন্দ্ব সমাসের উদাহরণ।" },

  { id: "med-phy-011", examType: "medical", subject: "Physics", topic: "Optics", difficulty: "easy", language: "en", question: "A convex lens is also called:", options: ["Diverging lens", "Converging lens", "Plane lens", "Cylindrical lens"], correctAnswer: 1, explanation: "A convex lens converges light rays to a focal point, hence called a converging lens." },

  { id: "eng-phy-011", examType: "engineering", subject: "Physics", topic: "Electromagnetism", difficulty: "medium", language: "en", question: "What is Faraday's law about?", options: ["Electric current", "Electromagnetic induction", "Gravitational force", "Nuclear fission"], correctAnswer: 1, explanation: "Faraday's law describes electromagnetic induction - a changing magnetic field induces an EMF." },

  { id: "hsc-bio-011", examType: "hsc", subject: "Biology", topic: "Genetics", difficulty: "hard", language: "bn", question: "জিনোটাইপ ও ফিনোটাইপের মধ্যে পার্থক্য কী?", options: ["কোনো পার্থক্য নেই", "জিনোটাইপ হলো জিনগত গঠন, ফিনোটাইপ হলো বাহ্যিক বৈশিষ্ট্য", "ফিনোটাইপ হলো জিনগত গঠন", "জিনোটাইপ হলো বাহ্যিক বৈশিষ্ট্য"], correctAnswer: 1, explanation: "জিনোটাইপ হলো কোনো জীবের জিনগত গঠন এবং ফিনোটাইপ হলো তার বাহ্যিক প্রকাশিত বৈশিষ্ট্য।" },

  { id: "ssc-hm-005", examType: "ssc", subject: "Higher Mathematics", topic: "Set Theory", difficulty: "medium", language: "bn", question: "A = {1,2,3,4,5} এবং B = {3,4,5,6,7} হলে A ∪ B = কত?", options: ["{3,4,5}", "{1,2,3,4,5,6,7}", "{1,2,6,7}", "{1,2}"], correctAnswer: 1, explanation: "A ∪ B (ইউনিয়ন) = {1,2,3,4,5,6,7}, উভয় সেটের সকল উপাদান।" },

  { id: "ssc-bg-005", examType: "ssc", subject: "Bangladesh & Global Studies", topic: "Current Affairs", difficulty: "hard", language: "en", question: "Which international organization was Bangladesh the first to ratify its founding charter?", options: ["SAARC", "OIC", "D-8", "BIMSTEC"], correctAnswer: 0, explanation: "Bangladesh was one of the founding members and first to ratify the charter of SAARC in 1985." },

  { id: "hsc-eco-004", examType: "hsc", subject: "Economics", topic: "Economy", difficulty: "hard", language: "en", question: "What is 'inflation'?", options: ["Decrease in general price level", "Increase in general price level", "Constant price level", "Decrease in money supply"], correctAnswer: 1, explanation: "Inflation is a sustained increase in the general price level of goods and services over time." },

  { id: "jsc-sci-005", examType: "jsc", subject: "Science", topic: "Chemistry", difficulty: "easy", language: "bn", question: "লোহায় মরিচা পড়ার কারণ কী?", options: ["তাপ", "আলো", "অক্সিজেন ও পানি", "শব্দ"], correctAnswer: 2, explanation: "লোহায় মরিচা পড়ে অক্সিজেন ও পানির সংস্পর্শে আয়রন অক্সাইড তৈরি হওয়ার ফলে।" },

  { id: "psc-sci-005", examType: "psc", subject: "Science", topic: "Environment", difficulty: "easy", language: "bn", question: "গাছ আমাদের কী দেয়?", options: ["কার্বন ডাইঅক্সাইড", "অক্সিজেন", "নাইট্রোজেন", "হাইড্রোজেন"], correctAnswer: 1, explanation: "গাছ সালোকসংশ্লেষণ প্রক্রিয়ায় অক্সিজেন দেয় যা আমরা শ্বাস নিতে ব্যবহার করি।" },

  { id: "mad-is-006", examType: "madrasah", subject: "Islamic Studies", topic: "Aqeedah", difficulty: "easy", language: "bn", question: "ইমানের মোট কতটি শাখা আছে?", options: ["৫৭", "৬৩", "৭৭", "৯৯"], correctAnswer: 2, explanation: "ইমানের মোট ৭৭টি শাখা আছে (হাদিস অনুযায়ী)।" },

  { id: "bcs-gs-006", examType: "bcs", subject: "General Science", topic: "Chemistry", difficulty: "medium", language: "bn", question: "ভিটামিন সি এর রাসায়নিক নাম কী?", options: ["থায়ামিন", "রিবোফ্লাভিন", "অ্যাসকরবিক অ্যাসিড", "নিকোটিনিক অ্যাসিড"], correctAnswer: 2, explanation: "ভিটামিন সি এর রাসায়নিক নাম অ্যাসকরবিক অ্যাসিড।" },
  { id: "bcs-gs-007", examType: "bcs", subject: "General Science", topic: "Physics", difficulty: "easy", language: "en", question: "What is the unit of electric current?", options: ["Volt", "Watt", "Ampere", "Ohm"], correctAnswer: 2, explanation: "The SI unit of electric current is Ampere (A)." },

  { id: "med-phy-012", examType: "medical", subject: "Physics", topic: "Thermodynamics", difficulty: "medium", language: "bn", question: "তাপের একক কী?", options: ["নিউটন", "জুল", "ওয়াট", "পাস্কাল"], correctAnswer: 1, explanation: "তাপের SI একক জুল (Joule)।" },

  { id: "eng-chem-009", examType: "engineering", subject: "Chemistry", topic: "Physical Chemistry", difficulty: "hard", language: "en", question: "What is the first law of thermodynamics?", options: ["Energy cannot be created or destroyed", "Entropy always increases", "Every action has reaction", "PV = nRT"], correctAnswer: 0, explanation: "The first law of thermodynamics states that energy cannot be created or destroyed, only transformed." },

  { id: "ssc-en-011", examType: "ssc", subject: "English", topic: "Grammar", difficulty: "medium", language: "en", question: "'She sings beautifully.' Here 'beautifully' is:", options: ["Adjective", "Adverb", "Noun", "Verb"], correctAnswer: 1, explanation: "'Beautifully' is an adverb modifying the verb 'sings'." },

  { id: "hsc-bn-006", examType: "hsc", subject: "Bangla", topic: "Grammar", difficulty: "medium", language: "bn", question: "'তদ্ধিত প্রত্যয়' কাকে বলে?", options: ["ধাতুর সাথে যুক্ত প্রত্যয়", "শব্দের সাথে যুক্ত প্রত্যয়", "উপসর্গের সাথে যুক্ত প্রত্যয়", "অনুসর্গের সাথে যুক্ত প্রত্যয়"], correctAnswer: 1, explanation: "শব্দের (নাম প্রকৃতি) সাথে যে প্রত্যয় যুক্ত হয় তাকে তদ্ধিত প্রত্যয় বলে।" },

  { id: "jsc-bg-004", examType: "jsc", subject: "Bangladesh & Global Studies", topic: "Geography", difficulty: "medium", language: "en", question: "What is the climate of Bangladesh?", options: ["Tropical desert", "Tropical monsoon", "Mediterranean", "Polar"], correctAnswer: 1, explanation: "Bangladesh has a tropical monsoon climate with heavy rainfall during the monsoon season." },

  { id: "psc-bg-005", examType: "psc", subject: "Bangladesh & Global Studies", topic: "History", difficulty: "medium", language: "bn", question: "বাংলাদেশের জাতীয় দিবস কবে?", options: ["২১ ফেব্রুয়ারি", "২৬ মার্চ", "১৬ ডিসেম্বর", "১৫ আগস্ট"], correctAnswer: 1, explanation: "২৬ মার্চ বাংলাদেশের স্বাধীনতা ও জাতীয় দিবস।" },

  { id: "mad-ar-004", examType: "madrasah", subject: "Arabic", topic: "Nahw & Sarf", difficulty: "easy", language: "bn", question: "আরবি ভাষায় 'ফিল' (فعل) অর্থ কী?", options: ["নাম", "ক্রিয়া", "অব্যয়", "বিশেষণ"], correctAnswer: 1, explanation: "'ফিল' (فعل) আরবি ব্যাকরণে ক্রিয়াপদকে বোঝায়।" },
  { id: "mad-qr-004", examType: "madrasah", subject: "Quran Studies", topic: "General", difficulty: "medium", language: "bn", question: "কুরআনের সবচেয়ে ছোট সূরা কোনটি?", options: ["সূরা ইখলাস", "সূরা কাওসার", "সূরা নাস", "সূরা ফালাক"], correctAnswer: 1, explanation: "সূরা কাওসার কুরআনের সবচেয়ে ছোট সূরা, এতে মাত্র ৩টি আয়াত আছে।" },

  { id: "ssc-math-012", examType: "ssc", subject: "Mathematics", topic: "Geometry", difficulty: "hard", language: "en", question: "What is the area of an equilateral triangle with side a?", options: ["a^2/2", "(sqrt(3)/4)a^2", "a^2", "2a^2"], correctAnswer: 1, explanation: "Area of equilateral triangle = (sqrt(3)/4) x a^2." },

  { id: "hsc-hm-006", examType: "hsc", subject: "Higher Mathematics", topic: "Calculus", difficulty: "hard", language: "en", question: "What is the integral of e^x?", options: ["e^x + C", "xe^x + C", "e^(x+1) + C", "ln(x) + C"], correctAnswer: 0, explanation: "The integral of e^x is e^x + C, as the derivative of e^x is itself." },

  { id: "uni-math-005", examType: "university", subject: "Mathematics", topic: "Geometry", difficulty: "hard", language: "en", question: "What is the volume of a sphere with radius r?", options: ["(4/3)πr^2", "(4/3)πr^3", "4πr^2", "2πr^3"], correctAnswer: 1, explanation: "Volume of a sphere = (4/3)πr^3." },

  { id: "bcs-math-006", examType: "bcs", subject: "Mathematics", topic: "Geometry", difficulty: "medium", language: "bn", question: "একটি সমকোণী ত্রিভুজের দুটি বাহু ৩ ও ৪ হলে অতিভুজ কত?", options: ["৫", "৬", "৭", "৮"], correctAnswer: 0, explanation: "পিথাগোরাসের সূত্র: c^2 = a^2 + b^2 = 9 + 16 = 25, c = 5।" },

  { id: "med-bio-019", examType: "medical", subject: "Biology", topic: "Cell Biology", difficulty: "hard", language: "en", question: "What is the function of the Golgi apparatus?", options: ["Protein synthesis", "Energy production", "Modifying and packaging proteins", "DNA replication"], correctAnswer: 2, explanation: "The Golgi apparatus modifies, packages, and distributes proteins and lipids for secretion or internal use." },

  { id: "eng-phy-012", examType: "engineering", subject: "Physics", topic: "Modern Physics", difficulty: "medium", language: "en", question: "What is the photoelectric effect?", options: ["Emission of light by metals", "Emission of electrons when light hits a surface", "Reflection of photons", "Absorption of electrons"], correctAnswer: 1, explanation: "The photoelectric effect is the emission of electrons from a material when light of sufficient frequency hits it." },

  { id: "hsc-acc-004", examType: "hsc", subject: "Accounting", topic: "General", difficulty: "hard", language: "en", question: "What is the double-entry system?", options: ["Recording every transaction once", "Recording every transaction in two accounts", "Recording only expenses", "Recording only income"], correctAnswer: 1, explanation: "Double-entry bookkeeping records every transaction in at least two accounts: a debit and a credit." },

  // ===== Additional PSC Questions =====
  { id: "psc-bn-010", examType: "psc", subject: "Bangla", topic: "Grammar", difficulty: "easy", language: "bn", question: "'মাছ' শব্দের বহুবচন কোনটি?", options: ["মাছসমূহ", "মাছগুলো", "মাছেরা", "সব ঠিক"], correctAnswer: 3, explanation: "মাছ শব্দের বহুবচনে মাছসমূহ, মাছগুলো, মাছেরা সবই ব্যবহৃত হতে পারে।" },
  { id: "psc-bn-011", examType: "psc", subject: "Bangla", topic: "Grammar", difficulty: "easy", language: "bn", question: "'সূর্য' শব্দের সমার্থক শব্দ কোনটি?", options: ["চাঁদ", "রবি", "তারা", "আকাশ"], correctAnswer: 1, explanation: "'রবি' সূর্যের সমার্থক শব্দ। এছাড়াও সবিতা, ভানু, দিবাকর ইত্যাদি।" },
  { id: "psc-en-010", examType: "psc", subject: "English", topic: "Grammar", difficulty: "easy", language: "en", question: "Choose the correct plural: 'child'", options: ["childs", "childrens", "children", "childes"], correctAnswer: 2, explanation: "The plural of 'child' is 'children'. It is an irregular plural noun." },
  { id: "psc-en-011", examType: "psc", subject: "English", topic: "Vocabulary", difficulty: "easy", language: "en", question: "What is the opposite of 'big'?", options: ["tall", "small", "long", "wide"], correctAnswer: 1, explanation: "'Small' is the opposite of 'big'." },
  { id: "psc-math-010", examType: "psc", subject: "Mathematics", topic: "Arithmetic", difficulty: "easy", language: "en", question: "What is 15 + 27?", options: ["32", "42", "52", "41"], correctAnswer: 1, explanation: "15 + 27 = 42" },
  { id: "psc-math-011", examType: "psc", subject: "Mathematics", topic: "Geometry", difficulty: "easy", language: "en", question: "How many sides does a triangle have?", options: ["2", "3", "4", "5"], correctAnswer: 1, explanation: "A triangle has 3 sides. 'Tri' means three." },
  { id: "psc-math-012", examType: "psc", subject: "Mathematics", topic: "Arithmetic", difficulty: "medium", language: "en", question: "What is 144 divided by 12?", options: ["10", "11", "12", "14"], correctAnswer: 2, explanation: "144 / 12 = 12." },
  { id: "psc-sci-010", examType: "psc", subject: "Science", topic: "Environment", difficulty: "easy", language: "bn", question: "গাছ আমাদের কী দেয়?", options: ["কার্বন ডাই-অক্সাইড", "অক্সিজেন", "নাইট্রোজেন", "হাইড্রোজেন"], correctAnswer: 1, explanation: "গাছ সালোকসংশ্লেষণের মাধ্যমে অক্সিজেন তৈরি করে যা আমরা শ্বাস নিতে ব্যবহার করি।" },
  { id: "psc-sci-011", examType: "psc", subject: "Science", topic: "General", difficulty: "easy", language: "en", question: "Which planet is closest to the Sun?", options: ["Venus", "Earth", "Mercury", "Mars"], correctAnswer: 2, explanation: "Mercury is the closest planet to the Sun in our solar system." },
  { id: "psc-bd-010", examType: "psc", subject: "Bangladesh & Global Studies", topic: "Bangladesh", difficulty: "easy", language: "bn", question: "বাংলাদেশের রাজধানী কোথায়?", options: ["চট্টগ্রাম", "খুলনা", "ঢাকা", "রাজশাহী"], correctAnswer: 2, explanation: "বাংলাদেশের রাজধানী ঢাকা।" },
  { id: "psc-bd-011", examType: "psc", subject: "Bangladesh & Global Studies", topic: "Bangladesh", difficulty: "easy", language: "en", question: "What is the national flower of Bangladesh?", options: ["Rose", "Sunflower", "Water Lily", "Lotus"], correctAnswer: 2, explanation: "The Water Lily (Shapla) is the national flower of Bangladesh." },

  // ===== Additional JSC Questions =====
  { id: "jsc-bn-010", examType: "jsc", subject: "Bangla", topic: "Grammar", difficulty: "medium", language: "bn", question: "'কারক' কত প্রকার?", options: ["৪", "৫", "৬", "৭"], correctAnswer: 2, explanation: "কারক ৬ প্রকার: কর্তৃকারক, কর্মকারক, করণকারক, সম্প্রদান কারক, অপাদান কারক, অধিকরণ কারক।" },
  { id: "jsc-bn-011", examType: "jsc", subject: "Bangla", topic: "Literature", difficulty: "medium", language: "bn", question: "'কবর' কবিতার রচয়িতা কে?", options: ["রবীন্দ্রনাথ ঠাকুর", "জসীমউদ্দীন", "কাজী নজরুল ইসলাম", "জীবনানন্দ দাশ"], correctAnswer: 1, explanation: "'কবর' কবিতার রচয়িতা পল্লীকবি জসীমউদ্দীন।" },
  { id: "jsc-en-010", examType: "jsc", subject: "English", topic: "Grammar", difficulty: "medium", language: "en", question: "Which is the correct sentence?", options: ["He go to school", "He goes to school", "He going to school", "He gone to school"], correctAnswer: 1, explanation: "'He goes to school' is correct. With third person singular (he/she/it), the verb takes 's' in simple present." },
  { id: "jsc-en-011", examType: "jsc", subject: "English", topic: "Vocabulary", difficulty: "easy", language: "en", question: "What does 'enormous' mean?", options: ["Tiny", "Very large", "Fast", "Slow"], correctAnswer: 1, explanation: "'Enormous' means extremely large in size, quantity, or extent." },
  { id: "jsc-math-010", examType: "jsc", subject: "Mathematics", topic: "Algebra", difficulty: "medium", language: "en", question: "Solve: 3x + 5 = 20", options: ["x = 3", "x = 4", "x = 5", "x = 6"], correctAnswer: 2, explanation: "3x + 5 = 20 → 3x = 15 → x = 5" },
  { id: "jsc-math-011", examType: "jsc", subject: "Mathematics", topic: "Geometry", difficulty: "medium", language: "en", question: "The sum of angles in a triangle is:", options: ["90°", "180°", "270°", "360°"], correctAnswer: 1, explanation: "The sum of all angles in any triangle is always 180 degrees." },
  { id: "jsc-sci-010", examType: "jsc", subject: "Science", topic: "Physics", difficulty: "medium", language: "en", question: "What is the SI unit of force?", options: ["Joule", "Newton", "Pascal", "Watt"], correctAnswer: 1, explanation: "The SI unit of force is Newton (N), named after Sir Isaac Newton." },
  { id: "jsc-sci-011", examType: "jsc", subject: "Science", topic: "Chemistry", difficulty: "medium", language: "en", question: "What is the chemical symbol for water?", options: ["CO2", "H2O", "NaCl", "O2"], correctAnswer: 1, explanation: "Water has the chemical formula H2O - two hydrogen atoms and one oxygen atom." },
  { id: "jsc-bd-010", examType: "jsc", subject: "Bangladesh & Global Studies", topic: "History", difficulty: "medium", language: "bn", question: "বাংলাদেশের জাতীয় সংগীতের রচয়িতা কে?", options: ["কাজী নজরুল ইসলাম", "রবীন্দ্রনাথ ঠাকুর", "জসীমউদ্দীন", "শামসুর রাহমান"], correctAnswer: 1, explanation: "'আমার সোনার বাংলা' বাংলাদেশের জাতীয় সংগীত, রবীন্দ্রনাথ ঠাকুর রচিত।" },
  { id: "jsc-ict-010", examType: "jsc", subject: "ICT", topic: "Basics", difficulty: "easy", language: "en", question: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Control Process Unit"], correctAnswer: 0, explanation: "CPU stands for Central Processing Unit, the main processor of a computer." },

  // ===== Additional SSC Questions =====
  { id: "ssc-bn-010", examType: "ssc", subject: "Bangla", topic: "Grammar", difficulty: "medium", language: "bn", question: "'সমাস' শব্দের অর্থ কী?", options: ["সংযোগ", "সংক্ষেপ", "বিভক্তি", "বিস্তার"], correctAnswer: 1, explanation: "'সমাস' শব্দের অর্থ সংক্ষেপ। একাধিক পদের একপদীকরণকে সমাস বলে।" },
  { id: "ssc-bn-011", examType: "ssc", subject: "Bangla", topic: "Grammar", difficulty: "hard", language: "bn", question: "'তৎপুরুষ সমাস' কোন উদাহরণে আছে?", options: ["রাজপুত্র", "মহারাজ", "চন্দ্রমুখী", "নীলপদ্ম"], correctAnswer: 0, explanation: "'রাজপুত্র' = রাজার পুত্র, এটি তৎপুরুষ সমাসের উদাহরণ (সম্বন্ধ তৎপুরুষ)।" },
  { id: "ssc-en-010", examType: "ssc", subject: "English", topic: "Grammar", difficulty: "medium", language: "en", question: "Identify the passive voice: 'The book was written by him.'", options: ["Active", "Passive", "Imperative", "Interrogative"], correctAnswer: 1, explanation: "'The book was written by him' is passive voice. The object (book) is the subject." },
  { id: "ssc-en-011", examType: "ssc", subject: "English", topic: "Vocabulary", difficulty: "medium", language: "en", question: "Choose the synonym of 'diligent':", options: ["Lazy", "Careless", "Hardworking", "Slow"], correctAnswer: 2, explanation: "'Diligent' means showing careful and persistent effort, synonymous with 'hardworking'." },
  { id: "ssc-math-010", examType: "ssc", subject: "Mathematics", topic: "Algebra", difficulty: "medium", language: "en", question: "If f(x) = 2x² + 3x - 5, find f(2):", options: ["7", "9", "11", "13"], correctAnswer: 1, explanation: "f(2) = 2(4) + 3(2) - 5 = 8 + 6 - 5 = 9" },
  { id: "ssc-math-011", examType: "ssc", subject: "Mathematics", topic: "Trigonometry", difficulty: "medium", language: "en", question: "What is sin(30°)?", options: ["1/√2", "1/2", "√3/2", "1"], correctAnswer: 1, explanation: "sin(30°) = 1/2. This is a standard trigonometric value." },
  { id: "ssc-math-012", examType: "ssc", subject: "Mathematics", topic: "Statistics", difficulty: "easy", language: "en", question: "The mean of 2, 4, 6, 8, 10 is:", options: ["4", "5", "6", "7"], correctAnswer: 2, explanation: "Mean = (2+4+6+8+10)/5 = 30/5 = 6" },
  { id: "ssc-phy-010", examType: "ssc", subject: "Physics", topic: "Electricity", difficulty: "medium", language: "en", question: "What is Ohm's Law?", options: ["V = IR", "V = I/R", "V = R/I", "I = VR"], correctAnswer: 0, explanation: "Ohm's Law states V = IR, where V is voltage, I is current, and R is resistance." },
  { id: "ssc-chem-010", examType: "ssc", subject: "Chemistry", topic: "Physical Chemistry", difficulty: "medium", language: "en", question: "What is the pH of pure water?", options: ["0", "5", "7", "14"], correctAnswer: 2, explanation: "Pure water has a pH of 7, which is neutral - neither acidic nor basic." },
  { id: "ssc-bio-010", examType: "ssc", subject: "Biology", topic: "Cell Biology", difficulty: "easy", language: "en", question: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], correctAnswer: 2, explanation: "Mitochondria is called the powerhouse of the cell as it produces ATP energy." },
  { id: "ssc-bio-011", examType: "ssc", subject: "Biology", topic: "Human Physiology", difficulty: "medium", language: "en", question: "How many chambers does the human heart have?", options: ["2", "3", "4", "5"], correctAnswer: 2, explanation: "The human heart has 4 chambers: 2 atria and 2 ventricles." },
  { id: "ssc-hm-010", examType: "ssc", subject: "Higher Mathematics", topic: "Set Theory", difficulty: "medium", language: "en", question: "If A = {1,2,3} and B = {2,3,4}, what is A ∩ B?", options: ["{1,2,3,4}", "{2,3}", "{1,4}", "{}"], correctAnswer: 1, explanation: "A ∩ B (intersection) = elements common to both sets = {2,3}" },
  { id: "ssc-bd-010", examType: "ssc", subject: "Bangladesh & Global Studies", topic: "History", difficulty: "medium", language: "bn", question: "ভাষা আন্দোলন কত সালে হয়েছিল?", options: ["১৯৪৭", "১৯৫২", "১৯৬৬", "১৯৭১"], correctAnswer: 1, explanation: "ভাষা আন্দোলন ১৯৫২ সালের ২১ ফেব্রুয়ারি হয়েছিল।" },
  { id: "ssc-ict-010", examType: "ssc", subject: "ICT", topic: "Programming", difficulty: "medium", language: "en", question: "Which is NOT a programming language?", options: ["Python", "Java", "HTML", "C++"], correctAnswer: 2, explanation: "HTML is a markup language, not a programming language. It structures web content." },

  // ===== Additional HSC Questions =====
  { id: "hsc-phy-010", examType: "hsc", subject: "Physics", topic: "Waves", difficulty: "medium", language: "en", question: "What type of wave is sound?", options: ["Transverse", "Longitudinal", "Electromagnetic", "Surface"], correctAnswer: 1, explanation: "Sound is a longitudinal wave where particles vibrate parallel to the direction of propagation." },
  { id: "hsc-phy-011", examType: "hsc", subject: "Physics", topic: "Modern Physics", difficulty: "hard", language: "en", question: "What is the speed of light in vacuum?", options: ["3 × 10⁶ m/s", "3 × 10⁸ m/s", "3 × 10¹⁰ m/s", "3 × 10¹² m/s"], correctAnswer: 1, explanation: "The speed of light in vacuum is approximately 3 × 10⁸ m/s (299,792,458 m/s)." },
  { id: "hsc-chem-010", examType: "hsc", subject: "Chemistry", topic: "Organic Chemistry", difficulty: "medium", language: "en", question: "What is the functional group of alcohols?", options: ["-CHO", "-COOH", "-OH", "-NH2"], correctAnswer: 2, explanation: "Alcohols contain the hydroxyl group (-OH) bonded to a carbon atom." },
  { id: "hsc-chem-011", examType: "hsc", subject: "Chemistry", topic: "Inorganic Chemistry", difficulty: "hard", language: "en", question: "Which element has the highest electronegativity?", options: ["Oxygen", "Nitrogen", "Fluorine", "Chlorine"], correctAnswer: 2, explanation: "Fluorine has the highest electronegativity (3.98) on the Pauling scale." },
  { id: "hsc-bio-010", examType: "hsc", subject: "Biology", topic: "Genetics", difficulty: "medium", language: "en", question: "What carries genetic information?", options: ["RNA only", "DNA", "Protein", "Lipids"], correctAnswer: 1, explanation: "DNA (Deoxyribonucleic Acid) carries the genetic information in most organisms." },
  { id: "hsc-bio-011", examType: "hsc", subject: "Biology", topic: "Ecology", difficulty: "medium", language: "bn", question: "খাদ্য শৃঙ্খলে প্রথম স্তরে কারা থাকে?", options: ["মাংসাশী", "তৃণভোজী", "উৎপাদক", "বিয়োজক"], correctAnswer: 2, explanation: "খাদ্য শৃঙ্খলের প্রথম স্তরে উৎপাদক (সবুজ উদ্ভিদ) থাকে যারা সূর্যালোক ব্যবহার করে খাদ্য তৈরি করে।" },
  { id: "hsc-hm-010", examType: "hsc", subject: "Higher Mathematics", topic: "Calculus", difficulty: "hard", language: "en", question: "What is the derivative of sin(x)?", options: ["-sin(x)", "cos(x)", "-cos(x)", "tan(x)"], correctAnswer: 1, explanation: "The derivative of sin(x) with respect to x is cos(x)." },
  { id: "hsc-hm-011", examType: "hsc", subject: "Higher Mathematics", topic: "Calculus", difficulty: "hard", language: "en", question: "What is ∫ 2x dx?", options: ["x", "x²", "x² + C", "2x² + C"], correctAnswer: 2, explanation: "∫ 2x dx = x² + C, where C is the constant of integration." },
  { id: "hsc-eco-010", examType: "hsc", subject: "Economics", topic: "Basics", difficulty: "medium", language: "en", question: "What is GDP?", options: ["Gross Domestic Product", "General Development Program", "Government Direct Payment", "Global Distribution Protocol"], correctAnswer: 0, explanation: "GDP stands for Gross Domestic Product - the total value of goods and services produced in a country." },
  { id: "hsc-bn-010", examType: "hsc", subject: "Bangla", topic: "Literature", difficulty: "medium", language: "bn", question: "'বিদ্রোহী' কবিতার রচয়িতা কে?", options: ["রবীন্দ্রনাথ ঠাকুর", "কাজী নজরুল ইসলাম", "জীবনানন্দ দাশ", "সুকান্ত ভট্টাচার্য"], correctAnswer: 1, explanation: "'বিদ্রোহী' বাংলা সাহিত্যের অন্যতম বিখ্যাত কবিতা, কাজী নজরুল ইসলাম রচিত।" },
  { id: "hsc-ict-010", examType: "hsc", subject: "ICT", topic: "Networking", difficulty: "medium", language: "en", question: "What does IP stand for?", options: ["Internet Protocol", "Internal Program", "Integrated Processing", "Internet Program"], correctAnswer: 0, explanation: "IP stands for Internet Protocol, the principal communications protocol for relaying data across networks." },
  { id: "hsc-en-010", examType: "hsc", subject: "English", topic: "Grammar", difficulty: "medium", language: "en", question: "Which is a complex sentence?", options: ["He ran fast.", "He ran fast and won.", "Because he ran fast, he won.", "Run fast!"], correctAnswer: 2, explanation: "A complex sentence has an independent clause and at least one dependent clause. 'Because' introduces the dependent clause." },

  // ===== Additional University Admission Questions =====
  { id: "uni-en-010", examType: "university", subject: "English", topic: "Vocabulary", difficulty: "hard", language: "en", question: "Choose the meaning of 'ubiquitous':", options: ["Rare", "Present everywhere", "Invisible", "Ancient"], correctAnswer: 1, explanation: "'Ubiquitous' means present, appearing, or found everywhere." },
  { id: "uni-en-011", examType: "university", subject: "English", topic: "Grammar", difficulty: "hard", language: "en", question: "Which sentence uses the subjunctive mood correctly?", options: ["If I was rich", "If I were rich", "If I am rich", "If I be rich"], correctAnswer: 1, explanation: "'If I were rich' uses the subjunctive mood correctly for hypothetical conditions." },
  { id: "uni-bn-010", examType: "university", subject: "Bangla", topic: "Literature", difficulty: "hard", language: "bn", question: "'পথের পাঁচালী' উপন্যাসের লেখক কে?", options: ["শরৎচন্দ্র চট্টোপাধ্যায়", "বিভূতিভূষণ বন্দ্যোপাধ্যায়", "বঙ্কিমচন্দ্র চট্টোপাধ্যায়", "মানিক বন্দ্যোপাধ্যায়"], correctAnswer: 1, explanation: "'পথের পাঁচালী' বিভূতিভূষণ বন্দ্যোপাধ্যায় রচিত বিখ্যাত উপন্যাস।" },
  { id: "uni-gk-010", examType: "university", subject: "General Knowledge", topic: "Bangladesh", difficulty: "medium", language: "bn", question: "বাংলাদেশের সর্বোচ্চ পর্বতশৃঙ্গ কোনটি?", options: ["কেওক্রাডং", "তাজিংডং", "মোদকমুয়াল", "সাকা হাফং"], correctAnswer: 3, explanation: "সাকা হাফং বাংলাদেশের সর্বোচ্চ পর্বতশৃঙ্গ, উচ্চতা ১,০৫২ মিটার।" },
  { id: "uni-gk-011", examType: "university", subject: "General Knowledge", topic: "International", difficulty: "medium", language: "en", question: "Which is the smallest continent?", options: ["Europe", "Antarctica", "Australia", "South America"], correctAnswer: 2, explanation: "Australia/Oceania is the smallest continent by land area." },
  { id: "uni-math-010", examType: "university", subject: "Mathematics", topic: "Algebra", difficulty: "hard", language: "en", question: "What are the roots of x² - 5x + 6 = 0?", options: ["1, 6", "2, 3", "-2, -3", "1, 5"], correctAnswer: 1, explanation: "x² - 5x + 6 = (x-2)(x-3) = 0, so x = 2 or x = 3." },

  // ===== Additional Medical Questions =====
  { id: "med-bio-015", examType: "medical", subject: "Biology", topic: "Human Physiology", difficulty: "hard", language: "en", question: "Which hormone regulates blood sugar?", options: ["Adrenaline", "Thyroxine", "Insulin", "Cortisol"], correctAnswer: 2, explanation: "Insulin, produced by the pancreas, regulates blood sugar by allowing cells to absorb glucose." },
  { id: "med-bio-016", examType: "medical", subject: "Biology", topic: "Genetics", difficulty: "hard", language: "en", question: "How many chromosomes do human cells have?", options: ["23", "44", "46", "48"], correctAnswer: 2, explanation: "Human cells have 46 chromosomes (23 pairs) - 22 pairs of autosomes and 1 pair of sex chromosomes." },
  { id: "med-bio-017", examType: "medical", subject: "Biology", topic: "Cell Biology", difficulty: "medium", language: "bn", question: "DNA এর পূর্ণরূপ কী?", options: ["ডি-অক্সিরাইবো নিউক্লিক এসিড", "ডাই-নাইট্রো এসিড", "ডি-অক্সি নাইট্রিক এসিড", "ডাই-নিউক্লিয়ার এসিড"], correctAnswer: 0, explanation: "DNA = Deoxyribonucleic Acid (ডি-অক্সিরাইবো নিউক্লিক এসিড)।" },
  { id: "med-chem-010", examType: "medical", subject: "Chemistry", topic: "Organic Chemistry", difficulty: "hard", language: "en", question: "Which is an amino acid?", options: ["Glucose", "Glycine", "Glycerol", "Galactose"], correctAnswer: 1, explanation: "Glycine is the simplest amino acid with the formula H2N-CH2-COOH." },
  { id: "med-phy-010", examType: "medical", subject: "Physics", topic: "Optics", difficulty: "medium", language: "en", question: "What type of lens is used for myopia correction?", options: ["Convex", "Concave", "Plano-convex", "Bifocal"], correctAnswer: 1, explanation: "Concave (diverging) lenses are used to correct myopia (nearsightedness) by spreading out light rays." },

  // ===== Additional Engineering Questions =====
  { id: "eng-math-015", examType: "engineering", subject: "Mathematics", topic: "Trigonometry", difficulty: "hard", language: "en", question: "What is cos(60°)?", options: ["0", "1/2", "√3/2", "1"], correctAnswer: 1, explanation: "cos(60°) = 1/2. This is a standard trigonometric value." },
  { id: "eng-math-016", examType: "engineering", subject: "Mathematics", topic: "Coordinate Geometry", difficulty: "hard", language: "en", question: "What is the distance between points (0,0) and (3,4)?", options: ["3", "4", "5", "7"], correctAnswer: 2, explanation: "Distance = √(3² + 4²) = √(9+16) = √25 = 5" },
  { id: "eng-phy-015", examType: "engineering", subject: "Physics", topic: "Electromagnetism", difficulty: "hard", language: "en", question: "What is Faraday's law about?", options: ["Gravitational force", "Electromagnetic induction", "Gas pressure", "Fluid dynamics"], correctAnswer: 1, explanation: "Faraday's law describes how a changing magnetic field induces an electromotive force (EMF)." },
  { id: "eng-chem-010", examType: "engineering", subject: "Chemistry", topic: "Physical Chemistry", difficulty: "hard", language: "en", question: "What is the ideal gas equation?", options: ["PV = nRT", "PV = mRT", "P = nVT", "V = nRP"], correctAnswer: 0, explanation: "The ideal gas equation is PV = nRT where P=pressure, V=volume, n=moles, R=gas constant, T=temperature." },

  // ===== Additional BCS Questions =====
  { id: "bcs-en-010", examType: "bcs", subject: "English", topic: "Vocabulary", difficulty: "hard", language: "en", question: "Choose the correct spelling:", options: ["Accomodation", "Accommodation", "Acomodation", "Acommodation"], correctAnswer: 1, explanation: "'Accommodation' is the correct spelling with double 'c' and double 'm'." },
  { id: "bcs-en-011", examType: "bcs", subject: "English", topic: "Grammar", difficulty: "medium", language: "en", question: "Which is the correct use of article? '___ honest man is respected.'", options: ["A", "An", "The", "No article"], correctAnswer: 1, explanation: "'An' is used before words with a vowel sound. 'Honest' starts with a vowel sound as 'h' is silent." },
  { id: "bcs-math-010", examType: "bcs", subject: "Mathematics", topic: "Arithmetic", difficulty: "medium", language: "en", question: "A man bought an item for 500 Tk and sold it for 600 Tk. What is the profit percentage?", options: ["10%", "15%", "20%", "25%"], correctAnswer: 2, explanation: "Profit = 600-500 = 100 Tk. Profit% = (100/500) × 100 = 20%" },
  { id: "bcs-math-011", examType: "bcs", subject: "Mathematics", topic: "Algebra", difficulty: "medium", language: "en", question: "If x + y = 10 and xy = 21, find x² + y²:", options: ["52", "58", "62", "68"], correctAnswer: 1, explanation: "(x+y)² = x² + 2xy + y², so x² + y² = (x+y)² - 2xy = 100 - 42 = 58" },
  { id: "bcs-gs-010", examType: "bcs", subject: "General Science", topic: "Biology", difficulty: "medium", language: "en", question: "Which vitamin is produced by sunlight?", options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"], correctAnswer: 3, explanation: "Vitamin D is synthesized in the skin when exposed to sunlight (UV-B radiation)." },
  { id: "bcs-gs-011", examType: "bcs", subject: "General Science", topic: "Physics", difficulty: "easy", language: "bn", question: "পৃথিবীর মাধ্যাকর্ষণ বলের কারণে কী ঘটে?", options: ["বস্তু উপরে ওঠে", "বস্তু নিচে পড়ে", "বস্তু স্থির থাকে", "বস্তু ঘোরে"], correctAnswer: 1, explanation: "মাধ্যাকর্ষণ বলের কারণে বস্তু পৃথিবীর কেন্দ্রের দিকে আকৃষ্ট হয়, অর্থাৎ নিচে পড়ে।" },
  { id: "bcs-comp-010", examType: "bcs", subject: "Computer & IT", topic: "Basics", difficulty: "easy", language: "en", question: "What does RAM stand for?", options: ["Read Access Memory", "Random Access Memory", "Read And Modify", "Rapid Access Module"], correctAnswer: 1, explanation: "RAM stands for Random Access Memory, which is the computer's short-term memory." },
  { id: "bcs-comp-011", examType: "bcs", subject: "Computer & IT", topic: "Networking", difficulty: "medium", language: "en", question: "What does HTTP stand for?", options: ["HyperText Transfer Protocol", "High Text Transfer Protocol", "HyperText Transmission Process", "Home Text Transfer Protocol"], correctAnswer: 0, explanation: "HTTP stands for HyperText Transfer Protocol, the foundation of data communication on the web." },
  { id: "bcs-intl-010", examType: "bcs", subject: "International Affairs", topic: "Organizations", difficulty: "easy", language: "en", question: "Where is the headquarters of the United Nations?", options: ["Geneva", "London", "New York", "Paris"], correctAnswer: 2, explanation: "The UN headquarters is located in New York City, USA." },
  { id: "bcs-intl-011", examType: "bcs", subject: "International Affairs", topic: "Current Affairs", difficulty: "medium", language: "bn", question: "জাতিসংঘের নিরাপত্তা পরিষদের স্থায়ী সদস্য কয়টি?", options: ["৩", "৫", "৭", "১০"], correctAnswer: 1, explanation: "জাতিসংঘের নিরাপত্তা পরিষদে ৫টি স্থায়ী সদস্য: যুক্তরাষ্ট্র, যুক্তরাজ্য, ফ্রান্স, রাশিয়া, চীন।" },

  // ===== Additional Madrasah Questions =====
  { id: "mad-ar-010", examType: "madrasah", subject: "Arabic", topic: "Nahw & Sarf", difficulty: "medium", language: "bn", question: "'ইসম' কত প্রকার?", options: ["২", "৩", "৪", "৫"], correctAnswer: 1, explanation: "ইসম ৩ প্রকার: ইসমে মুযাক্কার (পুংলিঙ্গ), ইসমে মুআন্নাস (স্ত্রীলিঙ্গ) এবং মাবনী ও মু'রাব।" },
  { id: "mad-quran-010", examType: "madrasah", subject: "Quran Studies", topic: "General", difficulty: "easy", language: "bn", question: "কুরআনে মোট কয়টি সূরা আছে?", options: ["৯৯", "১১০", "১১৪", "১২০"], correctAnswer: 2, explanation: "পবিত্র কুরআনে মোট ১১৪টি সূরা আছে।" },
  { id: "mad-quran-011", examType: "madrasah", subject: "Quran Studies", topic: "Tafsir", difficulty: "medium", language: "bn", question: "কুরআনের দীর্ঘতম সূরা কোনটি?", options: ["সূরা ফাতিহা", "সূরা বাকারা", "সূরা আল ইমরান", "সূরা নিসা"], correctAnswer: 1, explanation: "সূরা বাকারা কুরআনের দীর্ঘতম সূরা, এতে ২৮৬টি আয়াত আছে।" },
  { id: "mad-islamic-010", examType: "madrasah", subject: "Islamic Studies", topic: "Hadith", difficulty: "easy", language: "bn", question: "ইসলামের স্তম্ভ কয়টি?", options: ["৩", "৪", "৫", "৬"], correctAnswer: 2, explanation: "ইসলামের ৫টি স্তম্ভ: কালিমা, নামায, রোযা, হজ্জ, যাকাত।" },
  { id: "mad-islamic-011", examType: "madrasah", subject: "Islamic Studies", topic: "Fiqh", difficulty: "medium", language: "bn", question: "ফরজ নামায কয় ওয়াক্ত?", options: ["৩", "৪", "৫", "৬"], correctAnswer: 2, explanation: "ফরজ নামায ৫ ওয়াক্ত: ফজর, যোহর, আসর, মাগরিব, এশা।" },
  { id: "mad-islamic-012", examType: "madrasah", subject: "Islamic Studies", topic: "Aqeedah", difficulty: "medium", language: "bn", question: "তাওহীদ শব্দের অর্থ কী?", options: ["বিশ্বাস", "একত্ববাদ", "পূজা", "প্রার্থনা"], correctAnswer: 1, explanation: "তাওহীদ অর্থ একত্ববাদ - আল্লাহর একত্বে বিশ্বাস করা।" },
  { id: "mad-bn-010", examType: "madrasah", subject: "Bangla", topic: "Grammar", difficulty: "easy", language: "bn", question: "বাংলা বর্ণমালায় ব্যঞ্জনবর্ণ কয়টি?", options: ["৩৫", "৩৬", "৩৯", "৪০"], correctAnswer: 2, explanation: "বাংলা বর্ণমালায় মোট ৩৯টি ব্যঞ্জনবর্ণ আছে।" },
  { id: "mad-en-010", examType: "madrasah", subject: "English", topic: "Grammar", difficulty: "easy", language: "en", question: "Which is a noun?", options: ["Run", "Beautiful", "Quickly", "Happiness"], correctAnswer: 3, explanation: "'Happiness' is a noun. 'Run' is a verb, 'Beautiful' is an adjective, 'Quickly' is an adverb." },
  { id: "mad-math-010", examType: "madrasah", subject: "Mathematics", topic: "Arithmetic", difficulty: "easy", language: "en", question: "What is 25% of 200?", options: ["25", "50", "75", "100"], correctAnswer: 1, explanation: "25% of 200 = (25/100) × 200 = 50" },
  { id: "mad-sci-010", examType: "madrasah", subject: "Science", topic: "Biology", difficulty: "easy", language: "bn", question: "মানুষের দেহে মোট কয়টি হাড় আছে?", options: ["১৮৬", "২০৬", "২৫৬", "৩০৬"], correctAnswer: 1, explanation: "একজন প্রাপ্তবয়স্ক মানুষের দেহে মোট ২০৬টি হাড় আছে।" },

  { id: "bcs-bn-020", examType: "bcs", subject: "Bangla", topic: "Grammar", difficulty: "hard", language: "bn", question: "'প্রত্যয়' কত প্রকার?", options: ["২", "৩", "৪", "৫"], correctAnswer: 0, explanation: "প্রত্যয় ২ প্রকার: কৃৎ প্রত্যয় (ধাতুর সাথে যুক্ত) এবং তদ্ধিত প্রত্যয় (শব্দের সাথে যুক্ত)।" },
  { id: "bcs-bn-021", examType: "bcs", subject: "Bangla", topic: "Literature", difficulty: "hard", language: "bn", question: "'জীবনানন্দ দাশ' কোন কাব্যধারার কবি?", options: ["রোমান্টিক", "আধুনিক", "মধ্যযুগীয়", "প্রাচীন"], correctAnswer: 1, explanation: "জীবনানন্দ দাশ আধুনিক বাংলা কবিতার অন্যতম প্রধান কবি। তিনি 'রূপসী বাংলা' খ্যাত।" },
  { id: "ssc-phy-015", examType: "ssc", subject: "Physics", topic: "Mechanics", difficulty: "medium", language: "en", question: "What is the SI unit of work?", options: ["Newton", "Joule", "Watt", "Pascal"], correctAnswer: 1, explanation: "The SI unit of work is Joule (J). Work = Force × Displacement." },
  { id: "ssc-phy-016", examType: "ssc", subject: "Physics", topic: "Heat", difficulty: "easy", language: "bn", question: "পানির স্ফুটনাঙ্ক কত?", options: ["৫০°C", "৭৫°C", "১০০°C", "১২০°C"], correctAnswer: 2, explanation: "স্বাভাবিক চাপে পানির স্ফুটনাঙ্ক ১০০°C বা ২১২°F।" },
  { id: "hsc-bn-015", examType: "hsc", subject: "Bangla", topic: "Grammar", difficulty: "hard", language: "bn", question: "'ণ-ত্ব বিধান' কী?", options: ["ণ ব্যবহারের নিয়ম", "ন ব্যবহারের নিয়ম", "র ব্যবহারের নিয়ম", "ল ব্যবহারের নিয়ম"], correctAnswer: 0, explanation: "ণ-ত্ব বিধান হলো বাংলা ভাষায় মূর্ধন্য ণ ব্যবহারের নিয়ম। তৎসম শব্দে ঋ, র, ষ এর পরে ণ হয়।" },
  { id: "med-bio-020", examType: "medical", subject: "Biology", topic: "Botany", difficulty: "medium", language: "en", question: "What is photosynthesis?", options: ["Breaking down food", "Making food using light", "Respiration in plants", "Water absorption"], correctAnswer: 1, explanation: "Photosynthesis is the process by which green plants make food using sunlight, water, and CO2." },
  { id: "med-chem-015", examType: "medical", subject: "Chemistry", topic: "Physical Chemistry", difficulty: "hard", language: "en", question: "What is Avogadro's number?", options: ["6.022 × 10²²", "6.022 × 10²³", "6.022 × 10²⁴", "6.022 × 10²⁵"], correctAnswer: 1, explanation: "Avogadro's number is 6.022 × 10²³, the number of particles in one mole of a substance." },
  { id: "eng-math-020", examType: "engineering", subject: "Mathematics", topic: "Algebra", difficulty: "hard", language: "en", question: "What is the value of log₁₀(100)?", options: ["1", "2", "10", "100"], correctAnswer: 1, explanation: "log₁₀(100) = log₁₀(10²) = 2" },
  { id: "uni-gk-015", examType: "university", subject: "General Knowledge", topic: "Science & Tech", difficulty: "medium", language: "en", question: "Who invented the telephone?", options: ["Thomas Edison", "Alexander Graham Bell", "Nikola Tesla", "Guglielmo Marconi"], correctAnswer: 1, explanation: "Alexander Graham Bell is credited with inventing the first practical telephone in 1876." },
  { id: "jsc-math-015", examType: "jsc", subject: "Mathematics", topic: "Arithmetic", difficulty: "easy", language: "en", question: "What is the LCM of 4 and 6?", options: ["8", "10", "12", "24"], correctAnswer: 2, explanation: "LCM (Least Common Multiple) of 4 and 6 is 12. (4×3=12, 6×2=12)" },
  { id: "jsc-sci-015", examType: "jsc", subject: "Science", topic: "Biology", difficulty: "easy", language: "bn", question: "উদ্ভিদের খাদ্য তৈরির প্রক্রিয়াকে কী বলে?", options: ["শ্বসন", "সালোকসংশ্লেষণ", "বাষ্পমোচন", "অভিস্রবণ"], correctAnswer: 1, explanation: "উদ্ভিদের খাদ্য তৈরির প্রক্রিয়াকে সালোকসংশ্লেষণ (Photosynthesis) বলে।" },
  { id: "psc-en-015", examType: "psc", subject: "English", topic: "Grammar", difficulty: "easy", language: "en", question: "Which word is a verb?", options: ["Cat", "Run", "Big", "Happy"], correctAnswer: 1, explanation: "'Run' is a verb (action word). 'Cat' is a noun, 'Big' and 'Happy' are adjectives." },
];

export function getSubjectsForExamType(examType: ExamType): SubjectInfo[] {
  return EXAM_TYPES.find((e) => e.id === examType)?.subjects || [];
}

export function getQuestionsForSubject(subject: string, topic?: string, difficulty?: Difficulty, language?: Language): Question[] {
  let filtered = QUESTIONS.filter((q) => q.subject === subject);
  if (topic) filtered = filtered.filter((q) => q.topic === topic);
  if (difficulty) filtered = filtered.filter((q) => q.difficulty === difficulty);
  if (language) filtered = filtered.filter((q) => q.language === language);
  return filtered;
}

export function getQuestionsForExamType(examType: ExamType, language?: Language): Question[] {
  let filtered = QUESTIONS.filter((q) => q.examType === examType);
  if (language) filtered = filtered.filter((q) => q.language === language);
  return filtered;
}

export type EducationLevel = "primary" | "junior" | "ssc" | "hsc" | "university" | "job";

const EDUCATION_EXAM_MAP: Record<EducationLevel, ExamType[]> = {
  primary: ["psc"],
  junior: ["jsc"],
  ssc: ["ssc", "madrasah"],
  hsc: ["hsc", "madrasah"],
  university: ["medical", "engineering", "university"],
  job: ["bcs"],
};

export function getExamTypesForEducation(level: EducationLevel): ExamType[] {
  return EDUCATION_EXAM_MAP[level] || Object.keys(EDUCATION_EXAM_MAP).flatMap(k => EDUCATION_EXAM_MAP[k as EducationLevel]);
}

export function getRecommendedExamTypes(level: string): ExamType[] {
  if (level in EDUCATION_EXAM_MAP) {
    return EDUCATION_EXAM_MAP[level as EducationLevel];
  }
  return EXAM_TYPES.map(e => e.id);
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
