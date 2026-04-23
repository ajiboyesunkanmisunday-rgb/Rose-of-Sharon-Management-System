import LayoutClient from "./LayoutClient";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <LayoutClient>{children}</LayoutClient>;
}
