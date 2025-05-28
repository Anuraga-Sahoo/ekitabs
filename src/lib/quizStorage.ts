
import type { StoredQuiz, AppQuestion, PracticeTestConfig } from '@/types';

// Key prefix for storing individual quizzes in localStorage
const QUIZ_BANK_PREFIX = 'quizBank_';

/**
 * Simulates saving a generated quiz (questions, type, config) to a "database" (localStorage).
 * In a real application, this would be an API call to a backend connected to MongoDB.
 */
export function saveGeneratedQuiz(quiz: StoredQuiz): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${QUIZ_BANK_PREFIX}${quiz.id}`, JSON.stringify(quiz));
  } catch (error) {
    console.error("Error saving quiz to localStorage:", error);
    // Handle potential storage limit issues
  }
}

/**
 * Simulates retrieving a generated quiz by its ID from the "database" (localStorage).
 * In a real application, this would be an API call.
 */
export function getGeneratedQuiz(id: string): StoredQuiz | null {
  if (typeof window === 'undefined') return null;
  const quizJson = localStorage.getItem(`${QUIZ_BANK_PREFIX}${id}`);
  return quizJson ? JSON.parse(quizJson) : null;
}

/**
 * Generates a unique ID for a new quiz.
 */
export function generateQuizId(testType: 'mock' | 'practice', subject?: string, chapter?: string): string {
  const randomSuffix = Math.random().toString(36).substring(2, 9);
  if (testType === 'mock') {
    return `mock-${Date.now()}-${randomSuffix}`;
  }
  const safeSubject = subject?.replace(/\s+/g, '-') || 'custom';
  const safeChapter = chapter?.replace(/\s+/g, '-') || 'topic';
  return `practice-${safeSubject}-${safeChapter}-${Date.now()}-${randomSuffix}`;
}
