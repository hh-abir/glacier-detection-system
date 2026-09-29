import SubHeader from "@/components/mission-control/SubHeader";
import MapWorkspace from "@/components/mission-control/MapWorkspace";
import IntelligenceFeed from "@/components/mission-control/IntelligenceFeed";
import Footer from "@/components/mission-control/Footer";

export default function Home() {
  return (
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
  );
}
