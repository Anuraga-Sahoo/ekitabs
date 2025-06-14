
import DashboardLayoutComponent from '@/components/layouts/DashboardLayoutComponent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Test History | TestPrep AI',
  description: 'Review your past test performances and results.',
};

export default function TestHistoryLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutComponent>{children}</DashboardLayoutComponent>;
}
