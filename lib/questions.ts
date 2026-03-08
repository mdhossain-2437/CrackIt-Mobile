export type ExamType = "bcs" | "medical" | "engineering" | "university";
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
}

export interface SubjectInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  topics: string[];
}

export interface ExamTypeInfo {
  id: ExamType;
  name: string;
  icon: string;
  description: string;
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

export interface UserData {
  examType: ExamType;
  streak: number;
  lastPracticeDate: string;
  totalQuestionsSolved: number;
  totalCorrect: number;
  subjectProgress: Record<string, SubjectProgress>;
  examHistory: ExamResult[];
  onboarded: boolean;
  xp: number;
}

export const EXAM_TYPES: ExamTypeInfo[] = [
  {
    id: "bcs",
    name: "BCS",
    icon: "briefcase-outline",
    description: "Bangladesh Civil Service",
    subjects: [
      { id: "bd-affairs", name: "Bangladesh Affairs", icon: "flag-outline", color: "#E53935", topics: ["Liberation War", "Constitution", "Geography", "Economy"] },
      { id: "english", name: "English", icon: "chatbubble-ellipses-outline", color: "#1565C0", topics: ["Grammar", "Vocabulary", "Comprehension"] },
      { id: "gen-science", name: "General Science", icon: "flask-outline", color: "#00897B", topics: ["Biology", "Physics", "Chemistry"] },
      { id: "math-reasoning", name: "Mathematics", icon: "calculator-outline", color: "#6A1B9A", topics: ["Arithmetic", "Algebra", "Geometry"] },
      { id: "intl-affairs", name: "International Affairs", icon: "globe-outline", color: "#00838F", topics: ["Organizations", "Current Affairs"] },
      { id: "computer", name: "Computer & IT", icon: "desktop-outline", color: "#37474F", topics: ["Basics", "Networking", "Programming"] },
    ],
  },
  {
    id: "medical",
    name: "Medical",
    icon: "medkit-outline",
    description: "Medical Admission",
    subjects: [
      { id: "biology", name: "Biology", icon: "leaf-outline", color: "#2E7D32", topics: ["Cell Biology", "Genetics", "Human Physiology", "Botany"] },
      { id: "chemistry", name: "Chemistry", icon: "color-filter-outline", color: "#EF6C00", topics: ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry"] },
      { id: "physics", name: "Physics", icon: "flash-outline", color: "#0277BD", topics: ["Mechanics", "Optics", "Electricity", "Thermodynamics"] },
    ],
  },
  {
    id: "engineering",
    name: "Engineering",
    icon: "construct-outline",
    description: "Engineering Admission",
    subjects: [
      { id: "eng-math", name: "Mathematics", icon: "calculator-outline", color: "#6A1B9A", topics: ["Calculus", "Algebra", "Trigonometry", "Coordinate Geometry"] },
      { id: "eng-physics", name: "Physics", icon: "flash-outline", color: "#0277BD", topics: ["Mechanics", "Waves", "Electromagnetism", "Modern Physics"] },
      { id: "eng-chemistry", name: "Chemistry", icon: "color-filter-outline", color: "#EF6C00", topics: ["Organic", "Inorganic", "Physical Chemistry"] },
    ],
  },
  {
    id: "university",
    name: "University",
    icon: "school-outline",
    description: "University Admission",
    subjects: [
      { id: "uni-english", name: "English", icon: "chatbubble-ellipses-outline", color: "#1565C0", topics: ["Grammar", "Vocabulary", "Reading Comprehension"] },
      { id: "uni-gk", name: "General Knowledge", icon: "bulb-outline", color: "#AD1457", topics: ["Bangladesh", "International", "Science & Tech"] },
      { id: "uni-math", name: "Mathematics", icon: "calculator-outline", color: "#6A1B9A", topics: ["Algebra", "Geometry", "Arithmetic"] },
    ],
  },
];

export const QUESTIONS: Question[] = [
  {
    id: "bcs-bd-001", examType: "bcs", subject: "Bangladesh Affairs", topic: "Liberation War", difficulty: "easy",
    question: "In which year did Bangladesh gain independence?",
    options: ["1947", "1965", "1971", "1975"],
    correctAnswer: 2,
    explanation: "Bangladesh gained independence on March 26, 1971, after a nine-month liberation war against Pakistan. The victory was achieved on December 16, 1971.",
  },
  {
    id: "bcs-bd-002", examType: "bcs", subject: "Bangladesh Affairs", topic: "Liberation War", difficulty: "medium",
    question: "Who was the first Prime Minister of Bangladesh?",
    options: ["Sheikh Mujibur Rahman", "Tajuddin Ahmad", "Syed Nazrul Islam", "M. Mansur Ali"],
    correctAnswer: 1,
    explanation: "Tajuddin Ahmad served as the first Prime Minister of Bangladesh during the Mujibnagar government (the government-in-exile) from April to December 1971.",
  },
  {
    id: "bcs-bd-003", examType: "bcs", subject: "Bangladesh Affairs", topic: "Constitution", difficulty: "medium",
    question: "How many fundamental principles are stated in the Constitution of Bangladesh?",
    options: ["3", "4", "5", "6"],
    correctAnswer: 1,
    explanation: "The Constitution of Bangladesh has 4 fundamental principles: Nationalism, Socialism, Democracy, and Secularism (as per the 15th Amendment).",
  },
  {
    id: "bcs-bd-004", examType: "bcs", subject: "Bangladesh Affairs", topic: "Geography", difficulty: "easy",
    question: "What is the largest district of Bangladesh by area?",
    options: ["Dhaka", "Chittagong", "Rangamati", "Sylhet"],
    correctAnswer: 2,
    explanation: "Rangamati is the largest district of Bangladesh by area, covering approximately 6,116 square kilometers in the Chittagong Hill Tracts.",
  },
  {
    id: "bcs-bd-005", examType: "bcs", subject: "Bangladesh Affairs", topic: "Economy", difficulty: "medium",
    question: "Which sector contributes most to Bangladesh's export earnings?",
    options: ["Agriculture", "Ready-Made Garments", "IT Services", "Remittance"],
    correctAnswer: 1,
    explanation: "The Ready-Made Garments (RMG) sector is the largest export earner for Bangladesh, contributing over 80% of total export earnings.",
  },
  {
    id: "bcs-bd-006", examType: "bcs", subject: "Bangladesh Affairs", topic: "Liberation War", difficulty: "hard",
    question: "How many sectors was Bangladesh divided into during the Liberation War?",
    options: ["9", "10", "11", "12"],
    correctAnswer: 2,
    explanation: "During the Liberation War of 1971, Bangladesh was divided into 11 sectors, each commanded by a sector commander to organize the guerrilla warfare.",
  },
  {
    id: "bcs-en-001", examType: "bcs", subject: "English", topic: "Grammar", difficulty: "easy",
    question: "Choose the correct article: '___ European country'",
    options: ["A", "An", "The", "No article needed"],
    correctAnswer: 0,
    explanation: "'European' starts with a consonant sound /j/, so the article 'a' is used, not 'an'. Articles depend on the sound, not the letter.",
  },
  {
    id: "bcs-en-002", examType: "bcs", subject: "English", topic: "Vocabulary", difficulty: "medium",
    question: "What is the synonym of 'ubiquitous'?",
    options: ["Rare", "Omnipresent", "Unique", "Obscure"],
    correctAnswer: 1,
    explanation: "'Ubiquitous' means present, appearing, or found everywhere. 'Omnipresent' has the same meaning - being present everywhere at the same time.",
  },
  {
    id: "bcs-en-003", examType: "bcs", subject: "English", topic: "Grammar", difficulty: "medium",
    question: "Select the correct form: 'He ___ here since 2020.'",
    options: ["is living", "has been living", "was living", "had lived"],
    correctAnswer: 1,
    explanation: "The present perfect continuous tense 'has been living' is used to indicate an action that started in the past (2020) and continues to the present.",
  },
  {
    id: "bcs-en-004", examType: "bcs", subject: "English", topic: "Vocabulary", difficulty: "easy",
    question: "What is the antonym of 'benevolent'?",
    options: ["Kind", "Generous", "Malevolent", "Charitable"],
    correctAnswer: 2,
    explanation: "'Benevolent' means well-meaning and kindly. Its antonym 'malevolent' means having or showing a wish to do evil to others.",
  },
  {
    id: "bcs-en-005", examType: "bcs", subject: "English", topic: "Comprehension", difficulty: "medium",
    question: "Which sentence is grammatically correct?",
    options: ["Each of the boys have a book.", "Each of the boys has a book.", "Each of the boys are having a book.", "Each of the boys were having books."],
    correctAnswer: 1,
    explanation: "'Each' is a singular pronoun and takes a singular verb. Therefore, 'Each of the boys has a book' is grammatically correct.",
  },
  {
    id: "bcs-gs-001", examType: "bcs", subject: "General Science", topic: "Biology", difficulty: "easy",
    question: "What is the process by which plants make their own food?",
    options: ["Respiration", "Transpiration", "Photosynthesis", "Osmosis"],
    correctAnswer: 2,
    explanation: "Photosynthesis is the process by which green plants use sunlight, carbon dioxide, and water to produce glucose and oxygen.",
  },
  {
    id: "bcs-gs-002", examType: "bcs", subject: "General Science", topic: "Physics", difficulty: "easy",
    question: "What is the SI unit of electric current?",
    options: ["Volt", "Watt", "Ohm", "Ampere"],
    correctAnswer: 3,
    explanation: "The SI unit of electric current is the Ampere (A), named after French physicist Andre-Marie Ampere.",
  },
  {
    id: "bcs-gs-003", examType: "bcs", subject: "General Science", topic: "Chemistry", difficulty: "easy",
    question: "What is the pH value of pure water?",
    options: ["0", "5", "7", "14"],
    correctAnswer: 2,
    explanation: "Pure water has a pH of 7, which is neutral. pH values below 7 are acidic, and above 7 are alkaline.",
  },
  {
    id: "bcs-mr-001", examType: "bcs", subject: "Mathematics", topic: "Arithmetic", difficulty: "easy",
    question: "What is the LCM of 12 and 18?",
    options: ["6", "24", "36", "72"],
    correctAnswer: 2,
    explanation: "LCM of 12 (2x2x3) and 18 (2x3x3) = 2x2x3x3 = 36. The LCM is the smallest number divisible by both.",
  },
  {
    id: "bcs-mr-002", examType: "bcs", subject: "Mathematics", topic: "Arithmetic", difficulty: "medium",
    question: "If a product costs Tk. 500 and is sold at 20% profit, what is the selling price?",
    options: ["Tk. 550", "Tk. 580", "Tk. 600", "Tk. 620"],
    correctAnswer: 2,
    explanation: "Selling price = Cost price + Profit = 500 + (20% of 500) = 500 + 100 = Tk. 600.",
  },
  {
    id: "bcs-mr-003", examType: "bcs", subject: "Mathematics", topic: "Geometry", difficulty: "medium",
    question: "What is the area of a circle with radius 7 cm? (Use pi = 22/7)",
    options: ["44 sq cm", "88 sq cm", "154 sq cm", "308 sq cm"],
    correctAnswer: 2,
    explanation: "Area = pi x r^2 = (22/7) x 7 x 7 = 22 x 7 = 154 sq cm.",
  },
  {
    id: "med-bio-001", examType: "medical", subject: "Biology", topic: "Cell Biology", difficulty: "easy",
    question: "Which organelle is known as the 'powerhouse of the cell'?",
    options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"],
    correctAnswer: 2,
    explanation: "Mitochondria are called the powerhouse of the cell because they produce ATP (adenosine triphosphate) through cellular respiration, providing energy for cell functions.",
  },
  {
    id: "med-bio-002", examType: "medical", subject: "Biology", topic: "Genetics", difficulty: "easy",
    question: "How many chromosomes are found in a normal human cell?",
    options: ["23", "44", "46", "48"],
    correctAnswer: 2,
    explanation: "Normal human cells contain 46 chromosomes (23 pairs). 22 pairs are autosomes and 1 pair is sex chromosomes (XX or XY).",
  },
  {
    id: "med-bio-003", examType: "medical", subject: "Biology", topic: "Human Physiology", difficulty: "easy",
    question: "Which blood group is known as the universal donor?",
    options: ["A positive", "B positive", "AB positive", "O negative"],
    correctAnswer: 3,
    explanation: "O negative blood type is the universal donor because it lacks A, B, and Rh antigens, so it can be given to patients of any blood type without causing a reaction.",
  },
  {
    id: "med-bio-004", examType: "medical", subject: "Biology", topic: "Human Physiology", difficulty: "medium",
    question: "Which hormone regulates blood sugar levels?",
    options: ["Thyroxine", "Insulin", "Adrenaline", "Cortisol"],
    correctAnswer: 1,
    explanation: "Insulin, produced by beta cells of the pancreatic islets of Langerhans, regulates blood sugar by facilitating glucose uptake into cells.",
  },
  {
    id: "med-bio-005", examType: "medical", subject: "Biology", topic: "Botany", difficulty: "medium",
    question: "Which tissue is responsible for the transport of water in plants?",
    options: ["Phloem", "Xylem", "Cambium", "Epidermis"],
    correctAnswer: 1,
    explanation: "Xylem tissue transports water and dissolved minerals from roots to other parts of the plant through vessels and tracheids.",
  },
  {
    id: "med-bio-006", examType: "medical", subject: "Biology", topic: "Genetics", difficulty: "hard",
    question: "In Mendel's dihybrid cross (RrYy x RrYy), what is the phenotypic ratio?",
    options: ["3:1", "1:2:1", "9:3:3:1", "1:1:1:1"],
    correctAnswer: 2,
    explanation: "Mendel's dihybrid cross produces a 9:3:3:1 phenotypic ratio in F2 generation: 9 dominant-dominant : 3 dominant-recessive : 3 recessive-dominant : 1 recessive-recessive.",
  },
  {
    id: "med-chem-001", examType: "medical", subject: "Chemistry", topic: "Inorganic Chemistry", difficulty: "easy",
    question: "What is the atomic number of Carbon?",
    options: ["4", "6", "8", "12"],
    correctAnswer: 1,
    explanation: "Carbon has an atomic number of 6, meaning it has 6 protons in its nucleus. Its mass number is 12 (6 protons + 6 neutrons).",
  },
  {
    id: "med-chem-002", examType: "medical", subject: "Chemistry", topic: "Inorganic Chemistry", difficulty: "easy",
    question: "Which gas is most abundant in Earth's atmosphere?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
    correctAnswer: 2,
    explanation: "Nitrogen (N2) makes up approximately 78% of Earth's atmosphere, followed by Oxygen at about 21%.",
  },
  {
    id: "med-chem-003", examType: "medical", subject: "Chemistry", topic: "Physical Chemistry", difficulty: "medium",
    question: "What is the chemical formula of sulfuric acid?",
    options: ["HCl", "HNO3", "H2SO4", "H3PO4"],
    correctAnswer: 2,
    explanation: "Sulfuric acid has the chemical formula H2SO4. It is a strong diprotic acid widely used in industry and laboratories.",
  },
  {
    id: "med-chem-004", examType: "medical", subject: "Chemistry", topic: "Organic Chemistry", difficulty: "medium",
    question: "What is the functional group of alcohols?",
    options: ["-COOH", "-OH", "-CHO", "-NH2"],
    correctAnswer: 1,
    explanation: "Alcohols contain the hydroxyl (-OH) functional group. Examples include methanol (CH3OH) and ethanol (C2H5OH).",
  },
  {
    id: "med-phy-001", examType: "medical", subject: "Physics", topic: "Mechanics", difficulty: "easy",
    question: "What is the SI unit of force?",
    options: ["Joule", "Pascal", "Newton", "Watt"],
    correctAnswer: 2,
    explanation: "The SI unit of force is Newton (N), named after Sir Isaac Newton. 1 Newton = 1 kg x m/s^2.",
  },
  {
    id: "med-phy-002", examType: "medical", subject: "Physics", topic: "Optics", difficulty: "easy",
    question: "What is the approximate speed of light in vacuum?",
    options: ["3 x 10^6 m/s", "3 x 10^8 m/s", "3 x 10^10 m/s", "3 x 10^12 m/s"],
    correctAnswer: 1,
    explanation: "The speed of light in vacuum is approximately 3 x 10^8 m/s (299,792,458 m/s exactly). It is denoted by 'c' and is a fundamental constant.",
  },
  {
    id: "med-phy-003", examType: "medical", subject: "Physics", topic: "Electricity", difficulty: "easy",
    question: "According to Ohm's law, V = ?",
    options: ["I / R", "I x R", "R / I", "I + R"],
    correctAnswer: 1,
    explanation: "Ohm's law states that V = IR, where V is voltage (volts), I is current (amperes), and R is resistance (ohms).",
  },
  {
    id: "med-phy-004", examType: "medical", subject: "Physics", topic: "Thermodynamics", difficulty: "medium",
    question: "Which law of thermodynamics states that energy can neither be created nor destroyed?",
    options: ["Zeroth Law", "First Law", "Second Law", "Third Law"],
    correctAnswer: 1,
    explanation: "The First Law of Thermodynamics (Law of Conservation of Energy) states that energy cannot be created or destroyed, only transformed from one form to another.",
  },
  {
    id: "eng-math-001", examType: "engineering", subject: "Mathematics", topic: "Calculus", difficulty: "medium",
    question: "What is the derivative of x^3?",
    options: ["x^2", "2x^2", "3x^2", "3x^3"],
    correctAnswer: 2,
    explanation: "Using the power rule: d/dx(x^n) = nx^(n-1). So d/dx(x^3) = 3x^(3-1) = 3x^2.",
  },
  {
    id: "eng-math-002", examType: "engineering", subject: "Mathematics", topic: "Calculus", difficulty: "medium",
    question: "What is the integral of 2x dx?",
    options: ["x + C", "x^2 + C", "2x^2 + C", "x^2/2 + C"],
    correctAnswer: 1,
    explanation: "Using the power rule for integration: integral of 2x dx = 2(x^2/2) + C = x^2 + C.",
  },
  {
    id: "eng-math-003", examType: "engineering", subject: "Mathematics", topic: "Trigonometry", difficulty: "easy",
    question: "What is the value of sin 30 degrees?",
    options: ["0", "0.5", "0.707", "1"],
    correctAnswer: 1,
    explanation: "Sin 30 degrees = 1/2 = 0.5. This is one of the standard trigonometric values that should be memorized.",
  },
  {
    id: "eng-math-004", examType: "engineering", subject: "Mathematics", topic: "Algebra", difficulty: "easy",
    question: "What is log base 10 of 1000?",
    options: ["1", "2", "3", "4"],
    correctAnswer: 2,
    explanation: "log10(1000) = log10(10^3) = 3, because 10 raised to the power 3 equals 1000.",
  },
  {
    id: "eng-math-005", examType: "engineering", subject: "Mathematics", topic: "Algebra", difficulty: "hard",
    question: "If the determinant of a 2x2 matrix is 0, then the matrix is:",
    options: ["Symmetric", "Orthogonal", "Singular", "Diagonal"],
    correctAnswer: 2,
    explanation: "A matrix with a determinant of 0 is called a singular matrix. It means the matrix has no inverse and its rows/columns are linearly dependent.",
  },
  {
    id: "eng-phy-001", examType: "engineering", subject: "Physics", topic: "Mechanics", difficulty: "easy",
    question: "What is the standard acceleration due to gravity on Earth's surface?",
    options: ["8.9 m/s^2", "9.8 m/s^2", "10.8 m/s^2", "11.2 m/s^2"],
    correctAnswer: 1,
    explanation: "The standard acceleration due to gravity (g) on Earth's surface is approximately 9.8 m/s^2 (or 9.81 m/s^2 more precisely).",
  },
  {
    id: "eng-phy-002", examType: "engineering", subject: "Physics", topic: "Waves", difficulty: "medium",
    question: "What is the SI unit of frequency?",
    options: ["Second", "Hertz", "Meter", "Radian"],
    correctAnswer: 1,
    explanation: "The SI unit of frequency is Hertz (Hz), named after Heinrich Hertz. 1 Hz = 1 cycle per second.",
  },
  {
    id: "eng-phy-003", examType: "engineering", subject: "Physics", topic: "Electromagnetism", difficulty: "medium",
    question: "What is the SI unit of capacitance?",
    options: ["Henry", "Farad", "Tesla", "Weber"],
    correctAnswer: 1,
    explanation: "The SI unit of capacitance is Farad (F), named after Michael Faraday. A capacitor has 1 Farad of capacitance when 1 Coulomb of charge produces 1 Volt.",
  },
  {
    id: "eng-phy-004", examType: "engineering", subject: "Physics", topic: "Mechanics", difficulty: "medium",
    question: "A body of mass 5 kg is moving with velocity 10 m/s. What is its kinetic energy?",
    options: ["50 J", "100 J", "250 J", "500 J"],
    correctAnswer: 2,
    explanation: "Kinetic Energy = 1/2 x m x v^2 = 1/2 x 5 x 10^2 = 1/2 x 5 x 100 = 250 J.",
  },
  {
    id: "uni-en-001", examType: "university", subject: "English", topic: "Grammar", difficulty: "easy",
    question: "Choose the correct sentence:",
    options: ["He don't know the answer.", "He doesn't knows the answer.", "He doesn't know the answer.", "He not know the answer."],
    correctAnswer: 2,
    explanation: "With third person singular (He/She/It), we use 'doesn't' + base form of the verb. 'He doesn't know' is the correct negative form.",
  },
  {
    id: "uni-en-002", examType: "university", subject: "English", topic: "Vocabulary", difficulty: "medium",
    question: "The word 'ephemeral' means:",
    options: ["Permanent", "Lasting for a very short time", "Important", "Ancient"],
    correctAnswer: 1,
    explanation: "'Ephemeral' means lasting for a very short time, transitory. Example: 'The ephemeral beauty of cherry blossoms.'",
  },
  {
    id: "uni-gk-001", examType: "university", subject: "General Knowledge", topic: "Bangladesh", difficulty: "easy",
    question: "What is the national flower of Bangladesh?",
    options: ["Rose", "Sunflower", "Water Lily (Shapla)", "Lotus"],
    correctAnswer: 2,
    explanation: "The Water Lily (Shapla/Nymphaea nouchali) is the national flower of Bangladesh. It symbolizes the many rivers and water bodies of the country.",
  },
  {
    id: "uni-gk-002", examType: "university", subject: "General Knowledge", topic: "International", difficulty: "medium",
    question: "Which organization has its headquarters in Geneva, Switzerland?",
    options: ["UNESCO", "WHO", "UNICEF", "IMF"],
    correctAnswer: 1,
    explanation: "The World Health Organization (WHO) has its headquarters in Geneva, Switzerland. UNESCO is in Paris, UNICEF in New York, and IMF in Washington D.C.",
  },
  {
    id: "uni-gk-003", examType: "university", subject: "General Knowledge", topic: "Science & Tech", difficulty: "medium",
    question: "Who is known as the father of the World Wide Web?",
    options: ["Bill Gates", "Steve Jobs", "Tim Berners-Lee", "Mark Zuckerberg"],
    correctAnswer: 2,
    explanation: "Sir Tim Berners-Lee invented the World Wide Web in 1989 while working at CERN. He created HTML, HTTP, and the first web browser.",
  },
  {
    id: "uni-math-001", examType: "university", subject: "Mathematics", topic: "Arithmetic", difficulty: "easy",
    question: "What is 25% of 400?",
    options: ["75", "100", "125", "150"],
    correctAnswer: 1,
    explanation: "25% of 400 = (25/100) x 400 = 100.",
  },
];

export function getSubjectsForExamType(examType: ExamType): SubjectInfo[] {
  return EXAM_TYPES.find((e) => e.id === examType)?.subjects || [];
}

export function getQuestionsForSubject(subject: string, topic?: string, difficulty?: Difficulty): Question[] {
  let filtered = QUESTIONS.filter((q) => q.subject === subject);
  if (topic) filtered = filtered.filter((q) => q.topic === topic);
  if (difficulty) filtered = filtered.filter((q) => q.difficulty === difficulty);
  return filtered;
}

export function getQuestionsForExamType(examType: ExamType): Question[] {
  return QUESTIONS.filter((q) => q.examType === examType);
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
