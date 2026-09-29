"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";

interface SettlementNode {
  id: string;
  name: string;
  code: string;
  arrivalMinutes: number;
  arrivalTimeStr: string;
  peakDepthM: number;
  velocityMs: number;
  elevationM: number;
  infra: string;
  evacuatedPersons: number;
  totalPersons: number;
  x: number; // SVG coordinate (0 - 800)
  y: number; // SVG coordinate (0 - 500)
  evacRoute: string;
  safeAltitudeM: number;
}

interface ScenarioPreset {
  id: string;
  name: string;
  breachWidth: number;
  impulseWave: number;
  reservoirStorage: number;
  description: string;
}

const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: "moderate_melt",
    name: "Baseline Drainage",
    breachWidth: 54.0,
    impulseWave: 6.5,
    reservoirStorage: 48.0,
    description: "Subglacial conduit enlargement without moraine rim collapse.",
  },
  {
    id: "serac_impact",
    name: "Hanging Serac (Current)",
    breachWidth: 85.4,
    impulseWave: 14.6,
    reservoirStorage: 78.2,
    description: "680k m³ ice detachment from Saltoro Flank triggering 14.6m impulse wave.",
  },
  {
    id: "catastrophic_overtop",
    name: "Extreme Overtopping",
    breachWidth: 124.0,
    impulseWave: 22.0,
    reservoirStorage: 104.5,
    description: "Compound rapid overtopping coupled with moraine core piping failure.",
  },
];

const SETTLEMENTS: SettlementNode[] = [
  {
    id: "breach_origin",
    name: "Teram Shehr Dam Origin",
    code: "SEC-01",
    arrivalMinutes: 0,
    arrivalTimeStr: "T+0",
    peakDepthM: 24.2,
    velocityMs: 14.8,
    elevationM: 4780,
    infra: "Subglacial reservoir threshold & moraine saddle",
    evacuatedPersons: 14,
    totalPersons: 14,
    x: 680,
    y: 65,
    evacRoute: "Teram Shehr High Nunatak (5,240m)",
    safeAltitudeM: 5100,
  },
  {
    id: "base_camp",
    name: "Siachen Snout Research Station",
    code: "SEC-02",
    arrivalMinutes: 24,
    arrivalTimeStr: "T+24m",
    peakDepthM: 16.4,
    velocityMs: 10.5,
    elevationM: 3620,
    infra: "Hydrology research center & forward helipad",
    evacuatedPersons: 442,
    totalPersons: 480,
    x: 510,
    y: 150,
    evacRoute: "Pad Bravo Glacial Terrace (3,840m)",
    safeAltitudeM: 3820,
  },
  {
    id: "panamik",
    name: "Warshi & Panamik Settlement",
    code: "SEC-03",
    arrivalMinutes: 70,
    arrivalTimeStr: "T+1h 10m",
    peakDepthM: 10.8,
    velocityMs: 7.6,
    elevationM: 3180,
    infra: "Upper Nubra highway segment & thermal spring basin",
    evacuatedPersons: 257,
    totalPersons: 338,
    x: 410,
    y: 240,
    evacRoute: "Upper Panamik Monastic Escarpment (3,400m)",
    safeAltitudeM: 3350,
  },
  {
    id: "sumur",
    name: "Sumur Valley & Confluence",
    code: "SEC-04",
    arrivalMinutes: 150,
    arrivalTimeStr: "T+2h 30m",
    peakDepthM: 6.4,
    velocityMs: 5.2,
    elevationM: 3090,
    infra: "Nubra-Shyok river bridge & micro-hydro intake weir",
    evacuatedPersons: 412,
    totalPersons: 490,
    x: 290,
    y: 320,
    evacRoute: "Sumur Gompa High Plateau (3,320m)",
    safeAltitudeM: 3250,
  },
  {
    id: "diskit",
    name: "Diskit Gorge & Shyok Valley",
    code: "SEC-05",
    arrivalMinutes: 255,
    arrivalTimeStr: "T+4h 15m",
    peakDepthM: 4.5,
    velocityMs: 3.8,
    elevationM: 3040,
    infra: "Alluvial river terraces & agricultural orchards",
    evacuatedPersons: 810,
    totalPersons: 840,
    x: 160,
    y: 395,
    evacRoute: "Diskit Photang Alpine Track (3,280m)",
    safeAltitudeM: 3200,
  },
];

