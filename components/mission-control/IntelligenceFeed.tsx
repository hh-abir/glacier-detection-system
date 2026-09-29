"use client";

import React, { useState } from "react";

interface TelemetryLog {
  time: string;
  source: string;
  sourceClass: string;
  text: string;
  highlight?: string;
  isCritical?: boolean;
}

const INITIAL_LOGS: TelemetryLog[] = [
  {
    time: "11:38:12",
    source: "USGS EROS",
    sourceClass: "text-on-surface-variant",
    text: "Landsat-9 L2 Product Ingested",
    highlight: "(P148/R035)",
  },
  {
    time: "11:24:05",
    source: "CV ENGINE",
    sourceClass: "text-secondary",
    text: "Lake segmentation mask generated: Teram Shehr",
    highlight: "[Conf 98.4%]",
  },
  {
    time: "11:15:49",
    source: "PIPELINE",
    sourceClass: "text-tertiary",
    text: "Anomaly score computed:",
    highlight: "+3.42σ above baseline",
  },
  {
    time: "10:48:22",
    source: "RISK EVAL",
    sourceClass: "bg-error text-on-error",
    text: "Rule WRN-2026-0929-B elevated to CRITICAL",
    isCritical: true,
  },
  {
    time: "10:12:00",
    source: "HARMONY",
    sourceClass: "text-primary",
    text: "ICESat-2 ATL06 elevation tracks synced",
    highlight: "(214 pts)",
  },
  {
    time: "09:55:18",
    source: "SAR-CORE",
    sourceClass: "text-on-surface-variant",
    text: "InSAR interferogram phase unwrap complete: Siachen sector",
  },
  {
    time: "09:30:02",
    source: "SEISMIC",
    sourceClass: "text-secondary",
    text: "Cryoseismic station SIA-04 recorded M1.8 basal slip event",
  },
];

