
import DashboardLayoutComponent from '@/components/layouts/DashboardLayoutComponent';

// Optional: Add metadata if specific to the dashboard section
// export const metadata: Metadata = {
//   title: 'Dashboard | TestPrep AI',
// };

export default function DashboardSectionLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutComponent>{children}</DashboardLayoutComponent>;
}