interface LogEntry {
  id: string;
  time: string;
  source: string;
  message: string;
}

const INCIDENT_LOGS: LogEntry[] = [
  {
    id: "1",
    time: "14:28",
    source: "Sentinel-1 DInSAR",
    message: "Coherence drop confirms crest slump (-1.85m) at Teram Shehr ice threshold.",
  },
  {
    id: "2",
    time: "14:24",
    source: "Civil Alert Network",
    message: "Stage 4 Acoustic Valley Siren sequence activated along the upper Nubra corridor.",
  },
  {
    id: "3",
    time: "14:21",
    source: "River Gauge 02",
    message: "Ultrasonic river stage gauge at Snout Bridge reports +4.2m instantaneous surge front.",
  },
  {
    id: "4",
    time: "14:15",
    source: "Seismic Array",
    message: "Saltoro broadband array records serac collapse acoustic signature (Mag 2.8 ML).",
  },
  {
    id: "5",
    time: "14:02",
    source: "Core Piezometer",
    message: "P-3 internal pore pressure registered at 418 kPa (threshold 380 kPa).",
  },
];

export default function GlofModelingWorkspace() {
  const mapRef = useRef<HTMLDivElement>(null);

  // Active Tab in Right Inspector: 'breach' | 'settlements' | 'warning'
  const [activeTab, setActiveTab] = useState<"breach" | "settlements" | "warning">("breach");

  // Selected Preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>("serac_impact");

  // Hydrodynamic parameters
  const [breachWidth, setBreachWidth] = useState<number>(85.4);
  const [impulseWave, setImpulseWave] = useState<number>(14.6);
  const [reservoirStorage, setReservoirStorage] = useState<number>(78.2);

  // Timeline Scrubber (0 to 270 min)
  const [timelineMinutes, setTimelineMinutes] = useState<number>(36);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Map Pan & Zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Map Layer Toggles
  const [showInundation, setShowInundation] = useState<boolean>(true);
  const [showVelocity, setShowVelocity] = useState<boolean>(true);
  const [showEvacRoutes, setShowEvacRoutes] = useState<boolean>(true);

  // Selected settlement focus
  const [selectedNodeId, setSelectedNodeId] = useState<string>("base_camp");
  const selectedNode = SETTLEMENTS.find((s) => s.id === selectedNodeId) || SETTLEMENTS[1];

  // Dissemination channels
  const [sirensActive, setSirensActive] = useState<boolean>(true);
  const [gsmPushActive, setGsmPushActive] = useState<boolean>(true);
  const [respondersActive, setRespondersActive] = useState<boolean>(true);
  const [broadcastDone, setBroadcastDone] = useState<boolean>(false);

  // Apply scenario
  const applyPreset = (preset: ScenarioPreset) => {
    setSelectedPresetId(preset.id);
    setBreachWidth(preset.breachWidth);
    setImpulseWave(preset.impulseWave);
    setReservoirStorage(preset.reservoirStorage);
  };

  // Dynamic peak discharge
  const calculatedPeakQ = useMemo(() => {
    return Math.round(
      (breachWidth / 85.4) * (reservoirStorage / 78.2) * Math.sqrt(impulseWave / 14.6) * 15400
    );
  }, [breachWidth, reservoirStorage, impulseWave]);

  // Dynamic total volume
  const totalVolumeMillionM3 = useMemo(() => {
    return (reservoirStorage * 0.58).toFixed(1);
  }, [reservoirStorage]);

  // Timeline auto-play
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTimelineMinutes((prev) => {
        if (prev >= 270) {
          setIsPlaying(false);
          return 270;
        }
        return prev + 1 * playbackSpeed;
      });
    }, 200);
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = Math.floor(mins % 60);
    return `T+${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m`;
  };

  // Drag handlers
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
    const factor = e.deltaY < 0 ? 1.15 : 0.88;
    setZoom((prev) => Math.min(Math.max(prev * factor, 0.75), 3.5));
  };

  const focusSettlement = (node: SettlementNode) => {
    setSelectedNodeId(node.id);
    if (mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect();
      const targetX = (node.x / 800) * rect.width;
      const targetY = (node.y / 500) * rect.height;
      setZoom(1.35);
      setPan({
        x: rect.width / 2 - targetX * 1.35,
        y: rect.height / 2 - targetY * 1.35,
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-52px)] overflow-hidden p-3.5 bg-[#080c14] text-slate-200 select-none">
      {/* 2-COLUMN PALANTIR-STYLE WORKSPACE: MAP CANVAS (72%) + CONSOLIDATED INTELLIGENCE PANEL (28%) */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-3.5 h-full min-h-0 overflow-hidden">
        {/* LEFT / CENTER: EXPANSIVE GEOSPATIAL SIMULATION CANVAS (COL-SPAN-8 / 9) */}
        <div className="xl:col-span-8 2xl:col-span-9 flex flex-col h-full min-h-0 rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden relative shadow-xl backdrop-blur-md">
          {/* Top Floating Command Bar: Scenarios & Layer Toggles */}
          <div className="absolute top-3.5 left-3.5 right-3.5 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
            {/* Scenario Presets Bar */}
            <div className="pointer-events-auto flex items-center p-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-700/60 shadow-lg gap-1">
              <span className="font-mono text-[10px] text-slate-400 px-2 uppercase tracking-wider hidden sm:inline">
                SCENARIO:
              </span>
              {SCENARIO_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-sky-500 text-white shadow-sm font-semibold"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                    }`}
                    title={preset.description}
                  >
                    {preset.name}
                  </button>
                );
              })}
            </div>

            {/* Map Layers & Zoom HUD */}
            <div className="pointer-events-auto flex items-center gap-2">
              <div className="flex items-center p-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-700/60 shadow-lg gap-1">
                <button
                  onClick={() => setShowInundation(!showInundation)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    showInundation
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Toggle Inundation Swath"
                >
                  <span className="material-symbols-outlined text-[15px]">water_voc</span>
                  <span className="hidden md:inline">Flood Swath</span>
                </button>

                <button
                  onClick={() => setShowVelocity(!showVelocity)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    showVelocity
                      ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Toggle Velocity Vectors"
                >
                  <span className="material-symbols-outlined text-[15px]">trending_flat</span>
                  <span className="hidden md:inline">Vectors</span>
                </button>

                <button
                  onClick={() => setShowEvacRoutes(!showEvacRoutes)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    showEvacRoutes
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Toggle Safe High-Ground Routes"
                >
                  <span className="material-symbols-outlined text-[15px]">nordic_walking</span>
                  <span className="hidden md:inline">Safe Routes</span>
                </button>
              </div>

              {/* Zoom Buttons */}
              <div className="flex items-center p-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-700/60 shadow-lg gap-0.5">
                <button
                  onClick={() => setZoom((prev) => Math.min(prev * 1.2, 3.5))}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  title="Zoom In"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
                <button
                  onClick={() => setZoom((prev) => Math.max(prev * 0.8, 0.75))}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  title="Zoom Out"
                >
                  <span className="material-symbols-outlined text-[16px]">remove</span>
                </button>
                <button
                  onClick={() => {
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                  }}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  title="Reset View"
                >
                  <span className="material-symbols-outlined text-[16px]">center_focus_strong</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Map Viewport */}
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
              {/* Satellite Terrain Backdrop */}
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center filter saturate-75 contrast-125"
                style={{ backgroundImage: `url('/images/glof-valley-sat.jpg')` }}
              />

              {/* Shaded Relief Dark Tint */}
              <div className="absolute inset-0 bg-[#080d1a]/55 backdrop-blur-[0.5px]" />

              {/* Vector Overlay SVG */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 800 500"
                preserveAspectRatio="xMidYMid slice"
              >
                <defs>
                  <linearGradient id="floodGradClean" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.85" />
                    <stop offset="35%" stopColor="#fb923c" stopOpacity="0.75" />
                    <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                {/* Flood Corridor Swath */}
                {showInundation && (
                  <g>
                    <path
                      d="M 680,65 Q 560,95 510,150 T 410,240 T 290,320 T 160,395 T 70,470"
                      fill="none"
                      stroke="url(#floodGradClean)"
                      strokeWidth="42"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 680,65 Q 560,95 510,150 T 410,240 T 290,320 T 160,395 T 70,470"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeOpacity="0.85"
                    />
                  </g>
                )}

                {/* Directional Velocity Vectors */}
                {showVelocity && (
                  <g
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="2"
                    strokeDasharray="6,12"
                    strokeOpacity="0.7"
                  >
                    <path d="M 660,70 Q 550,100 500,155 T 400,245 T 280,325 T 150,400 T 60,475" />
                  </g>
                )}

                {/* Safe High-Ground Routes */}
                {showEvacRoutes && (
                  <g
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="2.5"
                    strokeDasharray="5,6"
                    opacity="0.9"
                  >
                    <path d="M 510,150 L 535,110 L 570,85" />
                    <path d="M 410,240 L 440,210 L 470,195" />
                    <path d="M 290,320 L 260,280 L 240,260" />
                    <path d="M 160,395 L 140,360 L 120,340" />
                  </g>
                )}
              </svg>

              {/* Settlement Markers on Map */}
              {SETTLEMENTS.map((settlement) => {
                const isSelected = selectedNode.id === settlement.id;
                const isReached = timelineMinutes >= settlement.arrivalMinutes;

                return (
                  <div
                    key={settlement.id}
                    onClick={() => focusSettlement(settlement)}
                    className="absolute pointer-events-auto cursor-pointer group"
                    style={{
                      left: `${(settlement.x / 800) * 100}%`,
                      top: `${(settlement.y / 500) * 100}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div
                      className={`px-3 py-1.5 rounded-lg backdrop-blur-md shadow-xl flex items-center gap-2 transition-all ${
                        isSelected
                          ? "bg-slate-900/95 ring-2 ring-sky-400 scale-110 border border-sky-400"
                          : "bg-slate-950/85 hover:bg-slate-900/95 border border-slate-700/60"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isReached
                            ? "bg-rose-500"
                            : settlement.arrivalMinutes - timelineMinutes < 30
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                        }`}
                      />
                      <span className="font-sans text-xs font-semibold text-slate-100 whitespace-nowrap">
                        {settlement.name}
                      </span>
                      <span className="px-1.5 py-0.5 bg-slate-800 text-sky-300 font-mono text-[10px] rounded">
                        {settlement.arrivalTimeStr}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Floating Simulation Timeline Scrubber */}
          <div className="absolute bottom-3.5 left-3.5 right-3.5 z-20 p-3 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-700/60 shadow-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Play / Pause Toggle */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-sky-500 hover:bg-sky-400 text-white font-sans text-xs font-semibold transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isPlaying ? "pause" : "play_arrow"}
                  </span>
                  <span>{isPlaying ? "Pause" : "Play Wave"}</span>
                </button>

                {/* Speed Multiplier */}
                <div className="flex items-center bg-slate-800/80 border border-slate-700/60 rounded-md p-0.5 text-[11px] font-mono">
                  {[1, 2, 5].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        playbackSpeed === spd
                          ? "bg-sky-500 text-white font-bold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                <div className="flex items-baseline gap-1.5 font-mono">
                  <span className="text-sm font-bold text-sky-400">
                    {formatTime(timelineMinutes)}
                  </span>
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    (Elapsed simulation time)
                  </span>
                </div>
              </div>

              {/* Minimalist Legend */}
              <div className="hidden md:flex items-center gap-4 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500" />
                  <span className="text-slate-300">&gt;8m High</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-400" />
                  <span className="text-slate-300">3-8m Mod</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-sky-400" />
                  <span className="text-slate-300">&lt;3m Low</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded bg-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Safe Route</span>
                </div>
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="0"
              max="270"
              step="1"
              value={timelineMinutes}
              onChange={(e) => setTimelineMinutes(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>
        </div>

        {/* RIGHT: CONSOLIDATED INTELLIGENCE & CONTROL PANEL (COL-SPAN-4 / 3) */}
        <div className="xl:col-span-4 2xl:col-span-3 flex flex-col h-full min-h-0 rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-xl backdrop-blur-md">
          {/* Header & Tab Selector */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-950/40 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-100 font-sans">
                  GLOF Hydrodynamics
                </h2>
                <p className="text-[11px] text-slate-400 font-mono">
                  Teram Shehr • Nubra River Basin
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                ACTIVE
              </span>
            </div>

            {/* 3 Clean Tabs */}
            <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-lg gap-1">
              <button
                onClick={() => setActiveTab("breach")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === "breach"
                    ? "bg-sky-500 text-white font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Breach Model
              </button>
              <button
                onClick={() => setActiveTab("settlements")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === "settlements"
                    ? "bg-sky-500 text-white font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Settlements
              </button>
              <button
                onClick={() => setActiveTab("warning")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === "warning"
                    ? "bg-sky-500 text-white font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Early Warning
              </button>
            </div>
          </div>

          {/* Panel Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {activeTab === "breach" && (
              <div className="space-y-4">
                {/* Primary Metrics (Clean typography, no box congestion) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase font-sans">
                      Peak Discharge (Q_max)
                    </span>
                    <div className="text-xl font-bold font-mono text-rose-400 mt-1">
                      {calculatedPeakQ.toLocaleString()}
                      <span className="text-xs font-normal text-slate-500 ml-1">m³/s</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase font-sans">
                      Drainage Volume
                    </span>
                    <div className="text-xl font-bold font-mono text-sky-400 mt-1">
                      {totalVolumeMillionM3}
                      <span className="text-xs font-normal text-slate-500 ml-1">×10⁶ m³</span>
                    </div>
                  </div>
                </div>

                {/* Hydrograph Curve */}
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-slate-300">Outflow Hydrograph Q(t)</span>
                    <span className="font-mono text-slate-400">T+32m peak</span>
                  </div>

                  <div className="h-28 w-full relative flex flex-col justify-end pt-2">
                    <svg className="w-full h-20 overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                      <polygon
                        points="0,95 25,92 50,84 75,64 100,20 115,10 130,24 160,52 200,72 250,86 300,92 300,95"
                        fill="#f43f5e"
                        fillOpacity="0.18"
                      />
                      <polyline
                        points="0,95 25,92 50,84 75,64 100,20 115,10 130,24 160,52 200,72 250,86 300,92"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="2.5"
                      />
                      <line
                        x1={(timelineMinutes / 270) * 300}
                        y1="0"
                        x2={(timelineMinutes / 270) * 300}
                        y2="100"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                      />
                    </svg>
                    <div className="flex justify-between font-mono text-[9px] text-slate-500 pt-1 border-t border-slate-800">
                      <span>T+0</span>
                      <span>T+1h</span>
                      <span>T+2h</span>
                      <span>T+3h</span>
                      <span>T+4h 30m</span>
                    </div>
                  </div>
                </div>

                {/* Sliders */}
                <div className="space-y-3 pt-1">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Breach Width (B_f)</span>
                      <span className="font-mono text-sky-400 font-semibold">{breachWidth.toFixed(1)} m</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="150"
                      step="0.5"
                      value={breachWidth}
                      onChange={(e) => setBreachWidth(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Impulse Wave Amplitude (H_w)</span>
                      <span className="font-mono text-amber-400 font-semibold">{impulseWave.toFixed(1)} m</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      step="0.2"
                      value={impulseWave}
                      onChange={(e) => setImpulseWave(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Impounded Storage (V_0)</span>
                      <span className="font-mono text-emerald-400 font-semibold">{reservoirStorage.toFixed(1)} ×10⁶ m³</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="120"
                      step="0.5"
                      value={reservoirStorage}
                      onChange={(e) => setReservoirStorage(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settlements" && (
              <div className="space-y-3">
                <p className="text-[11px] text-slate-400">
                  Select a settlement to focus on the map and inspect wave arrival time and evacuation corridors.
                </p>

                <div className="space-y-2">
                  {SETTLEMENTS.map((s) => {
                    const isSelected = selectedNode.id === s.id;
                    const isReached = timelineMinutes >= s.arrivalMinutes;
                    const pct = Math.round((s.evacuatedPersons / s.totalPersons) * 100);

                    return (
                      <div
                        key={s.id}
                        onClick={() => focusSettlement(s)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-slate-800/80 border-sky-500 shadow-md"
                            : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isReached ? "bg-rose-500" : "bg-emerald-400"
                              }`}
                            />
                            <span className="font-semibold text-slate-100">{s.name}</span>
                          </div>
                          <span className="font-mono text-xs text-sky-400 font-medium">
                            {s.arrivalTimeStr}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-1.5">
                          <span>Peak Depth: <strong className="text-rose-400">{s.peakDepthM}m</strong></span>
                          <span>Velocity: {s.velocityMs} m/s</span>
                          <span>Evac: <strong className="text-emerald-400">{pct}%</strong></span>
                        </div>

                        {isSelected && (
                          <div className="mt-2 pt-2 border-t border-slate-700/60 text-[11px] text-slate-300 space-y-1">
                            <div><strong className="text-slate-400">Infra:</strong> {s.infra}</div>
                            <div><strong className="text-slate-400">Safe Route:</strong> {s.evacRoute}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "warning" && (
              <div className="space-y-4">
                {/* Dissemination switches */}
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">Valley Acoustic Sirens</div>
                      <div className="text-[11px] text-slate-400">8 audio horn arrays along Nubra corridor</div>
                    </div>
                    <button
                      onClick={() => setSirensActive(!sirensActive)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                        sirensActive ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {sirensActive ? "ACTIVE" : "OFF"}
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">Cell Broadcast (CAP-Alert)</div>
                      <div className="text-[11px] text-slate-400">Geo-targeted civil phone push alerts</div>
                    </div>
                    <button
                      onClick={() => setGsmPushActive(!gsmPushActive)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                        gsmPushActive ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {gsmPushActive ? "BROADCAST" : "OFF"}
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">Disaster Response Force</div>
                      <div className="text-[11px] text-slate-400">DDMA Leh &amp; regional emergency officers</div>
                    </div>
                    <button
                      onClick={() => setRespondersActive(!respondersActive)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                        respondersActive ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {respondersActive ? "DISPATCHED" : "OFF"}
                    </button>
                  </div>
                </div>

                {/* Broadcast Execute Button */}
                <button
                  onClick={() => setBroadcastDone(!broadcastDone)}
                  className={`w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
                    broadcastDone
                      ? "bg-emerald-500 text-white"
                      : "bg-rose-600 hover:bg-rose-500 text-white"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">campaign</span>
                  <span>{broadcastDone ? "BROADCAST EXECUTED ✓" : "EXECUTE WARNING PROTOCOL"}</span>
                </button>

                {/* Incident Stream */}
                <div className="pt-2">
                  <div className="text-xs font-semibold text-slate-300 mb-2">Live Incident Stream</div>
                  <div className="space-y-2">
                    {INCIDENT_LOGS.map((log) => (
                      <div key={log.id} className="p-2.5 rounded bg-slate-950/40 border border-slate-800/80 text-[11px]">
                        <div className="flex justify-between font-mono text-slate-500 mb-0.5">
                          <span className="text-sky-400 font-semibold">{log.time} IST</span>
                          <span>{log.source}</span>
                        </div>
                        <p className="text-slate-300">{log.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
