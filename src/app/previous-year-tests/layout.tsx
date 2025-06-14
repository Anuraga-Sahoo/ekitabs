
import DashboardLayoutComponent from '@/components/layouts/DashboardLayoutComponent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Previous Year Tests | TestPrep AI',
  description: 'Access and practice with previous year question papers for various exams.',
};

export default function PreviousYearTestsLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutComponent>{children}</DashboardLayoutComponent>;
}
