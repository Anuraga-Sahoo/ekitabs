
/**
 * Generates a unique ID for a new quiz.
 * This function is client-safe and can be imported directly by client components.
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
