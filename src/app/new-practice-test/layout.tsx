
import DashboardLayoutComponent from '@/components/layouts/DashboardLayoutComponent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Practice Test | TestPrep AI',
  description: 'Create a new targeted practice test session.',
};

export default function NewPracticeTestLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutComponent>{children}</DashboardLayoutComponent>;
}
