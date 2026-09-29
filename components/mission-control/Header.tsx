"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSidebar } from "@/context/SidebarContext";

export default function Header() {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [utcTime, setUtcTime] = useState("UTC 2026-09-29 11:42:08Z");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const zulu = `UTC ${now.toISOString().replace("T", " ").substring(0, 19)}Z`;
      setUtcTime(zulu);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 h-12 bg-surface-container-low/95 border-b border-outline-variant/40 z-40 px-space-md flex items-center justify-between gap-space-md backdrop-blur-sm transition-all duration-300 ease-in-out ${
        isCollapsed ? "left-16" : "left-64"
      }`}
    >
      {/* Brand & Sector */}
      <div className="flex items-center gap-space-md shrink-0">
        <div className="flex items-center gap-space-sm">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors md:hidden"
            title="Toggle Sidebar"
          >
            <span className="material-symbols-outlined text-[18px]">menu</span>
          </button>

          <div className="relative h-8 w-8 shrink-0">
            <Image
              src="/images/glacier-logo.png"
              alt="Glacier Monitor Logo"
              width={32}
              height={32}
              className="h-8 w-auto object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-md text-[13px] tracking-wider uppercase text-on-surface font-bold">
                GLACIER MONITOR
              </span>
              <span className="font-label-sm text-[9px] text-primary px-1 bg-surface-container-high border border-outline-variant/50">
                v2.8-EO
              </span>
            </div>
            <span className="font-label-sm text-[9px] text-on-surface-variant uppercase tracking-tight">
              SIACHEN KARAKORAM CRYOSPHERE RADAR
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-outline-variant/50 hidden sm:block" />

        {/* Region Selector focused on Siachen */}
        <button className="hidden sm:flex items-center gap-space-xs px-space-sm py-1 bg-surface-container border border-outline-variant/50 hover:bg-surface-container-high transition-colors">
          <span className="font-label-sm text-[10px] text-on-surface-variant">
            REGION:
          </span>
          <span className="font-label-sm text-[10px] text-on-surface font-semibold">
            KARAKORAM / SIACHEN GLACIER
          </span>
          <span className="font-label-sm text-[10px] text-secondary">
            [35.42° N, 77.10° E]
          </span>
          <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
            arrow_drop_down
          </span>
        </button>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-xl mx-space-md hidden md:block">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-2 text-[15px] text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            placeholder="[ / ] Search Siachen trunk, Saltoro ridge, Bilafond La, Teram Shehr, crevasses..."
            className="w-full h-7 pl-7 pr-16 bg-surface-container-lowest border border-outline-variant/60 text-on-surface font-label-md text-[11px] placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary-container transition-colors"
          />
          <span className="absolute right-2 font-label-sm text-[9px] text-on-surface-variant/70 bg-surface-container border border-outline-variant/40 px-1">
            CMD+K
          </span>
        </div>
      </div>

      {/* Live Status Indicators */}
      <div className="flex items-center gap-space-sm shrink-0">
        <div className="hidden xl:flex items-center gap-space-sm border border-outline-variant/40 bg-surface-container-lowest px-space-sm py-0.5">
          <span className="font-label-sm text-[10px] text-on-surface-variant">
            SAR PASS:
          </span>
          <span className="font-label-sm text-[10px] text-secondary font-semibold">
            SENTINEL-1B (LIVE COHERENCE)
          </span>
          <span className="text-outline-variant">|</span>
          <span className="font-label-sm text-[10px] text-on-surface-variant">
            96ms
          </span>
          <span className="text-outline-variant">|</span>
          <span className="font-label-sm text-[10px] text-primary font-semibold">
            TERRAIN RADAR: ACTIVE
          </span>
        </div>

        <div className="flex items-center gap-space-xs px-space-sm py-0.5 bg-error-container/20 border border-error/40 text-error">
          <span className="material-symbols-outlined text-[13px] animate-pulse">
            warning
          </span>
          <span className="font-label-sm text-[10px] font-semibold">
            ALERTS: 5 (2 HIGH, 3 ADVISORY)
          </span>
        </div>

        <div className="hidden 2xl:flex items-center gap-space-xs border border-outline-variant/40 bg-surface-container-lowest px-space-sm py-0.5">
          <span className="font-label-sm text-[10px] text-on-surface-variant">
            ZULU:
          </span>
          <span className="font-label-sm text-[10px] text-primary font-mono">
            {utcTime}
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-space-xs border border-outline-variant/40 bg-surface-container-lowest px-space-sm py-0.5">
          <span className="font-label-sm text-[10px] text-on-surface">
            OP: KARAKORAM OBSERVATORY
          </span>
        </div>

        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:opacity-90">
          <span className="material-symbols-outlined text-on-primary text-[18px]">
            person
          </span>
        </div>
      </div>
    </header>
  );
}
