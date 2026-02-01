import Sidebar from "../components/Sidebar";

export default function CrmLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell flex">
      <Sidebar />
      <main className="flex min-h-screen flex-1 flex-col gap-6 p-8">
        {children}
      </main>
    </div>
  );
}