export default function IntelligenceFeed() {
  const [logs] = useState<TelemetryLog[]>(INITIAL_LOGS);
  const [dispatched, setDispatched] = useState<boolean>(false);

  return (
    <div className="w-[32%] h-full flex flex-col bg-surface-container-low border-l border-outline-variant/30 overflow-hidden">
      {/* Panel Header */}
      <div className="h-9 bg-surface-container-lowest border-b border-outline-variant/40 px-space-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-primary text-[16px]">
            crisis_alert
          </span>
          <span className="font-headline-md text-[12px] text-on-surface uppercase tracking-wide">
            INTELLIGENCE FEED
          </span>
        </div>
        <div className="flex items-center gap-1 font-label-sm text-[10px]">
          <span className="px-1.5 py-0.5 bg-error-container/30 text-error border border-error/40 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-error inline-block" /> 1 CRIT
          </span>
          <span className="px-1.5 py-0.5 bg-tertiary-container/20 text-tertiary border border-tertiary/40 font-semibold">
            3 WRN
          </span>
          <span className="px-1.5 py-0.5 bg-surface-container-high text-on-surface-variant border border-outline-variant/50">
            3 WATCH
          </span>
        </div>
      </div>

      {/* Scrollable Body: Warnings + Logs */}
      <div className="flex-1 flex flex-col overflow-y-auto divide-y divide-outline-variant/30">
        {/* Section 1: Active Warnings */}
        <div className="p-space-md flex flex-col gap-space-sm bg-surface-container-lowest/50">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-error">
                warning
              </span>
              ACTIVE CRYOSPHERE THREAT VECTORS (4)
            </span>
            <span className="text-on-surface-variant font-label-sm text-[9px]">
              EVAL: REAL-TIME
            </span>
          </div>

          {/* CARD 1: CRITICAL - SIACHEN GLACIER */}
          <div className="bg-surface-container border-l-2 border-l-error border border-outline-variant/40 p-space-sm flex flex-col gap-space-xs transition-colors hover:bg-surface-container-high">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="px-1 py-0.2 bg-error text-on-error font-label-sm text-[9px] font-bold">
                    CRITICAL
                  </span>
                  <span className="font-headline-md text-[12px] text-on-surface">
                    SIACHEN GLACIER (CENTRAL TRUNK)
                  </span>
                </div>
                <span className="text-on-surface-variant font-label-sm text-[10px] mt-0.5">
                  MULTIPLE RISK THRESHOLDS BREACHED
                </span>
              </div>
              <span className="font-label-sm text-[10px] text-error font-mono">
                T -14m
              </span>
            </div>

            {/* Breach metrics */}
            <div className="grid grid-cols-3 gap-1 my-1 bg-surface-container-lowest p-1.5 border border-outline-variant/30 font-label-sm text-[10px]">
              <div>
                <span className="text-on-surface-variant block text-[9px]">
                  MORAINE DISPL
                </span>
                <span className="text-error font-mono font-semibold">
                  +18 cm/yr
                </span>
              </div>
              <div>
                <span className="text-on-surface-variant block text-[9px]">
                  LAKE EXPANSION
                </span>
                <span className="text-error font-mono font-semibold">
                  +42.0% VOL
                </span>
              </div>
              <div>
                <span className="text-on-surface-variant block text-[9px]">
                  ELEV DEFICIT
                </span>
                <span className="text-error font-mono font-semibold">
                  -3.2m (ICESat)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant pt-0.5">
              <span className="text-[10px] text-on-surface-variant/80">
                RECOMMENDED: GLOF &amp; Surge Early Alert Broadcast Level-2
              </span>
              <button
                onClick={() => setDispatched(!dispatched)}
                className={`font-mono text-[10px] flex items-center gap-0.5 transition-colors ${
                  dispatched
                    ? "text-secondary font-bold"
                    : "text-primary hover:underline"
                }`}
              >
                <span>{dispatched ? "DISPATCHED ✓" : "OPEN DISPATCH"}</span>
                <span className="material-symbols-outlined text-[12px]">
                  chevron_right
                </span>
              </button>
            </div>
          </div>

          {/* CARD 2: WARNING - TERAM SHEHR */}
          <div className="bg-surface-container border-l-2 border-l-tertiary-container border border-outline-variant/30 p-space-sm flex flex-col gap-space-xs hover:bg-surface-container-high transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="px-1 py-0.2 bg-tertiary-container text-on-tertiary-container font-label-sm text-[9px] font-bold">
                    WARNING
                  </span>
                  <span className="font-headline-md text-[12px] text-on-surface">
                    TERAM SHEHR TRIBUTARY SURGE
                  </span>
                </div>
                <span className="text-on-surface-variant font-label-sm text-[10px]">
                  Subglacial Reservoir Rapid Expansion Detected
                </span>
              </div>
              <span className="font-label-sm text-[10px] text-tertiary font-mono">
                T -48m
              </span>
            </div>
            <div className="text-body-sm font-body-sm text-[11px] text-on-surface-variant mt-0.5">
              Surface velocity acceleration +112% relative to 2024 SAR coherence
              baseline. Moraine dam structural integrity:{" "}
              <span className="text-tertiary font-mono">MARGINAL (Factor 1.14)</span>.
            </div>
          </div>

          {/* CARD 3: WARNING - SALTORO RIDGE */}
          <div className="bg-surface-container border-l-2 border-l-tertiary-container border border-outline-variant/30 p-space-sm flex flex-col gap-space-xs hover:bg-surface-container-high transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="px-1 py-0.2 bg-tertiary-container text-on-tertiary-container font-label-sm text-[9px] font-bold">
                    WARNING
                  </span>
                  <span className="font-headline-md text-[12px] text-on-surface">
                    SALTORO RIDGE SERAC WALL
                  </span>
                </div>
                <span className="text-on-surface-variant font-label-sm text-[10px]">
                  Hanging Ice Cleavage &amp; Crevasse Spreading
                </span>
              </div>
              <span className="font-label-sm text-[10px] text-on-surface-variant font-mono">
                T -1h 22m
              </span>
            </div>
            <div className="text-body-sm font-body-sm text-[11px] text-on-surface-variant">
              Sentinel-1 DInSAR interferometry indicates 420,000 m³ hanging serac detachment risk
              above Siachen middle trunk supply route.
            </div>
          </div>

          {/* CARD 4: WATCH - CHONG KUMDAN */}
          <div className="bg-surface-container border-l-2 border-l-outline border border-outline-variant/30 p-space-sm flex flex-col gap-space-xs hover:bg-surface-container-high transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5">
                <span className="px-1 py-0.2 bg-surface-container-highest text-on-surface font-label-sm text-[9px] font-medium">
                  WATCH
                </span>
                <span className="font-headline-md text-[12px] text-on-surface">
                  CHONG KUMDAN SHYOK ICE DAM
                </span>
              </div>
              <span className="font-label-sm text-[10px] text-on-surface-variant font-mono">
                T -3h 10m
              </span>
            </div>
            <div className="text-body-sm font-body-sm text-[11px] text-on-surface-variant">
              Surge snout advance rate monitored at +1.4m/week. Subglacial
              drainage channel pressure sensors stable.
            </div>
          </div>
        </div>

        {/* SECTION 2: TELEMETRY LOG STREAM */}
        <div className="flex-1 p-space-md flex flex-col gap-space-sm bg-surface-container-low min-h-0">
          <div className="flex items-center justify-between shrink-0">
            <span className="font-label-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-primary">
                dynamic_feed
              </span>
              TELEMETRY & PIPELINE LOG STREAM
            </span>
            <span className="text-secondary font-label-sm text-[9px] font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
              STREAMING
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1 font-label-sm text-[10px]">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`p-1 flex items-start gap-2 border ${
                  log.isCritical
                    ? "bg-error-container/10 border-error/30"
                    : "bg-surface-container-lowest border-outline-variant/20"
                }`}
              >
                <span
                  className={`font-mono shrink-0 ${
                    log.isCritical ? "text-error" : "text-primary"
                  }`}
                >
                  {log.time}
                </span>
                <span
                  className={`px-1 py-0.2 text-[9px] font-mono shrink-0 ${
                    log.sourceClass.includes("bg-")
                      ? log.sourceClass
                      : `bg-surface-container-high ${log.sourceClass}`
                  }`}
                >
                  {log.source}
                </span>
                <div
                  className={`truncate ${
                    log.isCritical ? "text-error font-semibold" : "text-on-surface"
                  }`}
                >
                  {log.text}{" "}
                  {log.highlight && (
                    <span
                      className={`font-mono ${
                        log.isCritical
                          ? "text-error"
                          : log.source === "CV ENGINE"
                          ? "text-secondary"
                          : log.source === "PIPELINE"
                          ? "text-error"
                          : "text-outline-variant"
                      }`}
                    >
                      {log.highlight}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
