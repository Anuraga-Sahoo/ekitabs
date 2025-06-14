
import type { ObjectId } from 'mongodb';

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

// Represents the notification structure in MongoDB
export interface NotificationDocument {
  _id: ObjectId; 
  title: string;
  contentHTML: string; 
  link?: string;
  createdAt: Date; // Main notification creation date as Date object
  updatedAt: Date; // Main notification last update date as Date object
  userIds: string[]; // Array of user IDs this notification is for
  readStatus: Array<{ 
    userId: string; 
    isRead: boolean; 
    lastStatusUpdate: Date; 
  }>; 
}

// Represents the notification structure for the client
export interface ClientNotification {
  _id: string; 
  title: string;
  contentHTML: string; 
  link?: string;
  createdAt: string; // ISO date string (main notification creation)
  isRead: boolean; // Derived for the current user
}

// Represents the subject structure in MongoDB
export interface SubjectDocumentMongo {
  _id: ObjectId;
  name: string;
  imgUrl?: string;
}

// Represents the subject structure for the client
export interface Subject {
  id: string;
  name: string;
  imgUrl?: string;
}

// Represents the exam category structure in MongoDB
export interface ExamCategoryDocumentMongo {
  _id: ObjectId;
  name: string;
  description?: string;
}

// Represents the exam category structure for the client
export interface ExamCategory {
  id: string;
  name: string;
  description?: string;
}

// Represents the exam structure in MongoDB
export interface ExamDocumentMongo {
  _id: ObjectId;
  name: string;
  categoryId: ObjectId | string; // Can be ObjectId if ref, or string if just an ID
  quizIds: string[]; // Array of StoredQuiz IDs
  testType: string; // e.g., "Mock", "Practice"
  iconUrl?: string;
  description?: string;
}

// Represents the exam structure for the client
export interface Exam {
  id: string;
  name: string;
  categoryId: string;
  quizIds: string[];
  testType: string;
  iconUrl?: string;
  description?: string;
}
