
import DashboardLayoutComponent from '@/components/layouts/DashboardLayoutComponent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Powered Tests | TestPrep AI',
  description: 'Explore AI-driven mock tests and personalized practice sessions.',
};

export default function AiTestsLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutComponent>{children}</DashboardLayoutComponent>;
}
