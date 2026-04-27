import { Sidebar } from '@/components/common/sidebar';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-6">
      <aside className="w-64 shrink-0 hidden md:block">
        <Sidebar />
      </aside>
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
