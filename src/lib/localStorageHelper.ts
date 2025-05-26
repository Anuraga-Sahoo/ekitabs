
import type { TestResultItem } from '@/types';

const HISTORY_KEY = 'testPrepAIHistory';

export function getTestHistory(): TestResultItem[] {
  if (typeof window === 'undefined') return [];
  const historyJson = localStorage.getItem(HISTORY_KEY);
  return historyJson ? JSON.parse(historyJson) : [];
}

export function saveTestResult(result: TestResultItem): void {
  if (typeof window === 'undefined') return;
  const history = getTestHistory();
  history.unshift(result); // Add new result to the beginning
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearTestHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_KEY);
}
