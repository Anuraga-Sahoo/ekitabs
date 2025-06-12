
export interface AppQuestion {
  id: string;
  subject: string;
  questionText: string;
  options: string[]; // For MCQs
  correctAnswer: string;
  userAnswer?: string;
}

export interface Test {
  id: string; // This might refer to an originalQuizId if it's a predefined test
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
  testAttemptId: string; // Unique ID for this specific attempt
  originalQuizId: string; // ID of the original set of questions used for this attempt
  userId: string; // ID of the user who took this test
  testType: 'mock' | 'practice';
  testTitle: string; // e.g., "Mock Test" or "Practice: Physics - Kinematics"
  dateCompleted: string;
  score: TestScore;
  questions: AppQuestion[]; // Questions with user's answers for this attempt
  config?: PracticeTestConfig; // Stored for context, especially if practice test
  timeTakenSeconds?: number; // Time taken by user in seconds
}

// New type for storing the quiz questions themselves
export interface StoredQuiz {
  id: string; // This is the originalQuizId
  userId: string; // ID of the user who generated this quiz
  testType: 'mock' | 'practice';
  questions: AppQuestion[]; // The pristine set of questions
  config?: PracticeTestConfig; // For practice tests
  createdAt: string;
  title: string;
}

