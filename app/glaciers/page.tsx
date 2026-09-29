import GlaciersExplorerWorkspace from "@/components/glaciers/GlaciersExplorerWorkspace";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glaciers & Lakes Catalog | Siachen Earth Observation",
  description: "Comprehensive registry of glaciological assets, moraine dammed lakes, and velocity vectors in the Eastern Karakoram.",
};

export default function GlaciersPage() {
  return <GlaciersExplorerWorkspace />;
}
