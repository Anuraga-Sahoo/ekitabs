
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
  id: string; 
  type: 'mock' | 'practice';
  questions: AppQuestion[];
  durationMinutes: number; 
  config?: PracticeTestConfig; 
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
  testAttemptId: string; 
  originalQuizId: string; 
  userId: string; 
  testType: 'mock' | 'practice';
  testTitle: string; 
  dateCompleted: string;
  score: TestScore;
  questions: AppQuestion[]; 
  config?: PracticeTestConfig; 
  timeTakenSeconds?: number; 
}

export interface StoredQuiz {
  id: string; 
  userId: string; 
  testType: 'mock' | 'practice';
  questions: AppQuestion[]; 
  config?: PracticeTestConfig; 
  createdAt: string;
  title: string;
}

export interface NotificationDocument {
  _id: ObjectId; 
  title: string;
  contentHTML: string; 
  link?: string;
  createdAt: Date; 
  updatedAt: Date; 
  userIds: string[]; 
  readStatus: Array<{ 
    userId: string; 
    isRead: boolean; 
    lastStatusUpdate: Date; 
  }>; 
}

export interface ClientNotification {
  _id: string; 
  title: string;
  contentHTML: string; 
  link?: string;
  createdAt: string; 
  isRead: boolean; 
}

export interface SubjectDocumentMongo {
  _id: ObjectId;
  name: string;
  imgUrl?: string;
}

export interface Subject {
  id: string;
  name: string;
  imgUrl?: string;
}

export interface ExamCategoryDocumentMongo {
  _id: ObjectId;
  name: string;
  description?: string;
}

export interface ExamCategory { // This type can still be used if you have separate category pages/logic
  id: string;
  name: string;
  description?: string;
}

// Represents the "exams" collection structure in MongoDB
export interface ExamDocumentMongo {
  _id: ObjectId;
  name: string;
  categoryId?: ObjectId | string; // Optional if not all exams belong to a category
  quizIds: string[]; // Array of strings, each representing an ObjectId of a quiz
  iconUrl?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Client-side representation of an Exam for listing in dropdowns or general use
export interface Exam {
  id: string; // _id from ExamDocumentMongo
  name: string;
  // categoryId?: string; // Optional
  // quizIds?: string[]; // Optional on client unless needed for direct processing
  // iconUrl?: string; // Optional
  // description?: string; // Optional
}


// Detailed structure for quizzes based on your example
export interface QuizQuestionOptionMongo {
  id: string;
  text: string;
  isCorrect: boolean;
  aiTags?: string[];
}

export interface QuizQuestionMongo {
  id: string; 
  text: string;
  imageUrl?: string;
  marks: number;
  negativeMarks: number;
  explanation?: string;
  aiTags?: string[];
  options: QuizQuestionOptionMongo[];
}

export interface QuizSectionMongo {
  id: string; 
  name: string;
  questions: QuizQuestionMongo[];
}

// Represents the "quizzes" collection structure in MongoDB
export interface QuizDocumentMongo {
  _id: ObjectId;
  title: string;
  testType: 'Mock' | 'Practice' | string; 
  classId?: string | null;
  subjectId?: string | null;
  chapterId?: string | null;
  tags?: string[];
  timerMinutes?: number;
  sections: QuizSectionMongo[];
  status: 'Draft' | 'Published' | string; 
  createdAt: Date;
  updatedAt: Date;
}

// Client-side representation of a Quiz, specifically for dashboard listing
export interface ClientQuiz {
  id: string; // ObjectId of the quiz, converted to string
  title: string;
  iconUrl?: string; // Taken from the parent ExamDocumentMongo
}
