"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="h-8 bg-surface-container-lowest border-t border-outline-variant/40 flex items-center justify-between px-space-md shrink-0 text-label-sm font-label-sm text-[10px] text-on-surface-variant overflow-x-auto whitespace-nowrap">
      <div className="flex items-center gap-space-md">
        <div className="flex items-center gap-1">
          <span className="text-on-surface-variant uppercase text-[9px]">
            MONITORED GLACIERS:
          </span>
          <span className="text-on-surface font-mono font-bold">24 ACTIVE</span>
        </div>
        <span className="text-outline-variant/40">|</span>
        <div className="flex items-center gap-1">
          <span className="text-on-surface-variant uppercase text-[9px]">
            GLACIAL LAKES:
          </span>
          <span className="text-primary font-mono font-bold">41 TRACKED</span>
        </div>
        <span className="text-outline-variant/40">|</span>
        <div className="flex items-center gap-1">
          <span className="text-on-surface-variant uppercase text-[9px]">
            TOTAL AREA COVERED:
          </span>
          <span className="text-on-surface font-mono">1,842 km²</span>
        </div>
        <span className="text-outline-variant/40">|</span>
        <div className="flex items-center gap-1">
          <span className="text-on-surface-variant uppercase text-[9px]">
            SATELLITE PASSES (24H):
          </span>
          <span className="text-secondary font-mono font-bold">18 PASSES</span>
        </div>
        <span className="text-outline-variant/40">|</span>
        <div className="flex items-center gap-1">
          <span className="text-on-surface-variant uppercase text-[9px]">
            ACTIVE RISK ALERTS:
          </span>
          <span className="text-error font-mono font-bold">7</span>
          <span className="text-[9px] text-outline-variant">
            (1 CRIT / 3 WRN / 3 WATCH)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-space-md pl-4">
        <div className="flex items-center gap-1">
          <span className="text-on-surface-variant uppercase text-[9px]">
            LATEST NASA INGEST:
          </span>
          <span className="text-primary font-mono font-semibold">
            29 SEP 2026 11:36Z
          </span>
        </div>
        <span className="text-outline-variant/40">|</span>
        <div className="flex items-center gap-1">
          <span className="text-on-surface-variant uppercase text-[9px]">
            PIPELINE JOBS:
          </span>
          <span className="text-secondary font-mono">4 RUNNING</span>
        </div>
        <span className="text-outline-variant/40">|</span>
        <div className="flex items-center gap-1">
          <span className="text-on-surface-variant uppercase text-[9px]">
            NODE HEALTH:
          </span>
          <span className="text-secondary font-mono font-bold">
            OPTIMAL (100%)
          </span>
        </div>
      </div>
    </footer>
  );
}
