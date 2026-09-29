"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSidebar } from "@/context/SidebarContext";

export default function Header() {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [utcTime, setUtcTime] = useState("UTC 11:42:08");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(`UTC ${now.toISOString().substring(11, 19)}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 h-13 bg-slate-950/90 border-b border-slate-800/80 z-40 px-5 flex items-center justify-between gap-4 backdrop-blur-md transition-all duration-300 ease-in-out ${
        isCollapsed ? "left-16" : "left-64"
      }`}
    >
      {/* Brand & Sector */}
      <div className="flex items-center gap-4 shrink-0">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors md:hidden"
          title="Toggle Sidebar"
        >
          <span className="material-symbols-outlined text-[18px]">menu</span>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-sky-950/40 border border-sky-500/30">
            <Image
              src="/images/glacier-logo.png"
              alt="Glacier Monitor Logo"
              width={26}
              height={26}
              className="w-6 h-6 object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-sm tracking-tight text-white">
                Glacier Monitor
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
                v2.8 EO
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal">
              Earth Observation &amp; Cryosphere Analytics
            </span>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-800 hidden sm:block" />

        {/* Region Selector focused on Siachen */}
        <button className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-all hover:bg-slate-800/40">
          <span className="material-symbols-outlined text-[15px] text-sky-400">landscape</span>
          <span className="font-medium text-[11px]">Siachen Basin</span>
          <span className="text-[10px] font-mono text-emerald-400 font-normal">35.42° N, 77.10° E</span>
          <span className="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
        </button>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-[16px] text-slate-400">
            search
          </span>
          <input
            type="text"
            placeholder="Search glaciers, melt basins, elevation profiles or observations..."
            className="w-full h-8 pl-9 pr-12 rounded-lg bg-slate-900/80 border border-slate-800 focus:border-sky-500/70 focus:ring-1 focus:ring-sky-500/40 text-xs text-slate-200 placeholder:text-slate-500 transition-all font-sans"
          />
          <kbd className="absolute right-2.5 px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-[10px] font-mono text-slate-400">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls & Status Indicators */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Sync Status Pill */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-slate-300 font-medium text-[11px]">NASA Harmony</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 text-[10px]">Synced 2m ago</span>
        </div>

        {/* Environmental Advisory Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
          <span className="material-symbols-outlined text-[15px] text-rose-400">crisis_alert</span>
          <span className="text-[11px]">1 High Advisory</span>
        </div>

        {/* UTC Clock */}
        <div className="hidden 2xl:flex items-center px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[10px] font-mono text-slate-300">
          <span>{utcTime}</span>
        </div>

        <div className="h-5 w-px bg-slate-800 hidden sm:block" />

        {/* Operator Profile */}
        <div className="flex items-center gap-2 pl-1 cursor-pointer">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white text-[11px] font-semibold shadow-sm">
            SC
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-medium text-slate-200 leading-tight">Dr. S. Chen</span>
            <span className="text-[10px] text-slate-400 leading-tight">Cryo Analyst</span>
          </div>
        </div>
      </div>
    </header>
  );
}
