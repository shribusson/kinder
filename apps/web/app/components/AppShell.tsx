"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = pathname?.startsWith("/crm");

  if (!showSidebar) {
    return <main className="min-h-screen p-8">{children}</main>;
  }

  return (
    <div className="app-shell flex">
      <Sidebar />
      <main className="flex min-h-screen flex-1 flex-col gap-6 p-8">
        {children}
      </main>
    </div>
  );
}
