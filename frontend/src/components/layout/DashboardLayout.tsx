import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <TopNav />
      <main className="ml-[322px] mt-16 min-h-[calc(100vh-64px)] bg-white p-6">
        {children}
      </main>
    </div>
  );
}
