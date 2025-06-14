
import DashboardLayoutComponent from '@/components/layouts/DashboardLayoutComponent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Mock Test | TestPrep AI',
  description: 'Take an AI-generated mock test simulating real exam conditions.',
};

export default function MockTestPageLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutComponent>{children}</DashboardLayoutComponent>;
}
