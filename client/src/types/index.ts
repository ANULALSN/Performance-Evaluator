export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  techStack?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  consistencyScore: number;
  weeklyScore: number;
  streak: number;
  weaknessTags: string[];
  lastActiveAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface QuizQuestion {
  _id: string;
  question: string;
  options: string[];
  // correctIndex and explanation only for admin
  correctIndex?: number;
  explanation?: string;
}

export interface Quiz {
  _id: string;
  title: string;
  description: string;
  techStack: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  passingScore: number;
  questionCount: number;
  questions: QuizQuestion[];
  isActive?: boolean;
  hasAttempted?: boolean;
  myScore?: number | null;
  attemptCount?: number;
}

export interface QuizAttempt {
  _id: string;
  studentId: string | { name: string; email: string };
  quizId: string | { title: string };
  score: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  timeTaken: number;
  attemptedAt: string;
  breakdown?: {
    questionId: string;
    question: string;
    yourAnswer: string;
    correctAnswer: string;
    explanation: string;
    isCorrect: boolean;
  }[];
}

export interface DailyCheckIn {
  _id: string;
  studentId: string;
  learned: string;
  built: string;
  problem: string;
  aiFeedback: string;
  aiSuggestion: string;
  nextTask: string;
  submittedAt: string;
}

export interface DailyTask {
  _id: string;
  studentId: string;
  tasks: {
    _id: string;
    type: 'concept' | 'feature' | 'debug';
    title: string;
    completed: boolean;
  }[];
  allCompleted: boolean;
  date: string;
}

export interface CodingTestCase {
  _id?: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  explanation?: string;
}

export interface CodingProblem {
  _id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  techStack: 'Python' | 'JavaScript' | 'General';
  starterCode: {
    python: string;
    javascript: string;
  };
  testCases: CodingTestCase[];
  constraints: string[];
  hints: string[];
  timeLimit: number;
  pointsReward: number;
  isActive: boolean;
  createdAt: string;
  hasAttempted?: boolean;
  myScore?: number;
  status?: 'accepted' | 'partial' | 'failed' | 'error' | null;
}

export interface CodingAttempt {
  _id: string;
  studentId: string;
  problemId: string | { title: string; difficulty: string };
  language: 'python' | 'javascript';
  code: string;
  testResults: {
    testCaseId: string;
    passed: boolean;
    actualOutput: string;
    expectedOutput: string;
    isHidden: boolean;
    explanation?: string;
  }[];
  passedCount: number;
  totalVisible: number;
  totalHidden: number;
  score: number;
  status: 'accepted' | 'partial' | 'failed' | 'error';
  errorMessage?: string;
  timeTaken: number;
  hintsUsed: number;
  pointsAwarded: number;
  attemptedAt: string;
}
