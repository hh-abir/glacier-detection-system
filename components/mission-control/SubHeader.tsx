"use client";

import React, { useEffect, useState } from "react";

export default function SubHeader() {
  const [countdown, setCountdown] = useState(1459); // seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `T-${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="h-7 w-full bg-surface-container-lowest border-b border-outline-variant/30 flex items-center justify-between px-space-md shrink-0 text-label-sm font-label-sm text-[10px]">
      <div className="flex items-center gap-space-md">
        <span className="flex items-center gap-space-xs text-primary">
          <span className="w-1.5 h-1.5 bg-primary rounded-none animate-ping" />
          <span>WORKSPACE: SIACHEN_KARAKORAM_SECTOR_01</span>
        </span>
        <span className="text-outline-variant/60">/</span>
        <span className="text-on-surface-variant font-mono">
          UTM ZONE 43N [EPSG:32643]
        </span>
        <span className="text-outline-variant/60">/</span>
        <span className="text-secondary flex items-center gap-1 font-mono">
          <span className="w-1.5 h-1.5 bg-secondary inline-block" />
          InSAR COHERENCE: OPTIMAL (γ 0.89)
        </span>
        <span className="text-outline-variant/60 hidden md:inline">/</span>
        <span className="text-primary font-mono hidden md:inline">
          INDIRA COL TO NUBRA RIVERBED (76 KM TRANSECT)
        </span>
      </div>

      <div className="flex items-center gap-space-lg">
        <div className="flex items-center gap-space-xs">
          <span className="text-on-surface-variant uppercase">PASS WINDOW:</span>
          <span className="text-on-surface font-mono">
            SENTINEL-1B {formatCountdown(countdown)}
          </span>
        </div>
        <div className="flex items-center gap-space-xs bg-surface-container-high px-space-xs py-0.5 border border-outline-variant/40">
          <span className="text-tertiary">KARAKORAM ANOMALY ENGINE:</span>
          <span className="text-tertiary font-bold">MONITORING</span>
        </div>
      </div>
    </div>
  );
}
