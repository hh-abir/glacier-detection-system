"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", icon: "dashboard", href: "/" },
  { id: "investigate", label: "Investigate", icon: "explore", href: "/investigate" },
  { id: "glaciers", label: "Glaciers", icon: "terrain", href: "/#glaciers" },
  { id: "observations", label: "Observations", icon: "satellite_alt", href: "/#observations" },
  { id: "alerts-and-events", label: "Alerts & Events", icon: "crisis_alert", href: "/#alerts" },
  { id: "risk-analysis", label: "Risk Analysis", icon: "schema", href: "/#risk" },
  { id: "time-series", label: "Time Series", icon: "stacked_line_chart", href: "/#time-series" },
  { id: "pipeline-jobs", label: "Pipeline Jobs", icon: "sync_alt", href: "/#pipeline" },
  { id: "data-sources", label: "Data Sources", icon: "dataset", href: "/#data-sources" },
  { id: "briefings", label: "Briefings", icon: "summarize", href: "/#briefings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-outline-variant/40 z-50 flex flex-col justify-between select-none">
      <div className="flex flex-col">
        {/* Header Branding */}
        <div className="h-12 border-b border-outline-variant/30 px-space-md flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-space-sm">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface font-semibold">
              MISSION CONTROL
            </span>
          </div>
          <span className="font-label-sm text-[10px] px-space-xs py-0.5 bg-surface-container-highest border border-outline-variant/60 text-secondary-fixed-dim">
            SECURE NODE
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col py-space-sm">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : item.href === "/investigate"
                ? pathname === "/investigate"
                : false;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-space-md px-space-md py-space-sm transition-colors text-left font-label-md text-[11px] ${
                  isActive
                    ? "bg-surface-container-high text-primary border-l-2 border-primary font-medium"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface border-l-2 border-transparent"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Health & Settings */}
      <div className="border-t border-outline-variant/30 bg-surface-container-lowest p-space-md flex flex-col gap-space-sm">
        <div className="bg-surface-container-low border border-outline-variant/30 p-space-sm flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[10px] text-on-surface-variant">
              SYSTEM HEALTH
            </span>
            <span className="font-label-sm text-[10px] text-secondary font-semibold">
              99.8%
            </span>
          </div>
          <div className="w-full bg-surface-container-highest h-1">
            <div className="bg-secondary h-1 w-[99.8%]" />
          </div>
          <span className="font-label-sm text-[9px] text-on-surface-variant/80 truncate">
            NASA Earthdata, ICESat-2, Landsat-9 ONLINE
          </span>
        </div>

        <div className="flex flex-col gap-space-xs pt-space-xs">
          <button className="flex items-center gap-space-sm px-space-xs py-1 text-on-surface-variant hover:text-on-surface font-label-sm text-[10px] transition-colors text-left">
            <span className="material-symbols-outlined text-[14px]">settings</span>
            <span>Settings & Config</span>
          </button>
          <button className="flex items-center gap-space-sm px-space-xs py-1 text-on-surface-variant hover:text-on-surface font-label-sm text-[10px] transition-colors text-left">
            <span className="material-symbols-outlined text-[14px]">
              description
            </span>
            <span>Quick Documentation / Schema</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
