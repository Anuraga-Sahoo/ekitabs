
import DashboardLayoutComponent from '@/components/layouts/DashboardLayoutComponent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Mock Test | TestPrep AI',
  description: 'Start a new mock test to simulate exam conditions.',
};

export default function NewMockTestLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutComponent>{children}</DashboardLayoutComponent>;
}
