import Sidebar from "@/components/mission-control/Sidebar";
import Header from "@/components/mission-control/Header";
import InvestigationWorkspace from "@/components/investigation/InvestigationWorkspace";

export default function InvestigatePage() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-on-surface">
      {/* Fixed Left Navigation Drawer */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-64 flex flex-col flex-1 min-h-screen w-full">
        {/* Fixed Top Mission Bar */}
        <Header />

        {/* Tactical Investigation Workspace */}
        <main className="w-full pt-12 flex-1 flex flex-col bg-background">
          <InvestigationWorkspace />
        </main>
      </div>
    </div>
  );
}
