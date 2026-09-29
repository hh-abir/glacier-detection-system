"use client";

import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";

function ShellContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-on-surface">
      {/* Collapsible Left Navigation Drawer */}
      <Sidebar />

      {/* Main Content Area adjusting with sidebar width */}
      <div
        className={`flex flex-col flex-1 min-h-screen w-full transition-all duration-300 ease-in-out ${
          isCollapsed ? "pl-16" : "pl-64"
        }`}
      >
        <Header />
        <main className="w-full pt-12 flex-1 flex flex-col bg-background overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ShellContent>{children}</ShellContent>
    </SidebarProvider>
  );
}
