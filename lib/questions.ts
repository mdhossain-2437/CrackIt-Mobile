import type { Language } from "./i18n";

export type ExamType = "bcs" | "medical" | "engineering" | "university" | "ssc" | "hsc" | "jsc" | "psc" | "madrasah";
export type Difficulty = "easy" | "medium" | "hard";

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

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
