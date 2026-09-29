"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";

interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: string;
  badgeClass?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", icon: "dashboard", href: "/" },
  { id: "investigate", label: "Investigate", icon: "explore", href: "/investigate" },
  { id: "glof-modeling", label: "GLOF Modeling", icon: "schema", href: "/glof-modeling" },
  { id: "glaciers", label: "Glaciers & Lakes", icon: "terrain", href: "/investigate" },
  { id: "observations", label: "Observations", icon: "satellite_alt", href: "/#observations" },
  {
    id: "alerts-and-events",
    label: "Alerts & Events",
    icon: "crisis_alert",
    href: "/glof-modeling",
    badge: "1 CRIT",
    badgeClass: "bg-error/20 text-error border border-error/40 font-semibold",
  },
  { id: "time-series", label: "Time Series", icon: "stacked_line_chart", href: "/#time-series" },
  { id: "pipeline-jobs", label: "Pipeline Jobs", icon: "sync_alt", href: "/#pipeline" },
  { id: "data-sources", label: "Data Sources", icon: "dataset", href: "/#data-sources" },
  { id: "briefings", label: "Briefings", icon: "summarize", href: "/#briefings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-surface-container-lowest border-r border-outline-variant/40 z-50 flex flex-col justify-between select-none transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex flex-col">
        {/* Header Branding & Collapse Toggle */}
        <div
          className={`h-12 border-b border-outline-variant/30 flex items-center bg-surface-container-low transition-all ${
            isCollapsed ? "justify-center px-2" : "justify-between px-space-md"
          }`}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-space-sm overflow-hidden whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shrink-0" />
              <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface font-semibold truncate">
                MISSION CONTROL
              </span>
            </div>
          )}

          {isCollapsed && (
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
          )}

          <button
            onClick={toggleSidebar}
            className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isCollapsed ? "menu" : "menu_open"}
            </span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col py-space-sm gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : item.href === "/investigate"
                ? pathname === "/investigate"
                : item.href === "/glof-modeling"
                ? pathname === "/glof-modeling"
                : false;

            return (
              <div key={item.id} className="relative group">
                <Link
                  href={item.href}
                  className={`flex items-center transition-colors font-label-md text-[11px] ${
                    isCollapsed
                      ? "justify-center h-10 px-0 mx-2 rounded-lg"
                      : "justify-between px-space-md py-space-sm"
                  } ${
                    isActive
                      ? isCollapsed
                        ? "bg-surface-container-high text-primary ring-1 ring-primary/40 font-semibold"
                        : "bg-surface-container-high text-primary border-l-2 border-primary font-medium"
                      : isCollapsed
                      ? "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface border-l-2 border-transparent"
                  }`}
                >
                  <div
                    className={`flex items-center ${
                      isCollapsed ? "justify-center" : "gap-space-md"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px]">
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="whitespace-nowrap">{item.label}</span>
                    )}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span
                      className={`font-label-sm text-[9px] px-1 py-0.2 rounded font-mono ${
                        item.badgeClass || ""
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>

                {/* Hover Tooltip when Collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-surface-container-high border border-outline-variant/60 text-on-surface text-[11px] font-label-md rounded shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    <div className="flex items-center gap-1.5">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] text-error font-mono font-bold">
                          [{item.badge}]
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* System Health & Settings */}
      <div className="border-t border-outline-variant/30 bg-surface-container-lowest flex flex-col gap-space-sm">
        {!isCollapsed ? (
          <div className="p-space-md flex flex-col gap-space-sm">
            <div className="bg-surface-container-low border border-outline-variant/30 p-space-sm flex flex-col gap-space-xs rounded">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-[10px] text-on-surface-variant">
                  SYSTEM HEALTH
                </span>
                <span className="font-label-sm text-[10px] text-secondary font-semibold">
                  99.8%
                </span>
              </div>
              <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                <div className="bg-secondary h-1 w-[99.8%]" />
              </div>
              <span className="font-label-sm text-[9px] text-on-surface-variant/80 truncate">
                NASA Earthdata, ICESat-2, Landsat-9 ONLINE
              </span>
            </div>

            <div className="flex flex-col gap-space-xs pt-space-xs">
              <button className="flex items-center gap-space-sm px-space-xs py-1 text-on-surface-variant hover:text-on-surface font-label-sm text-[10px] transition-colors text-left">
                <span className="material-symbols-outlined text-[14px]">
                  settings
                </span>
                <span>Settings &amp; Config</span>
              </button>
              <button className="flex items-center gap-space-sm px-space-xs py-1 text-on-surface-variant hover:text-on-surface font-label-sm text-[10px] transition-colors text-left">
                <span className="material-symbols-outlined text-[14px]">
                  description
                </span>
                <span>Quick Documentation / Schema</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-3 flex flex-col items-center gap-2">
            <div
              className="relative group cursor-pointer p-1.5 rounded hover:bg-surface-container"
              title="System Health: 99.8% Online"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-secondary block animate-pulse" />
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-0.5 bg-surface-container-high border border-outline-variant/60 text-secondary text-[10px] font-mono rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                HEALTH: 99.8% ONLINE
              </div>
            </div>

            <button
              className="p-2 text-outline hover:text-on-surface hover:bg-surface-container-high rounded transition-colors"
              title="Settings"
            >
              <span className="material-symbols-outlined text-[17px]">
                settings
              </span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
