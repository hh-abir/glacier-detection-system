"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface GlacierSite {
  id: string;
  name: string;
  code: string;
  status: "critical" | "warning" | "advisory" | "nominal";
  statusLabel: string;
  coords: string;
  elevation: string;
  velocity: string;
  volume: string;
  volumeTrend: string;
  displacement: string;
  riskFactor: string;
  description: string;
  lastSync: string;
  focalPoint: { x: number; y: number };
}

const GLACIER_SITES: Record<string, GlacierSite> = {
  teram_shehr: {
    id: "teram_shehr",
    name: "Teram Shehr Subglacial Basin",
    code: "GL-SIACHEN-04",
    status: "critical",
    statusLabel: "HIGH RISK ADVISORY",
    coords: "35.480° N, 77.180° E",
    elevation: "4,780m ASL",
    velocity: "+112% surge accel",
    volume: "78.2M m³",
    volumeTrend: "+42.0% volume",
    displacement: "-2.8m (ICESat-2)",
    riskFactor: "Stage 2 Early Warning",
    description:
      "Multiple moraine and subglacial dam integrity thresholds exceeded. Proglacial melt volume reached historical seasonal high.",
    lastSync: "14m ago",
    focalPoint: { x: 530, y: 260 },
  },
  siachen_trunk: {
    id: "siachen_trunk",
    name: "Siachen Glacier (Central Trunk)",
    code: "SC-01",
    status: "warning",
    statusLabel: "ELEVATED DILATION",
    coords: "35.420° N, 77.100° E",
    elevation: "5,364m ASL",
    velocity: "0.28 m/day",
    volume: "612 km² total ice",
    volumeTrend: "+18 cm/yr drift",
    displacement: "-3.2m elevation",
    riskFactor: "Transverse shear zone",
    description:
      "Sentinel-1 DInSAR reveals accelerated crevasse widening and basal sliding across central 22km monitoring corridor.",
    lastSync: "28m ago",
    focalPoint: { x: 340, y: 230 },
  },
  saltoro_ridge: {
    id: "saltoro_ridge",
    name: "Saltoro Hanging Wall Serac",
    code: "SR-08",
    status: "warning",
    statusLabel: "HANGING DETACHMENT",
    coords: "35.380° N, 76.980° E",
    elevation: "6,120m ASL",
    velocity: "+14 cm/month",
    volume: "420,000 m³ mass",
    volumeTrend: "Detachment creep",
    displacement: "Factor 1.14 Marginal",
    riskFactor: "Avalanche chute hazard",
    description:
      "Landsat-9 SWIR thermal anomaly indicates thermal shear fracturing along hanging ice cleavage plane above scientific base route.",
    lastSync: "48m ago",
    focalPoint: { x: 180, y: 210 },
  },
  nubra_snout: {
    id: "nubra_snout",
    name: "Nubra Valley Outflow Snout",
    code: "NB-02",
    status: "advisory",
    statusLabel: "ACTIVE RUNOFF",
    coords: "35.180° N, 77.220° E",
    elevation: "3,620m ASL",
    velocity: "142 m³/s Q_outflow",
    volume: "Terminal moraine",
    volumeTrend: "Sediment bulk 1.65x",
    displacement: "+0.4m gauge rise",
    riskFactor: "Downstream Watch",
    description:
      "Meltwater discharge gauging station reports continuous high-turbidity flow into Upper Shyok tributary basin.",
    lastSync: "1h 10m ago",
    focalPoint: { x: 320, y: 420 },
  },
};

interface TelemetryItem {
  id: string;
  time: string;
  source: string;
  sourceType: "usgs" | "esa" | "cv" | "alert" | "harmony";
  title: string;
  description: string;
}

