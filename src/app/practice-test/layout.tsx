
import DashboardLayoutComponent from '@/components/layouts/DashboardLayoutComponent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Practice Test | TestPrep AI',
  description: 'Create and take personalized AI-generated practice tests.',
};

export default function PracticeTestPageLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutComponent>{children}</DashboardLayoutComponent>;
}
