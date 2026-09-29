import ObservationsWorkspace from "@/components/observations/ObservationsWorkspace";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Earth Observations & Satellite Scene Catalog | Siachen",
  description: "Browse, inspect, and analyze multi-temporal SAR, optical, and laser altimetry satellite scenes over the Siachen Glacier and Eastern Karakoram.",
};

export default function ObservationsPage() {
  return <ObservationsWorkspace />;
}