const INITIAL_TELEMETRY: TelemetryItem[] = [
  {
    id: "1",
    time: "11:38",
    source: "USGS",
    sourceType: "usgs",
    title: "Landsat-9 L2 Surface Reflectance",
    description: "Orthorectification and cloud masking complete for path 148, row 035 (Siachen sector).",
  },
  {
    id: "2",
    time: "11:24",
    source: "CV ENGINE",
    sourceType: "cv",
    title: "Segmentation Mask Generated",
    description: "Subglacial water delineation confidence 98.4% for Teram Shehr basin.",
  },
  {
    id: "3",
    time: "10:48",
    source: "ALERT ENGINE",
    sourceType: "alert",
    title: "Environmental Rule Triggered",
    description: "Rule ENV-2026-0930-K2 elevated Teram Shehr advisory status to High Advisory.",
  },
  {
    id: "4",
    time: "10:12",
    source: "HARMONY",
    sourceType: "harmony",
    title: "ICESat-2 ATL06 Height Profile",
    description: "214 elevation photons aligned along Siachen Central Transect Track #0721.",
  },
  {
    id: "5",
    time: "09:44",
    source: "ESA SAR",
    sourceType: "esa",
    title: "Sentinel-1B IW Interferogram",
    description: "Descending pass 106 interferometric phase unwrap complete across Saltoro Ridge.",
  },
  {
    id: "6",
    time: "09:15",
    source: "CV ENGINE",
    sourceType: "cv",
    title: "Transverse Crevasse Vector Field",
    description: "Automated feature tracking identified +28 cm/d displacement anomaly at Indira Col flank.",
  },
];

