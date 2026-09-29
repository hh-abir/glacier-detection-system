import { Metadata } from "next";
import CleanDashboardWorkspace from "@/components/dashboard/CleanDashboardWorkspace";

export const metadata: Metadata = {
  title: "Surveillance Hub & Clean Dashboard | Glacier Monitor EO",
  description:
    "Executive surveillance dashboard and high-resolution Earth Observation telemetry for Siachen Glacier & Eastern Karakoram.",
};

export default function DashboardPage() {
  return <CleanDashboardWorkspace />;
}
