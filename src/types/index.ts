
export interface AppQuestion {
  id: string;
  subject: string;
  questionText: string;
  options: string[]; // For MCQs
  correctAnswer: string;
  userAnswer?: string;
}

export interface Test {
  id: string;
  type: 'mock' | 'practice';
  questions: AppQuestion[];
  durationMinutes: number; // Duration in minutes
  config?: PracticeTestConfig; // For practice tests
}

export interface PracticeTestConfig {
  subject: string;
  chapter: string;
  numberOfQuestions: number;
  complexityLevel: 'easy' | 'medium' | 'hard';
}

export interface TestScore {
  correct: number;
  incorrect: number;
  unanswered: number;
  totalScore: number;
  maxScore: number;
}

export interface TestResultItem {
  testId: string;
  testType: 'mock' | 'practice';
  dateCompleted: string;
  score: TestScore;
  questions: AppQuestion[];
  config?: PracticeTestConfig;
}

