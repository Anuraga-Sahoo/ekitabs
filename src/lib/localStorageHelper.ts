
import type { TestResultItem } from '@/types';

const HISTORY_KEY = 'testPrepAIHistory_v2'; // Changed key to avoid conflict with old structure

export function getTestHistory(): TestResultItem[] {
  if (typeof window === 'undefined') return [];
  const historyJson = localStorage.getItem(HISTORY_KEY);
  if (historyJson) {
    try {
      const parsedHistory = JSON.parse(historyJson) as TestResultItem[];
      // Sort by dateCompleted descending to ensure newest are first
      return parsedHistory.sort((a, b) => new Date(b.dateCompleted).getTime() - new Date(a.dateCompleted).getTime());
    } catch (e) {
      console.error("Error parsing test history from localStorage:", e);
      localStorage.removeItem(HISTORY_KEY); // Clear corrupted data
      return [];
    }
  }
  return [];
}

export function saveTestResult(result: TestResultItem): void {
  if (typeof window === 'undefined') return;
  const history = getTestHistory();
  history.unshift(result); // Add new result to the beginning
  // Optional: Limit history size if needed, e.g., history.slice(0, 50)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function deleteTestResult(testAttemptId: string): void {
  if (typeof window === 'undefined') return;
  let history = getTestHistory();
  history = history.filter(item => item.testAttemptId !== testAttemptId);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearTestHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_KEY);
}
