import Sidebar from "@/components/mission-control/Sidebar";
import Header from "@/components/mission-control/Header";
import SubHeader from "@/components/mission-control/SubHeader";
import MapWorkspace from "@/components/mission-control/MapWorkspace";
import IntelligenceFeed from "@/components/mission-control/IntelligenceFeed";
import Footer from "@/components/mission-control/Footer";

export default function Home() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-on-surface">
      {/* Fixed Left Navigation Drawer */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-64 flex flex-col flex-1 min-h-screen w-full">
        {/* Fixed Top Mission Bar */}
        <Header />

        {/* Tactical Earth Observation Viewport */}
        <main className="w-full pt-12 flex-1 flex flex-col bg-background">
          <div className="flex flex-col w-full h-[calc(100vh-3rem)] overflow-hidden bg-background font-body-md text-on-surface select-none">
            {/* Quick Status Bar */}
            <SubHeader />

            {/* Split Workspace: Map (68%) / Intelligence Feed (32%) */}
            <div className="flex-1 flex w-full min-h-0 relative">
              <MapWorkspace />
              <IntelligenceFeed />
            </div>

            {/* Global Telemetry Footer */}
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}
