"use client";

import React, { useState, useRef } from "react";

interface SettlementNode {
  id: string;
  name: string;
  arrival: string;
  peakDepth: string;
  velocity: string;
  infra: string;
  evacPct: number;
  status: "critical" | "warning" | "advisory";
  x: number;
  y: number;
}

const SETTLEMENTS: SettlementNode[] = [
  {
    id: "breach",
    name: "Imja Tsho Breach Point",
    arrival: "T+0",
    peakDepth: "18.5 m",
    velocity: "12.4 m/s",
    infra: "Terminal Moraine Dam Collapsed",
    evacPct: 100,
    status: "critical",
    x: 680,
    y: 60,
  },
  {
    id: "dingboche",
    name: "Dingboche Settlement",
    arrival: "T+18 min",
    peakDepth: "12.4 m",
    velocity: "8.2 m/s",
    infra: "2 Bridges Lost, 14 Lodges Flood Risk",
    evacPct: 88,
    status: "critical",
    x: 510,
    y: 150,
  },
  {
    id: "pangboche",
    name: "Pangboche Gompa Rim",
    arrival: "T+42 min",
    peakDepth: "9.1 m",
    velocity: "6.8 m/s",
    infra: "Lower Trail Severed, Gompa Safe",
    evacPct: 62,
    status: "warning",
    x: 410,
    y: 240,
  },
  {
    id: "phakding",
    name: "Phakding Chasm",
    arrival: "T+1h 15m",
    peakDepth: "5.8 m",
    velocity: "5.4 m/s",
    infra: "Main Suspension Bridge High Stress",
    evacPct: 74,
    status: "advisory",
    x: 290,
    y: 320,
  },
  {
    id: "lukla",
    name: "Lukla Ghat Riverbed",
    arrival: "T+1h 50m",
    peakDepth: "4.2 m",
    velocity: "4.1 m/s",
    infra: "Hydro Intake Shut, Runways Unaffected",
    evacPct: 95,
    status: "advisory",
    x: 160,
    y: 390,
  },
];