export default function CleanMissionControl() {
  // 1. Layer Shaders
  const [activeLayer, setActiveLayer] = useState<"sar" | "optical" | "dem" | "thermal">("sar");

  // 2. Map Pan & Zoom
  const mapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // 3. Selected Glacier Site for Floating Inspector
  const [selectedSiteId, setSelectedSiteId] = useState<string>("teram_shehr");
  const selectedSite = GLACIER_SITES[selectedSiteId] || GLACIER_SITES.teram_shehr;

  // 4. Timeline Scrubber & Automated Playback
  const [epochYear, setEpochYear] = useState<number>(2026.8);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [compareMode, setCompareMode] = useState<"none" | "t12" | "baseline20">("none");

  // 5. Alert Filters
  const [alertFilter, setAlertFilter] = useState<"all" | "high" | "watch">("all");

  // 6. Telemetry Streaming Simulation
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [feedCategory, setFeedCategory] = useState<string>("all");
  const [feedItems, setFeedItems] = useState<TelemetryItem[]>(INITIAL_TELEMETRY);

  // 7. Interactive Map Overlays
  const [showBasinPolygons, setShowBasinPolygons] = useState<boolean>(true);
  const [showFlowVectors, setShowFlowVectors] = useState<boolean>(true);

  // Timeline Auto-play Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setEpochYear((prev) => {
          const next = Number((prev + 0.1).toFixed(1));
          return next > 2026.8 ? 2024.0 : next;
        });
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Periodic Telemetry Simulation
  useEffect(() => {
    if (!isStreaming) return;
    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().substring(0, 5);
      const randomSources = ["ESA SAR", "USGS", "CV ENGINE", "HARMONY"];
      const randomSource = randomSources[Math.floor(Math.random() * randomSources.length)];
      const newItem: TelemetryItem = {
        id: Date.now().toString(),
        time: timeStr,
        source: randomSource,
        sourceType: randomSource === "USGS" ? "usgs" : randomSource === "ESA SAR" ? "esa" : "cv",
        title: `${randomSource} Telemetry Sync`,
        description: `Ingested ${Math.floor(Math.random() * 80 + 20)}MB raw raster slice for Siachen Grid UTM 43N.`,
      };
      setFeedItems((prev) => [newItem, ...prev.slice(0, 7)]);
    }, 12000);
    return () => clearInterval(timer);
  }, [isStreaming]);

  // Mouse Handlers for Map Dragging
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

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const focusSite = (siteId: string) => {
    setSelectedSiteId(siteId);
    const site = GLACIER_SITES[siteId];
    if (site && mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect();
      const targetX = (site.focalPoint.x / 800) * rect.width;
      const targetY = (site.focalPoint.y / 500) * rect.height;
      setZoom(1.4);
      setPan({
        x: rect.width / 2 - targetX * 1.4,
        y: rect.height / 2 - targetY * 1.4,
      });
    }
  };

  const filteredFeeds = feedItems.filter((item) => {
    if (feedCategory === "all") return true;
    if (feedCategory === "satellite") return item.sourceType === "usgs" || item.sourceType === "esa";
    if (feedCategory === "cv") return item.sourceType === "cv";
    if (feedCategory === "alert") return item.sourceType === "alert";
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-52px)] overflow-hidden p-3.5 bg-[#080c14] text-slate-200 select-none">
      {/* MAIN WORKSPACE: GEOSPATIAL INTELLIGENCE MAP (68-70%) & OBSERVATION FEED (30-32%) */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-3.5 h-full min-h-0 overflow-hidden">
        {/* LEFT: EXPANSIVE GEOSPATIAL MAP CANVAS (COL-SPAN-8) */}
        <div className="xl:col-span-8 flex flex-col h-full min-h-0 rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden relative shadow-xl backdrop-blur-md">
          {/* Floating Map Top Control Bar */}
          <div className="absolute top-3.5 left-3.5 right-3.5 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
            {/* Layer Switcher Pills */}
            <div className="pointer-events-auto flex items-center p-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-700/60 shadow-lg gap-1">
              <button
                onClick={() => setActiveLayer("sar")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeLayer === "sar"
                    ? "bg-sky-500 text-white shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">radar</span>
                <span>SAR Coherence</span>
              </button>

              <button
                onClick={() => setActiveLayer("optical")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeLayer === "optical"
                    ? "bg-sky-500 text-white shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">satellite_alt</span>
                <span>Optical RGB</span>
              </button>

              <button
                onClick={() => setActiveLayer("dem")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeLayer === "dem"
                    ? "bg-sky-500 text-white shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">layers</span>
                <span>Elevation DEM</span>
              </button>

              <button
                onClick={() => setActiveLayer("thermal")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeLayer === "thermal"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">device_thermostat</span>
                <span>Thermal IR</span>
              </button>

              <div className="w-px h-4 bg-slate-700 mx-0.5" />

              <button
                onClick={() => setShowFlowVectors(!showFlowVectors)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  showFlowVectors
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Toggle Flow Vectors"
              >
                <span className="material-symbols-outlined text-[14px]">trending_flat</span>
                <span>Vectors</span>
              </button>

              <button
                onClick={() => setShowBasinPolygons(!showBasinPolygons)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  showBasinPolygons
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Toggle Basin Masks"
              >
                <span className="material-symbols-outlined text-[14px]">water_drop</span>
                <span>Basins</span>
              </button>
            </div>

            {/* Map View Coordinates & Zoom HUD */}
            <div className="pointer-events-auto flex items-center gap-2">
              <div className="flex items-center px-3 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-700/60 shadow-lg text-xs font-mono text-slate-300">
                <span className="text-sky-400 mr-2 font-medium">Siachen Basin</span>
                <span className="text-slate-500 mr-2">|</span>
                <span className="text-slate-200">{selectedSite.elevation}</span>
              </div>

              <div className="flex items-center rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-700/60 shadow-lg p-1 text-slate-300">
                <button
                  onClick={() => setZoom((prev) => Math.min(prev * 1.25, 3.5))}
                  className="w-7 h-7 flex items-center justify-center hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                  title="Zoom In"
                >
                  <span className="material-symbols-outlined text-[17px]">add</span>
                </button>
                <button
                  onClick={() => setZoom((prev) => Math.max(prev * 0.8, 0.75))}
                  className="w-7 h-7 flex items-center justify-center hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                  title="Zoom Out"
                >
                  <span className="material-symbols-outlined text-[17px]">remove</span>
                </button>
                <div className="w-px h-4 bg-slate-700 mx-0.5" />
                <button
                  onClick={resetView}
                  className="w-7 h-7 flex items-center justify-center hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                  title="Reset View"
                >
                  <span className="material-symbols-outlined text-[17px]">center_focus_strong</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Satellite Canvas with Pan & Zoom */}
          <div
            ref={mapRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            className={`relative w-full flex-1 min-h-[440px] bg-[#050810] flex items-center justify-center overflow-hidden ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            <div
              className="relative w-full h-full origin-center transition-transform duration-75 ease-out"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              }}
            >
              {/* Satellite Orthomosaic Texture */}
              <div
                className={`absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-500 ${
                  activeLayer === "sar"
                    ? "opacity-55 saturate-150 contrast-125 filter hue-rotate-15"
                    : activeLayer === "dem"
                    ? "opacity-60 saturate-50 contrast-150 filter invert"
                    : activeLayer === "thermal"
                    ? "opacity-55 saturate-200 contrast-125 filter hue-rotate-90"
                    : "opacity-50 mix-blend-luminosity"
                }`}
                style={{
                  backgroundImage: `url('/images/glof-valley-sat.jpg')`,
                }}
              />

              {/* Refined Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/50 pointer-events-none" />

              {/* Crisp SVG Vector Overlay */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                preserveAspectRatio="xMidYMid slice"
                viewBox="0 0 800 500"
              >
                <defs>
                  <linearGradient id="teramGradClean" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#0369a1" stopOpacity="0.4" />
                  </linearGradient>
                  <linearGradient id="siachenGradClean" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {/* ICESat-2 Ground Track */}
                <line
                  opacity="0.35"
                  stroke="#38bdf8"
                  strokeDasharray="4,6"
                  strokeWidth="1.2"
                  x1="80"
                  x2="720"
                  y1="20"
                  y2="480"
                />
                <text
                  fill="#38bdf8"
                  fontFamily="Space Grotesk, monospace"
                  fontSize="10"
                  opacity="0.6"
                  x="600"
                  y="420"
                >
                  ICESat-2 Track #0721 [ATL06]
                </text>

                {/* SIACHEN GLACIER MAIN SERPENTINE TRUNK */}
                <g
                  onClick={() => focusSite("siachen_trunk")}
                  className="pointer-events-auto cursor-pointer group"
                >
                  <path
                    className="transition-all duration-300 group-hover:stroke-sky-300 group-hover:fill-opacity-40"
                    d="M 330,80 Q 370,160 380,240 T 360,340 T 325,430 L 290,420 Q 320,330 330,240 T 300,100 Z"
                    fill="url(#siachenGradClean)"
                    stroke="#38bdf8"
                    strokeDasharray="6,4"
                    strokeWidth="1.8"
                  />

                  {showFlowVectors && (
                    <>
                      <path
                        d="M 345,210 L 348,245 M 348,245 L 343,238 M 348,245 L 353,238"
                        stroke="#38bdf8"
                        strokeLinecap="round"
                        strokeWidth="2"
                        className="animate-pulse"
                      />
                      <path
                        d="M 350,300 L 346,335 M 346,335 L 341,328 M 346,335 L 351,328"
                        stroke="#38bdf8"
                        strokeLinecap="round"
                        strokeWidth="2"
                        className="animate-pulse"
                      />
                    </>
                  )}

                  <circle cx="340" cy="180" fill="#38bdf8" r="4" />
                  <circle
                    cx="340"
                    cy="180"
                    fill="none"
                    opacity="0.5"
                    r="10"
                    stroke="#38bdf8"
                    strokeWidth="1.2"
                  />
                </g>

                {/* TERAM SHEHR TRIBUTARY & SUBGLACIAL RESERVOIR */}
                {showBasinPolygons && (
                  <g
                    onClick={() => focusSite("teram_shehr")}
                    className="pointer-events-auto cursor-pointer group"
                  >
                    <path
                      d="M 450,230 Q 530,240 590,220 T 660,260 T 630,315 L 500,320 T 440,280 Z"
                      fill="#f43f5e"
                      fillOpacity="0.1"
                      stroke="#f43f5e"
                      strokeDasharray="4,4"
                      strokeWidth="1.5"
                    />

                    <path
                      d="M 465,255 C 490,245 520,248 540,262 C 555,275 545,298 520,304 C 490,310 460,300 455,278 Z"
                      fill="url(#teramGradClean)"
                      stroke="#0ea5e9"
                      strokeWidth="1.8"
                    />

                    <circle cx="455" cy="275" fill="#f43f5e" r="5" />
                    <circle
                      className="animate-ping"
                      cx="455"
                      cy="275"
                      fill="none"
                      opacity="0.8"
                      r="14"
                      stroke="#f43f5e"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="455"
                      cy="275"
                      fill="none"
                      opacity="0.4"
                      r="24"
                      stroke="#f43f5e"
                      strokeDasharray="3,3"
                      strokeWidth="1"
                    />
                  </g>
                )}

                {/* SALTORO RIDGE SERAC WALL */}
                <g
                  onClick={() => focusSite("saltoro_ridge")}
                  className="pointer-events-auto cursor-pointer group"
                >
                  <path
                    d="M 170,100 Q 190,160 195,230 T 185,320 L 160,310 Q 170,230 165,150 Z"
                    fill="#f59e0b"
                    fillOpacity="0.12"
                    stroke="#f59e0b"
                    strokeDasharray="5,4"
                    strokeWidth="1.5"
                  />
                  <ellipse
                    cx="180"
                    cy="250"
                    fill="#0284c7"
                    rx="9"
                    ry="6"
                    stroke="#38bdf8"
                    strokeWidth="1"
                  />
                  <circle cx="182" cy="180" fill="#f59e0b" r="4" />
                </g>

                {/* NUBRA VALLEY SNOUT */}
                <g
                  onClick={() => focusSite("nubra_snout")}
                  className="pointer-events-auto cursor-pointer group"
                >
                  <circle cx="310" cy="430" fill="#38bdf8" r="4" />
                  <path
                    d="M 310,430 Q 320,460 300,490"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeDasharray="3,3"
                  />
                </g>
              </svg>

              {/* Minimal Clean Site Badges */}
              <div
                onClick={() => focusSite("saltoro_ridge")}
                className="absolute left-[18%] top-[34%] pointer-events-auto cursor-pointer group"
              >
                <div
                  className={`flex items-center gap-2 px-2.5 py-1 rounded-lg backdrop-blur-md border shadow-md transition-all ${
                    selectedSiteId === "saltoro_ridge"
                      ? "bg-amber-500/20 border-amber-400 ring-1 ring-amber-400/50"
                      : "bg-slate-950/85 border-amber-500/40 hover:bg-slate-900"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-xs font-medium text-slate-200">Saltoro Hanging Wall</span>
                  <span className="text-[10px] font-mono text-amber-400">420k m³ Hazard</span>
                </div>
              </div>

              <div
                onClick={() => focusSite("siachen_trunk")}
                className="absolute left-[38%] top-[22%] pointer-events-auto cursor-pointer group"
              >
                <div
                  className={`flex items-center gap-2 px-2.5 py-1 rounded-lg backdrop-blur-md border shadow-md transition-all ${
                    selectedSiteId === "siachen_trunk"
                      ? "bg-sky-500/20 border-sky-400 ring-1 ring-sky-400/50"
                      : "bg-slate-950/85 border-sky-500/40 hover:bg-slate-900"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  <span className="text-xs font-medium text-slate-200">Siachen Trunk [SC-01]</span>
                  <span className="text-[10px] font-mono text-slate-400">Flow: 0.28 m/d</span>
                </div>
              </div>
            </div>

            {/* Sleek Floating Site Inspector Card (Bottom-Right HUD) */}
            <div className="absolute right-4 bottom-4 z-20 w-76 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-700/70 p-4 shadow-2xl transition-all">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      selectedSite.status === "critical"
                        ? "bg-rose-500 animate-pulse"
                        : selectedSite.status === "warning"
                        ? "bg-amber-400"
                        : "bg-sky-400"
                    }`}
                  />
                  <span className="font-medium text-xs text-white truncate max-w-[140px]">
                    {selectedSite.name}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-semibold font-mono ${
                    selectedSite.status === "critical"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : selectedSite.status === "warning"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                  }`}
                >
                  {selectedSite.statusLabel}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 mb-3">
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex flex-col">
                  <span className="text-[9px] text-slate-400 uppercase font-medium">Vol / Storage</span>
                  <span className="text-xs font-mono font-bold text-white mt-0.5">{selectedSite.volume}</span>
                  <span className="text-[9px] font-mono text-rose-400">{selectedSite.volumeTrend}</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex flex-col">
                  <span className="text-[9px] text-slate-400 uppercase font-medium">Displacement</span>
                  <span className="text-xs font-mono font-bold text-sky-400 mt-0.5">
                    {selectedSite.displacement}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">InSAR Verified</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                {selectedSite.description}
              </p>

              <div className="flex items-center gap-2">
                <Link
                  href="/investigate"
                  className="flex-1 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-medium text-center transition-all shadow-sm flex items-center justify-center gap-1"
                >
                  <span>Investigate Site</span>
                  <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                </Link>
                <Link
                  href="/glof-modeling"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
                  title="Hazard Simulation"
                >
                  GLOF Sim
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Time-Scrubber Timeline Strip */}
          <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800/80 flex items-center gap-4 z-20 shrink-0">
            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-full bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-400 flex items-center justify-center transition-all shadow-sm active:scale-95"
              title={isPlaying ? "Pause Playback" : "Play Epoch Timeline"}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isPlaying ? "pause" : "play_arrow"}
              </span>
            </button>

            {/* Date Range Labels */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">Jan 2024</span>
              <span className="text-slate-600">/</span>
              <span className="text-sky-300 font-semibold">
                {epochYear >= 2026.5
                  ? "Sep 2026 (Live)"
                  : epochYear >= 2025.5
                  ? `Jun ${Math.floor(epochYear)}`
                  : `Jan ${Math.floor(epochYear)}`}
              </span>
            </div>

            {/* Scrubber Slider */}
            <div className="flex-1 relative flex items-center">
              <input
                type="range"
                min="2024.0"
                max="2026.8"
                step="0.1"
                value={epochYear}
                onChange={(e) => {
                  setEpochYear(parseFloat(e.target.value));
                  if (isPlaying) setIsPlaying(false);
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            {/* Comparison Presets */}
            <div className="flex items-center gap-1 bg-slate-900/90 px-1.5 py-1 rounded-lg border border-slate-800 text-xs font-mono">
              <span className="text-slate-400 px-1 text-[11px]">Compare:</span>
              <button
                onClick={() => setCompareMode(compareMode === "t12" ? "none" : "t12")}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  compareMode === "t12"
                    ? "bg-sky-500 text-white"
                    : "bg-slate-800 text-slate-300 hover:text-white"
                }`}
              >
                T-12 Mo
              </button>
              <button
                onClick={() => setCompareMode(compareMode === "baseline20" ? "none" : "baseline20")}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  compareMode === "baseline20"
                    ? "bg-sky-500 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Baseline '20
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: OBSERVATION & ADVISORY PANEL (COL-SPAN-4) */}
        <div className="xl:col-span-4 flex flex-col gap-4 overflow-hidden">
          {/* ACTIVE ALERTS SECTION (PALANTIR-STYLE CLEAN ACCENT CARDS) */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[17px] text-rose-400">
                  crisis_alert
                </span>
                <span className="font-heading text-sm font-semibold text-white">
                  Environmental Advisories
                </span>
              </div>

              {/* Alert Filter Tabs */}
              <div className="flex items-center gap-1 text-[10px] font-mono">
                <button
                  onClick={() => setAlertFilter("all")}
                  className={`px-2 py-0.5 rounded ${
                    alertFilter === "all"
                      ? "bg-slate-800 text-white font-medium"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  All (4)
                </button>
                <button
                  onClick={() => setAlertFilter("high")}
                  className={`px-2 py-0.5 rounded ${
                    alertFilter === "high"
                      ? "bg-rose-500/20 text-rose-300 font-medium"
                      : "text-slate-400 hover:text-rose-300"
                  }`}
                >
                  High (1)
                </button>
                <button
                  onClick={() => setAlertFilter("watch")}
                  className={`px-2 py-0.5 rounded ${
                    alertFilter === "watch"
                      ? "bg-amber-500/20 text-amber-300 font-medium"
                      : "text-slate-400 hover:text-amber-300"
                  }`}
                >
                  Watch (2)
                </button>
              </div>
            </div>

            {/* Card 1: Critical - Teram Shehr */}
            {(alertFilter === "all" || alertFilter === "high") && (
              <div
                onClick={() => focusSite("teram_shehr")}
                className={`p-3.5 rounded-xl bg-slate-900/60 border transition-all flex flex-col gap-2 shadow-sm relative overflow-hidden cursor-pointer backdrop-blur-md ${
                  selectedSiteId === "teram_shehr"
                    ? "border-rose-500 ring-1 ring-rose-500/60"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-rose-500" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[9px] font-mono font-bold">
                      HIGH ADVISORY
                    </span>
                    <span className="text-xs font-semibold text-white">
                      Teram Shehr Subglacial Basin
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">14m ago</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Multiple moraine structural integrity thresholds exceeded. Proglacial melt volume reached historical seasonal high.
                </p>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 my-0.5">
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[9px] text-slate-400 uppercase block font-medium">
                      Lake Expansion
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-400">
                      +42.0% Volume
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[9px] text-slate-400 uppercase block font-medium">
                      Moraine Deficit
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-400">
                      -2.8m (ICESat-2)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">Early Warning: Stage 2</span>
                  <Link
                    href="/investigate"
                    className="flex items-center gap-1 text-[11px] font-medium text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    <span>Investigate Site</span>
                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Card 2: Warning - Saltoro Hanging Wall */}
            {(alertFilter === "all" || alertFilter === "watch") && (
              <div
                onClick={() => focusSite("saltoro_ridge")}
                className={`p-3.5 rounded-xl bg-slate-900/60 border transition-all flex flex-col gap-2 shadow-sm relative overflow-hidden cursor-pointer backdrop-blur-md ${
                  selectedSiteId === "saltoro_ridge"
                    ? "border-amber-500 ring-1 ring-amber-500/60"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-500" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold">
                      WATCH
                    </span>
                    <span className="text-xs font-semibold text-white">Saltoro Hanging Wall</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">48m ago</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Crevasse cleavage widening along 420,000 m³ hanging serac ice mass. Flow acceleration +112% relative to 2024 SAR baseline.
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono text-amber-400">Dam Factor: 1.14 Marginal</span>
                  <Link
                    href="/investigate"
                    className="flex items-center gap-1 text-[11px] font-medium text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    <span>Investigate Site</span>
                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* LIVE ACTIVITY & SENSOR INGEST FEED */}
          <div className="flex-1 flex flex-col rounded-xl bg-slate-900/60 border border-slate-800 p-4 overflow-hidden shadow-sm min-h-[220px] backdrop-blur-md">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80 mb-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[17px] text-sky-400">
                  dynamic_feed
                </span>
                <span className="font-heading text-xs font-semibold text-white">
                  Live Telemetry &amp; Ingest
                </span>
              </div>

              {/* Streaming Toggle */}
              <button
                onClick={() => setIsStreaming(!isStreaming)}
                className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${
                    isStreaming ? "animate-pulse" : "opacity-40"
                  }`}
                />
                <span>{isStreaming ? "Streaming" : "Paused"}</span>
              </button>
            </div>

            {/* Stream Filter Pills */}
            <div className="flex items-center gap-1 mb-2 pb-1.5 border-b border-slate-800/40 text-[9px] font-mono overflow-x-auto shrink-0">
              {["all", "satellite", "cv", "alert"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFeedCategory(cat)}
                  className={`px-2 py-0.5 rounded capitalize ${
                    feedCategory === cat
                      ? "bg-slate-800 text-white font-medium"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Feed Items */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
              {filteredFeeds.map((item) => (
                <div key={item.id} className="flex items-start gap-2.5">
                  <span className="text-[10px] font-mono text-slate-500 mt-0.5 shrink-0">
                    {item.time}
                  </span>
                  <div className="flex-1 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] font-medium text-slate-200">{item.title}</span>
                      <span
                        className={`text-[8px] font-mono px-1.5 py-0.2 rounded ${
                          item.sourceType === "alert"
                            ? "bg-rose-500/20 text-rose-300"
                            : item.sourceType === "cv"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {item.source}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
