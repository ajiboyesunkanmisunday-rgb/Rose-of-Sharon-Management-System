import BottomTabBar from "./BottomTabBar";
import TopBar from "./TopBar";

interface AppShellProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  topRight?: React.ReactNode;
  children: React.ReactNode;
  hideTabBar?: boolean;
}

export default function AppShell({
  title,
  subtitle,
  showBack,
  topRight,
  children,
  hideTabBar,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar title={title} subtitle={subtitle} showBack={showBack} right={topRight} />
      <main className="page-in flex-1 px-4 pb-24 pt-4">{children}</main>
      {!hideTabBar && <BottomTabBar />}
    </div>
  );
}