export default function GlofModelingWorkspace() {
  const mapRef = useRef<HTMLDivElement>(null);

  // Map Pan & Zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Map Layers
  const [showInundation, setShowInundation] = useState<boolean>(true);
  const [showVelocity, setShowVelocity] = useState<boolean>(true);
  const [showSediment, setShowSediment] = useState<boolean>(false);
  const [showEvacRoutes, setShowEvacRoutes] = useState<boolean>(true);

  // Selected Settlement
  const [selectedNode, setSelectedNode] = useState<SettlementNode>(SETTLEMENTS[1]);

  // Simulation Param Sliders
  const [breachWidth, setBreachWidth] = useState<number>(85.4);
  const [impulseWave, setImpulseWave] = useState<number>(14.6);
  const [reservoirStorage, setReservoirStorage] = useState<number>(78.2);

  // Monte Carlo state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simCount, setSimCount] = useState<number>(500);

  // Dissemination Channel Toggles
  const [sirensActive, setSirensActive] = useState<boolean>(true);
  const [gsmPushActive, setGsmPushActive] = useState<boolean>(true);
  const [respondersActive, setRespondersActive] = useState<boolean>(true);

  // Broadcast confirmation state
  const [broadcastTriggered, setBroadcastTriggered] = useState<boolean>(false);

  // Dynamic peak discharge calculation based on breach width and reservoir storage
  const calculatedPeakQ = Math.round(
    (breachWidth / 85.4) * (reservoirStorage / 78.2) * (impulseWave / 14.6) * 15400
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.87;
    setZoom((prev) => Math.min(Math.max(prev * factor, 0.75), 3.5));
  };

  const runMonteCarlo = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setSimCount((prev) => prev + 500);
      setIsSimulating(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-3rem)] overflow-hidden text-on-surface bg-background select-none">
      {/* 1. TOP CONTEXT HUD & MISSION STRIP */}
      <section className="shrink-0 px-6 py-3 bg-surface-container-low border-b border-outline-variant/30 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 shadow-md z-20">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5 bg-error-container/30 border border-error/50 px-3 py-1 rounded-lg shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping" />
            <span className="font-label-md text-[11px] text-error tracking-wider uppercase font-bold">
              STAGE 4 CRITICAL DISPATCH
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-[15px] text-on-surface tracking-tight font-semibold">
                Imja Tsho (Lake GL-2798-02)
              </span>
              <span className="font-label-sm text-[10px] uppercase px-2 py-0.5 rounded bg-surface-container text-primary font-medium border border-outline-variant/40">
                Khumbu Himal
              </span>
            </div>
            <div className="font-body-sm text-[11px] text-outline flex items-center gap-2 mt-0.5">
              <span>Lat: 27.902° N, Long: 86.927° E</span>
              <span>•</span>
              <span>Elevation: 5,010m a.s.l.</span>
              <span>•</span>
              <span className="font-mono text-tertiary">
                Model: HEC-RAS 2D + RAMMS v4.2
              </span>
            </div>
          </div>

          <div className="hidden 2xl:flex items-center gap-2 pl-4 border-l border-outline-variant/30">
            <div className="px-2.5 py-1 rounded bg-surface-container font-label-sm text-[10px] text-on-surface-variant border border-outline-variant/30">
              Trigger:{" "}
              <span className="text-tertiary font-medium">
                500,000 m³ Hanging Ice Detachment
              </span>
            </div>
            <div className="px-2.5 py-1 rounded bg-surface-container font-label-sm text-[10px] text-on-surface-variant border border-outline-variant/30">
              Sim ID:{" "}
              <span className="text-primary font-mono font-semibold">
                SIM-2026-0929-H3
              </span>
            </div>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-2.5 self-end xl:self-auto shrink-0">
          <button
            onClick={runMonteCarlo}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-label-md border border-outline-variant/40 transition-all shadow-sm active:scale-95"
          >
            <span
              className={`material-symbols-outlined text-[16px] text-primary ${
                isSimulating ? "animate-spin" : ""
              }`}
            >
              casino
            </span>
            <span>
              {isSimulating ? "Simulating..." : `Run Monte Carlo (N=${simCount})`}
            </span>
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-label-md border border-outline-variant/40 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[16px] text-tertiary">
              description
            </span>
            <span>Civil Defense SITREP</span>
          </button>

          <button
            onClick={() => setBroadcastTriggered(!broadcastTriggered)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-label-md text-[11px] font-semibold shadow-md transition-all ${
              broadcastTriggered
                ? "bg-secondary text-on-secondary"
                : "bg-error hover:bg-error-container text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">
              cell_tower
            </span>
            <span>
              {broadcastTriggered ? "BROADCAST TRANSMITTED ✓" : "Broadcast Console (Live)"}
            </span>
          </button>
        </div>
      </section>

      {/* 2. THREE-PANEL BENTO WORKSPACE */}
      <div className="flex-1 flex overflow-hidden p-3 gap-3">
        {/* LEFT PANEL: Breach Dynamics & Hydrographic Telemetry */}
        <aside className="w-[340px] 2xl:w-[380px] shrink-0 flex flex-col gap-3 overflow-y-auto pr-1">
          {/* Moraine Stability Block */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  landslide
                </span>
                <span className="font-label-md text-[11px] uppercase tracking-wider text-on-surface font-semibold">
                  Moraine Dam Integrity
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-error-container/40 text-error font-label-sm text-[10px] font-semibold border border-error/40">
                Overtopping Imm.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex flex-col">
                <span className="font-label-sm text-[9px] text-outline uppercase">
                  Freeboard Deficit
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-[20px] font-mono text-error font-bold">
                    -2.85
                  </span>
                  <span className="font-body-sm text-[11px] text-outline">m</span>
                </div>
                <span className="font-label-sm text-[9px] text-error/90 mt-1 flex items-center gap-1 font-mono">
                  <span className="material-symbols-outlined text-[12px]">
                    trending_down
                  </span>{" "}
                  -0.42 m/hr
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex flex-col">
                <span className="font-label-sm text-[9px] text-outline uppercase">
                  Seepage Velocity
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-[20px] font-mono text-tertiary font-bold">
                    14.2
                  </span>
                  <span className="font-body-sm text-[11px] text-outline">cm/h</span>
                </div>
                <span className="font-label-sm text-[9px] text-tertiary mt-1 flex items-center gap-1 font-mono">
                  <span className="material-symbols-outlined text-[12px]">
                    warning
                  </span>{" "}
                  Piping Prob 91%
                </span>
              </div>
            </div>

            {/* Hydrostatic Pore Pressure Gauge */}
            <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-label-sm text-[10px]">
                <span className="text-outline uppercase">Internal Core Pore Pressure</span>
                <span className="font-mono text-error font-semibold">
                  418 kPa (Crit: 380)
                </span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div
                  className="bg-error h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                  style={{ width: "88%" }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-outline">
                <span>Nominal: 120 kPa</span>
                <span>Trigger Threshold: 380 kPa</span>
              </div>
            </div>
          </div>

          {/* Hydrograph Chart Module */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  water
                </span>
                <span className="font-label-md text-[11px] uppercase tracking-wider text-on-surface font-semibold">
                  Breach Hydrograph
                </span>
              </div>
              <span className="font-mono text-[11px] text-primary font-bold">
                Q_max: {calculatedPeakQ.toLocaleString()} m³/s
              </span>
            </div>

            {/* Hydrograph SVG */}
            <div className="h-36 w-full rounded-lg bg-surface-container-lowest border border-outline-variant/20 p-2 relative flex flex-col justify-end">
              <svg
                className="w-full h-24 overflow-visible"
                viewBox="0 0 300 100"
                preserveAspectRatio="none"
              >
                <line
                  x1="0"
                  y1="20"
                  x2="300"
                  y2="20"
                  stroke="#3e484f"
                  strokeWidth="0.7"
                  strokeDasharray="2,2"
                />
                <line
                  x1="0"
                  y1="50"
                  x2="300"
                  y2="50"
                  stroke="#3e484f"
                  strokeWidth="0.7"
                  strokeDasharray="2,2"
                />
                <line
                  x1="0"
                  y1="80"
                  x2="300"
                  y2="80"
                  stroke="#3e484f"
                  strokeWidth="0.7"
                  strokeDasharray="2,2"
                />

                <polygon
                  points="0,95 20,93 45,86 70,68 95,24 110,12 125,28 150,55 190,75 240,88 300,94 300,95"
                  fill="#ffb4ab"
                  fillOpacity="0.18"
                />

                <polyline
                  points="0,95 20,93 45,86 70,68 95,24 110,12 125,28 150,55 190,75 240,88 300,94"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <circle cx="110" cy="12" r="5" fill="#ef4444" />
                <circle cx="110" cy="12" r="2.5" fill="#ffffff" />
              </svg>

              <div className="absolute top-2 left-3 font-mono text-[10px] text-error font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
                Peak Flood Pulse: T+32 min
              </div>

              <div className="flex justify-between font-mono text-[9px] text-outline pt-1 border-t border-outline-variant/20 mt-1">
                <span>T+0</span>
                <span>T+30m</span>
                <span>T+1h</span>
                <span>T+2h</span>
                <span>T+4h</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-label-sm text-[10px]">
              <div className="p-2 rounded bg-surface-container border border-outline-variant/20 flex flex-col">
                <span className="text-outline">Total Evac Volume</span>
                <span className="font-mono text-on-surface font-semibold text-[13px]">
                  41.8M m³
                </span>
              </div>
              <div className="p-2 rounded bg-surface-container border border-outline-variant/20 flex flex-col">
                <span className="text-outline">Sediment Bulking</span>
                <span className="font-mono text-tertiary font-semibold text-[13px]">
                  1.42x Factor
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Breach Model Parameter Sliders */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 shadow-sm flex flex-col gap-3">
            <span className="font-label-md text-[11px] uppercase tracking-wider text-on-surface font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">
                tune
              </span>
              Breach Model Parameters
            </span>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between font-label-sm text-[10px]">
                  <span className="text-on-surface-variant">Breach Width Growth</span>
                  <span className="font-mono text-primary font-medium">
                    {breachWidth.toFixed(1)} m
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="150"
                  step="0.5"
                  value={breachWidth}
                  onChange={(e) => setBreachWidth(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between font-label-sm text-[10px]">
                  <span className="text-on-surface-variant">Impulse Wave Height</span>
                  <span className="font-mono text-tertiary font-medium">
                    {impulseWave.toFixed(1)} m Overtopping
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="0.2"
                  value={impulseWave}
                  onChange={(e) => setImpulseWave(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-tertiary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between font-label-sm text-[10px]">
                  <span className="text-on-surface-variant">Reservoir Storage</span>
                  <span className="font-mono text-secondary font-medium">
                    {reservoirStorage.toFixed(1)} × 10⁶ m³
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="120"
                  step="0.5"
                  value={reservoirStorage}
                  onChange={(e) => setReservoirStorage(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-secondary"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER PANEL: Inundation HUD & Valley Transect Map */}
        <main className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="relative flex-1 rounded-xl bg-surface-container-lowest overflow-hidden shadow-lg border border-outline-variant/30 flex flex-col">
            {/* Top-Left Tactical Layer Toggles */}
            <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-1.5 bg-surface-container-low/90 backdrop-blur-md p-1.5 rounded-xl shadow-md border border-outline-variant/30">
              <button
                onClick={() => setShowInundation(!showInundation)}
                className={`px-2.5 py-1 rounded-lg font-label-sm text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                  showInundation
                    ? "bg-primary-container text-on-primary shadow-sm"
                    : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">water_voc</span>
                <span>Peak Inundation</span>
              </button>

              <button
                onClick={() => setShowVelocity(!showVelocity)}
                className={`px-2.5 py-1 rounded-lg font-label-sm text-[10px] flex items-center gap-1 transition-colors ${
                  showVelocity
                    ? "bg-primary-container text-on-primary font-semibold shadow-sm"
                    : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">speed</span>
                <span>Flow Vectors</span>
              </button>

              <button
                onClick={() => setShowSediment(!showSediment)}
                className={`px-2.5 py-1 rounded-lg font-label-sm text-[10px] flex items-center gap-1 transition-colors ${
                  showSediment
                    ? "bg-tertiary-container text-on-tertiary-container font-semibold"
                    : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">wrong_location</span>
                <span>Sediment Deposition</span>
              </button>

              <button
                onClick={() => setShowEvacRoutes(!showEvacRoutes)}
                className={`px-2.5 py-1 rounded-lg font-label-sm text-[10px] flex items-center gap-1 transition-colors ${
                  showEvacRoutes
                    ? "bg-secondary text-on-secondary font-semibold"
                    : "bg-surface-container hover:bg-surface-container-high text-secondary"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  transfer_within_a_station
                </span>
                <span>Evac Routes</span>
              </button>
            </div>

            {/* Map HUD Overlay & Zoom Controls */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <div className="flex items-center gap-3 bg-surface-container-low/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-label-sm text-[10px] font-mono text-outline shadow-md border border-outline-variant/30">
                <span className="text-secondary flex items-center gap-1 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  RAMMS 2D SOLVER: ACTIVE
                </span>
                <span>•</span>
                <span>ZOOM: {(zoom * 24000).toFixed(0)}</span>
                <span>•</span>
                <span className="text-on-surface">GRID: UTM 45R</span>
              </div>

              <div className="flex items-center bg-surface-container-low/90 backdrop-blur-md border border-outline-variant/30 p-0.5 rounded-lg shadow-md">
                <button
                  onClick={() => setZoom((prev) => Math.min(prev * 1.25, 3.5))}
                  className="p-1 hover:bg-surface-container-high text-on-surface rounded"
                  title="Zoom In"
                >
                  <span className="material-symbols-outlined text-[15px]">add</span>
                </button>
                <button
                  onClick={() => setZoom((prev) => Math.max(prev * 0.8, 0.75))}
                  className="p-1 hover:bg-surface-container-high text-on-surface rounded"
                  title="Zoom Out"
                >
                  <span className="material-symbols-outlined text-[15px]">remove</span>
                </button>
                <button
                  onClick={() => {
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                  }}
                  className="p-1 hover:bg-surface-container-high text-on-surface rounded"
                  title="Reset Map"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    center_focus_strong
                  </span>
                </button>
              </div>
            </div>

            {/* Map Viewport Canvas with Pan & Zoom */}
            <div
              ref={mapRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
              className={`relative w-full h-full overflow-hidden ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
            >
              <div
                className="relative w-full h-full origin-center transition-transform duration-75 ease-out"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                }}
              >
                {/* Terrain Orthomosaic Background */}
                <div
                  className="absolute inset-0 w-full h-full bg-cover bg-center filter saturate-75 contrast-125"
                  style={{ backgroundImage: `url('/images/glof-valley-sat.jpg')` }}
                />

                <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px]" />

                {/* Inundation Vector SVG Canvas */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 800 500"
                  preserveAspectRatio="xMidYMid slice"
                >
                  <defs>
                    <linearGradient id="floodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffb4ab" stopOpacity="0.85" />
                      <stop offset="35%" stopColor="#f59e0b" stopOpacity="0.7" />
                      <stop offset="70%" stopColor="#7bd0ff" stopOpacity="0.55" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.35" />
                    </linearGradient>
                  </defs>

                  {/* Valley River Corridor Inundation Swath */}
                  {showInundation && (
                    <g className="transition-opacity">
                      <path
                        d="M 680,60 Q 560,90 510,150 T 410,240 T 290,320 T 160,390 T 70,470"
                        fill="none"
                        stroke="url(#floodGrad)"
                        strokeWidth="48"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 680,60 Q 560,90 510,150 T 410,240 T 290,320 T 160,390 T 70,470"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="14"
                        strokeLinecap="round"
                        strokeOpacity="0.9"
                      />
                    </g>
                  )}

                  {/* Flow Velocity Direction Vectors */}
                  {showVelocity && (
                    <g
                      fill="none"
                      stroke="#dfe2ee"
                      strokeWidth="2"
                      strokeDasharray="8,14"
                      className="animate-pulse"
                    >
                      <path d="M 660,65 Q 550,95 500,155 T 400,245 T 280,325 T 150,395 T 60,475" />
                    </g>
                  )}

                  {/* Evac Safe Alpine Routes */}
                  {showEvacRoutes && (
                    <g
                      fill="none"
                      stroke="#4edea3"
                      strokeWidth="2"
                      strokeDasharray="4,6"
                      opacity="0.85"
                    >
                      <path d="M 520,130 L 540,80 L 570,50" />
                      <path d="M 420,220 L 450,190 L 480,180" />
                      <path d="M 280,300 L 250,260 L 230,240" />
                    </g>
                  )}

                  {/* Isochrone Wave Contours */}
                  <circle
                    cx="510"
                    cy="150"
                    r="32"
                    fill="none"
                    stroke="#ffb4ab"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                  <circle
                    cx="410"
                    cy="240"
                    r="28"
                    fill="none"
                    stroke="#ffc174"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                  <circle
                    cx="290"
                    cy="320"
                    r="24"
                    fill="none"
                    stroke="#7bd0ff"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                  <circle
                    cx="160"
                    cy="390"
                    r="20"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                </svg>

                {/* Settlement Markers on Map */}
                {SETTLEMENTS.map((settlement) => {
                  const isSelected = selectedNode.id === settlement.id;
                  return (
                    <div
                      key={settlement.id}
                      onClick={() => setSelectedNode(settlement)}
                      className="absolute pointer-events-auto cursor-pointer group"
                      style={{
                        left: `${(settlement.x / 800) * 100}%`,
                        top: `${(settlement.y / 500) * 100}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div
                        className={`p-2 rounded-lg backdrop-blur-md shadow-xl flex flex-col gap-0.5 transition-all ${
                          isSelected
                            ? "bg-error/30 ring-2 ring-error scale-110"
                            : "bg-surface-container-high/90 hover:scale-105 border border-outline-variant/40"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              settlement.status === "critical"
                                ? "bg-error animate-ping"
                                : settlement.status === "warning"
                                ? "bg-tertiary"
                                : "bg-primary"
                            }`}
                          />
                          <span className="font-label-md text-[11px] font-bold text-on-surface whitespace-nowrap">
                            {settlement.name}
                          </span>
                          <span className="px-1 py-0.2 bg-surface-container text-primary font-mono text-[9px] rounded">
                            {settlement.arrival}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[10px] text-outline">
                          <span>
                            Peak: <strong className="text-error">{settlement.peakDepth}</strong>
                          </span>
                          <span>|</span>
                          <span>
                            Vel: <strong className="text-on-surface">{settlement.velocity}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Floating Map Legend & Risk Metrics */}
            <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-3 bg-surface-container-low/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg border border-outline-variant/30">
              <div className="flex items-center gap-5 text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-error" />
                  <span className="font-label-sm text-on-surface">
                    High Hazard (&gt; 8m Depth)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-tertiary" />
                  <span className="font-label-sm text-on-surface">
                    Moderate (3-8m Depth)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-primary" />
                  <span className="font-label-sm text-on-surface">
                    Low Hazard (&lt; 3m Depth)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1.5 rounded-full bg-secondary" />
                  <span className="font-label-sm text-secondary font-semibold">
                    Alpine Safe Route
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-outline">River Length Impact:</span>
                <span className="font-mono text-[11px] font-bold text-on-surface">
                  42.6 km
                </span>
                <span className="h-3 w-px bg-outline-variant" />
                <span className="text-outline">VDCs Impacted:</span>
                <span className="font-mono text-[11px] font-bold text-error">
                  14 Districts
                </span>
              </div>
            </div>
          </div>

          {/* Infrastructure Threat Matrix Strip */}
          <div className="shrink-0 p-3 bg-surface-container rounded-xl border border-outline-variant/30 flex items-center justify-between gap-4 overflow-x-auto text-[10px]">
            <div className="flex items-center gap-2 shrink-0">
              <span className="material-symbols-outlined text-error text-[18px]">
                emergency
              </span>
              <span className="font-semibold text-on-surface uppercase tracking-wide">
                Critical Asset Threat Matrix:
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0 font-label-sm">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-high border border-outline-variant/20">
                <span className="material-symbols-outlined text-[15px] text-error">
                  cable
                </span>
                <span className="text-on-surface">4 Suspension Bridges Severe Risk</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-high border border-outline-variant/20">
                <span className="material-symbols-outlined text-[15px] text-tertiary">
                  bolt
                </span>
                <span className="text-on-surface">Khumbu Micro-Hydro (500kW) Trip</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-high border border-outline-variant/20">
                <span className="material-symbols-outlined text-[15px] text-error">
                  hotel
                </span>
                <span className="text-on-surface">12 Riverside Lodges Inundated</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-high border border-outline-variant/20">
                <span className="material-symbols-outlined text-[15px] text-secondary">
                  hiking
                </span>
                <span className="text-on-surface">320 Trekkers Tracked Live</span>
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT PANEL: Early Warning Automation & Civil Defense Dispatch */}
        <aside className="w-[360px] 2xl:w-[410px] shrink-0 flex flex-col gap-3 overflow-y-auto pl-1">
          {/* Multi-Channel Dissemination Card */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  cloud_upload
                </span>
                <span className="font-label-md text-[11px] uppercase tracking-wider text-on-surface font-semibold">
                  Multi-Channel Dissemination
                </span>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-secondary/15 text-secondary font-semibold border border-secondary/30">
                100% ONLINE
              </span>
            </div>

            <div className="space-y-2">
              {/* VHF Sirens */}
              <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      sirensActive ? "text-error animate-pulse" : "text-outline"
                    }`}
                  >
                    campaign
                  </span>
                  <div className="flex flex-col">
                    <span className="font-label-md text-[11px] text-on-surface font-semibold">
                      Valley VHF Sirens
                    </span>
                    <span className="text-[10px] text-outline">
                      6 of 6 Audio Stacks Blaring
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSirensActive(!sirensActive)}
                  className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
                    sirensActive
                      ? "bg-secondary/20 text-secondary"
                      : "bg-surface-container text-outline"
                  }`}
                >
                  {sirensActive ? "ACTIVE" : "STANDBY"}
                </button>
              </div>

              {/* GSM / CBS Push */}
              <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    sms
                  </span>
                  <div className="flex flex-col">
                    <span className="font-label-md text-[11px] text-on-surface font-semibold">
                      Cell Broadcast (Ncell / NTC)
                    </span>
                    <span className="text-[10px] text-outline">
                      4,820 Geo-Fenced Push Alerts
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setGsmPushActive(!gsmPushActive)}
                  className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
                    gsmPushActive
                      ? "bg-secondary/20 text-secondary"
                      : "bg-surface-container text-outline"
                  }`}
                >
                  {gsmPushActive ? "98.4% ACK" : "PAUSED"}
                </button>
              </div>

              {/* First Responders Net */}
              <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-tertiary text-[18px]">
                    security
                  </span>
                  <div className="flex flex-col">
                    <span className="font-label-md text-[11px] text-on-surface font-semibold">
                      Armed Police Force &amp; HRA
                    </span>
                    <span className="text-[10px] text-outline">
                      Namche &amp; Lukla Quick Reaction
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setRespondersActive(!respondersActive)}
                  className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
                    respondersActive
                      ? "bg-primary/20 text-primary"
                      : "bg-surface-container text-outline"
                  }`}
                >
                  {respondersActive ? "DISPATCHED" : "HELD"}
                </button>
              </div>
            </div>
          </div>

          {/* Live Evacuation Progress Monitors */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  transfer_within_a_station
                </span>
                <span className="font-label-md text-[11px] uppercase tracking-wider text-on-surface font-semibold">
                  Evacuation Status
                </span>
              </div>
              <span className="font-label-sm text-[10px] text-outline font-mono">
                T+00:14:22 ELAPSED
              </span>
            </div>

            {/* Dingboche Progress */}
            <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 font-label-md font-semibold text-[11px] text-on-surface">
                  <span>Dingboche Settlement</span>
                  <span className="text-[10px] text-error font-mono font-normal">
                    (4m to wave front)
                  </span>
                </div>
                <span className="font-mono text-secondary text-[11px] font-bold">
                  88% (422/480)
                </span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div
                  className="bg-secondary h-full rounded-full shadow-[0_0_8px_rgba(78,222,163,0.5)]"
                  style={{ width: "88%" }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-outline font-mono">
                <span>Rerouted to Ridge Waypoint Alpha (5,120m)</span>
                <span className="text-tertiary">58 Persons in transit</span>
              </div>
            </div>

            {/* Pangboche Progress */}
            <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 font-label-md font-semibold text-[11px] text-on-surface">
                  <span>Pangboche Corridor</span>
                  <span className="text-[10px] text-tertiary font-mono font-normal">
                    (28m to wave front)
                  </span>
                </div>
                <span className="font-mono text-tertiary text-[11px] font-bold">
                  62% (210/338)
                </span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-tertiary h-full rounded-full" style={{ width: "62%" }} />
              </div>
              <div className="flex justify-between text-[9px] text-outline font-mono">
                <span>Ascending toward Upper Gompa Tier</span>
                <span className="text-outline">128 Pending clearance</span>
              </div>
            </div>

            {/* Trekking Garmin Tracker */}
            <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">
                  satellite
                </span>
                <span className="font-label-sm text-[10px] text-on-surface">
                  Garmin InReach / SPOT Beacons
                </span>
              </div>
              <span className="font-mono text-[10px] text-secondary font-bold">
                320/320 Geotracked
              </span>
            </div>
          </div>

          {/* Chronological Incident Stream */}
          <div className="flex-1 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 shadow-sm flex flex-col gap-2.5 min-h-[200px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-outline text-[18px]">
                  history
                </span>
                <span className="font-label-md text-[11px] uppercase tracking-wider text-on-surface font-semibold">
                  Real-Time Incident Stream
                </span>
              </div>
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-[10px]">
              <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/20 flex flex-col gap-0.5">
                <div className="flex justify-between text-outline">
                  <span className="text-error font-semibold">14:28:02 NPT</span>
                  <span>RADAR CONFIRM</span>
                </div>
                <p className="text-on-surface">
                  Sentinel-1 InSAR coherence drop confirms progressive crest slumping (-1.2m).
                </p>
              </div>

              <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/20 flex flex-col gap-0.5">
                <div className="flex justify-between text-outline">
                  <span className="text-tertiary font-semibold">14:24:18 NPT</span>
                  <span>AUTO TRIGGER</span>
                </div>
                <p className="text-on-surface">
                  Stage 4 Siren Protocol executed across Dingboche &amp; Tengboche masts.
                </p>
              </div>

              <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/20 flex flex-col gap-0.5">
                <div className="flex justify-between text-outline">
                  <span className="text-primary font-semibold">14:21:40 NPT</span>
                  <span>CIVIL DEFENSE</span>
                </div>
                <p className="text-on-surface">
                  Himalayan Rescue Association helicopter evacuation hold issued at Lukla airfield.
                </p>
              </div>

              <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/20 flex flex-col gap-0.5">
                <div className="flex justify-between text-outline">
                  <span className="text-outline font-semibold">14:15:00 NPT</span>
                  <span>SEISMIC DETECT</span>
                </div>
                <p className="text-on-surface-variant">
                  Lhotse South Face broadband station detects 500k m³ rock/ice detachment acoustic signature.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
