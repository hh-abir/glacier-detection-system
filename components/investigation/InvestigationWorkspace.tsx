"use client";

import React, { useState, useEffect, useRef } from "react";

interface TargetTriage {
  id: string;
  name: string;
  code: string;
  severity: "crit" | "warn" | "watch" | "normal";
  severityLabel: string;
  metric: string;
  description: string;
  area: string;
  areaChange: string;
  volume: string;
  deficit: string;
  deficitPct: number;
  focalCoords: { x: number; y: number };
}

const TRIAGE_ITEMS: TargetTriage[] = [
  {
    id: "siachen_central",
    name: "Siachen Central Crevasse Zone",
    code: "SC-01-CENTRAL",
    severity: "crit",
    severityLabel: "CRITICAL",
    metric: "+3.8m Crevasse Opening",
    description: "Transverse crevasse field expansion detected via Sentinel-1 InSAR coherence loss.",
    area: "712 km² (76km)",
    areaChange: "+3.8% Surge",
    volume: "340",
    deficit: "High Basal Shear Stress (FS 1.08)",
    deficitPct: 88,
    focalCoords: { x: 420, y: 310 },
  },
  {
    id: "saltoro_avalanche",
    name: "Saltoro West Ridge Ice Wall",
    code: "SR-09-WALL",
    severity: "crit",
    severityLabel: "CRITICAL",
    metric: "420,000 m³ Hanging Serac",
    description: "Overhanging serac instability along Bilafond ridge. Acoustic cryoseismic signature elevated.",
    area: "94.2",
    areaChange: "-2.8%",
    volume: "28.5",
    deficit: "Impending Serac Calving Event",
    deficitPct: 92,
    focalCoords: { x: 260, y: 390 },
  },
  {
    id: "teram_shehr",
    name: "Teram Shehr Confluence",
    code: "TS-03-JUNCTION",
    severity: "warn",
    severityLabel: "WARNING",
    metric: "0.48 m/d Surge Thrust",
    description: "Tributary ice surge forcing lateral displacement onto main Siachen trunk.",
    area: "185.0",
    areaChange: "+1.12%",
    volume: "84.0",
    deficit: "+12.2 cm/yr Moraine Deflection",
    deficitPct: 65,
    focalCoords: { x: 580, y: 220 },
  },
  {
    id: "indira_col",
    name: "Indira Col Accumulation Head",
    code: "IC-00-HEAD",
    severity: "watch",
    severityLabel: "WATCH",
    metric: "5,753m Firn Balance",
    description: "ICESat-2 ATL06 photon elevation transect confirms steady accumulation basin.",
    area: "48.6",
    areaChange: "+0.4%",
    volume: "52.0",
    deficit: "Permafrost Stable",
    deficitPct: 25,
    focalCoords: { x: 265, y: 65 },
  },
  {
    id: "nubra_snout",
    name: "Nubra Terminal Moraine Snout",
    code: "NB-01-SNOUT",
    severity: "normal",
    severityLabel: "NORMAL",
    metric: "3,620m a.s.l.",
    description: "Subglacial melt outflow into Nubra River within seasonal hydro bounds.",
    area: "14.2",
    areaChange: "-0.2%",
    volume: "8.4",
    deficit: "Nominal Discharge Flow",
    deficitPct: 15,
    focalCoords: { x: 340, y: 565 },
  },
];

export default function InvestigationWorkspace() {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom Engine State
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Real-time cursor coordinates in Siachen (35°N, 77°E)
  const [cursorCoords, setCursorCoords] = useState<{
    lat: string;
    lon: string;
    elev: string;
  }>({
    lat: `35°28'15"N`,
    lon: `77°06'10"E`,
    elev: `5,420m ASL`,
  });

  // Measuring Tool State
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const [measurePoints, setMeasurePoints] = useState<{ x: number; y: number }[]>([]);

  // Split Swipe Comparison Tool State
  const [comparisonMode, setComparisonMode] = useState<string>("split");
  const [splitPos, setSplitPos] = useState<number>(50);

  // Spectral Mode State
  const [spectralMode, setSpectralMode] = useState<string>("optical");

  // Drawers collapse states
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState<boolean>(true);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState<boolean>(true);

  // Selected Target & Popover
  const [selectedTarget, setSelectedTarget] = useState<TargetTriage>(TRIAGE_ITEMS[0]);
  const [isHudOpen, setIsHudOpen] = useState<boolean>(true);
  const [hoveredGlacier, setHoveredGlacier] = useState<string | null>(null);

  // Severity filter
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  // Layer toggles and opacities
  const [layerGlaciers, setLayerGlaciers] = useState<boolean>(true);
  const [opacityGlaciers, setOpacityGlaciers] = useState<number>(85);

  const [layerCrevasses, setLayerCrevasses] = useState<boolean>(true);
  const [opacityCrevasses, setOpacityCrevasses] = useState<number>(100);

  const [layerInSAR, setLayerInSAR] = useState<boolean>(true);
  const [opacityInSAR, setOpacityInSAR] = useState<number>(65);

  const [layerICESat, setLayerICESat] = useState<boolean>(true);
  const [opacityICESat, setOpacityICESat] = useState<number>(90);

  const [layerDEM, setLayerDEM] = useState<boolean>(false);

  // Timeline scrubber
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [scrubberProgress, setScrubberProgress] = useState<number>(100);
  const [speedMultiplier, setSpeedMultiplier] = useState<string>("1x");

  // Auto playback
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setScrubberProgress((prev) => (prev >= 100 ? 0 : prev + 2));
    }, 300);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle Mouse Move for Pan & Coordinate Tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;

    const latDeg = 35.58 - relY * 0.42;
    const lonDeg = 76.85 + relX * 0.45;
    const calculatedElev = Math.round(3620 + (1 - relY) * 2133);

    const latMin = Math.floor((latDeg % 1) * 60);
    const latSec = Math.floor((((latDeg % 1) * 60) % 1) * 60);
    const lonMin = Math.floor((lonDeg % 1) * 60);
    const lonSec = Math.floor((((lonDeg % 1) * 60) % 1) * 60);

    setCursorCoords({
      lat: `35°${latMin.toString().padStart(2, "0")}'${latSec.toString().padStart(2, "0")}"N`,
      lon: `77°${lonMin.toString().padStart(2, "0")}'${lonSec.toString().padStart(2, "0")}"E`,
      elev: `${calculatedElev.toLocaleString()}m ASL`,
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMeasuring) {
      if (!mapContainerRef.current) return;
      const rect = mapContainerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left - pan.x) / zoom) * (1000 / rect.width);
      const y = ((e.clientY - rect.top - pan.y) / zoom) * (800 / rect.height);

      if (measurePoints.length >= 2) {
        setMeasurePoints([{ x, y }]);
      } else {
        setMeasurePoints([...measurePoints, { x, y }]);
      }
      return;
    }

    setIsDragging(true);
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.75), 4.5));
  };

  const focusOnTarget = (item: TargetTriage) => {
    setSelectedTarget(item);
    setIsHudOpen(true);

    if (mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      const targetScreenX = (item.focalCoords.x / 1000) * rect.width;
      const targetScreenY = (item.focalCoords.y / 800) * rect.height;

      setZoom(1.6);
      setPan({
        x: rect.width / 2 - targetScreenX * 1.6,
        y: rect.height / 2 - targetScreenY * 1.6,
      });
    }
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setMeasurePoints([]);
    setIsMeasuring(false);
  };

  const calculateDistance = () => {
    if (measurePoints.length < 2) return null;
    const p1 = measurePoints[0];
    const p2 = measurePoints[1];
    const dx = (p2.x - p1.x) * 76; // meters per SVG unit estimate on 76km scale
    const dy = (p2.y - p1.y) * 76;
    const distMeters = Math.round(Math.sqrt(dx * dx + dy * dy));
    return distMeters >= 1000 ? `${(distMeters / 1000).toFixed(2)} km` : `${distMeters} m`;
  };

  const getSpectralFilter = () => {
    switch (spectralMode) {
      case "sar":
        return "grayscale(100%) contrast(175%) brightness(85%)";
      case "dem":
        return "hue-rotate(90deg) saturate(220%) contrast(130%)";
      case "insar":
        return "hue-rotate(190deg) saturate(180%) contrast(125%)";
      case "thermal":
        return "invert(100%) hue-rotate(180deg) saturate(200%) contrast(140%)";
      case "optical":
      default:
        return "saturate(85%) brightness(0.68) contrast(1.18)";
    }
  };

  const filteredTriage = TRIAGE_ITEMS.filter((item) => {
    if (severityFilter === "all") return true;
    return item.severity === severityFilter;
  });

  return (
    <div className="relative w-full h-[calc(100vh-3rem)] overflow-hidden select-none bg-surface-container-lowest">
      {/* 1. PRIMARY MAP CANVAS */}
      <div
        ref={mapContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`absolute inset-0 w-full h-full overflow-hidden ${
          isMeasuring
            ? "cursor-crosshair"
            : isDragging
            ? "cursor-grabbing"
            : "cursor-grab"
        }`}
      >
        <div
          className="relative w-full h-full origin-center transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {/* Base Layer */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-500"
            style={{
              backgroundImage: `url('/images/imja-lake-sat.jpg')`,
              filter: getSpectralFilter(),
            }}
          />

          {/* Split Swipe Comparison */}
          {comparisonMode === "split" && (
            <div
              className="absolute inset-0 overflow-hidden border-r-2 border-secondary shadow-[0_0_15px_rgba(78,222,163,0.5)] pointer-events-none"
              style={{ width: `${splitPos}%` }}
            >
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center filter grayscale contrast-125"
                style={{
                  width: `${mapContainerRef.current ? mapContainerRef.current.clientWidth : 1200}px`,
                  backgroundImage: `url('/images/khumbu-sat.jpg')`,
                }}
              />
              <div className="absolute top-16 left-4 px-2 py-0.5 bg-surface-container-lowest/90 border border-outline-variant/50 text-secondary font-mono text-[9px] uppercase">
                SIACHEN RADAR BASELINE: OCT 2021
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-surface-container-lowest/80 pointer-events-none" />
          <div className="absolute inset-0 bg-radial from-transparent via-surface-container-lowest/30 to-surface-container-lowest/90 pointer-events-none" />

          {/* GEOSPATIAL VECTOR OVERLAYS (SIACHEN 76KM TRANSECT) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-auto"
            viewBox="0 0 1000 800"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glow-red" x="-25%" y="-25%" width="150%" height="150%">
                <feGaussianBlur stdDeviation="4.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="siachenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c4e7ff" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#7bd0ff" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            {/* Cartographic Grid */}
            <g opacity="0.35" stroke="#3e484f" strokeWidth="0.75" strokeDasharray="3 7">
              <line x1="20%" y1="0" x2="20%" y2="100%" />
              <line x1="40%" y1="0" x2="40%" y2="100%" />
              <line x1="60%" y1="0" x2="60%" y2="100%" />
              <line x1="80%" y1="0" x2="80%" y2="100%" />
              <line x1="0" y1="25%" x2="100%" y2="25%" />
              <line x1="0" y1="50%" x2="100%" y2="50%" />
              <line x1="0" y1="75%" x2="100%" y2="75%" />
            </g>

            {/* Siachen Main Serpentine Ribbon */}
            {layerGlaciers && (
              <g
                opacity={opacityGlaciers / 100}
                className="transition-opacity cursor-pointer group"
                onClick={() => focusOnTarget(TRIAGE_ITEMS[0])}
                onMouseEnter={() => setHoveredGlacier("Siachen Central Trunk")}
                onMouseLeave={() => setHoveredGlacier(null)}
              >
                <path
                  d="M 320,80 Q 380,160 420,240 T 480,380 T 520,520 T 460,650 T 390,750 L 340,740 Q 420,630 450,510 T 400,360 T 350,230 T 290,90 Z"
                  fill="url(#siachenGrad)"
                  stroke="#8ed5ff"
                  strokeWidth="2.2"
                />

                <circle cx="305" cy="85" r="5" fill="#ffffff" stroke="#00354a" strokeWidth="2" />
                <text x="240" y="75" fill="#c4e7ff" className="font-mono text-[10px] font-bold">
                  INDIRA COL [5,753m]
                </text>

                <circle cx="365" cy="745" r="5" fill="#38bdf8" />
                <text x="380" y="750" fill="#38bdf8" className="font-mono text-[10px] font-bold">
                  NUBRA RIVER SNOUT [3,620m]
                </text>
              </g>
            )}

            {/* Saltoro Ridge Crevasse Hazard Zone */}
            {layerCrevasses && (
              <g
                opacity={opacityCrevasses / 100}
                className="transition-opacity cursor-pointer group"
                onClick={() => focusOnTarget(TRIAGE_ITEMS[1])}
                onMouseEnter={() => setHoveredGlacier("Saltoro West Ridge Ice Wall")}
                onMouseLeave={() => setHoveredGlacier(null)}
              >
                <path
                  d="M 220,380 Q 280,420 340,460 T 440,490 L 430,520 Q 330,500 260,460 T 190,400 Z"
                  fill="#ffb4ab"
                  fillOpacity="0.3"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  filter="url(#glow-red)"
                />
                <circle cx="260" cy="390" r="6" fill="#ef4444" className="animate-ping" />
                <text x="180" y="470" fill="#ffb4ab" className="font-mono text-[11px] font-bold tracking-wider">
                  SALTORO CREVASSE ZONE [SR-09]
                </text>
              </g>
            )}

            {/* Teram Shehr Confluence */}
            {layerInSAR && (
              <g
                opacity={opacityInSAR / 100}
                className="transition-opacity cursor-pointer group"
                onClick={() => focusOnTarget(TRIAGE_ITEMS[2])}
                onMouseEnter={() => setHoveredGlacier("Teram Shehr Confluence")}
                onMouseLeave={() => setHoveredGlacier(null)}
              >
                <path
                  d="M 780,240 Q 690,270 590,310 T 480,380 L 460,350 Q 570,290 670,250 T 760,220 Z"
                  fill="#38bdf8"
                  fillOpacity="0.25"
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                />
                <text x="640" y="270" fill="#38bdf8" className="font-mono text-[10px] font-semibold">
                  TERAM SHEHR TRIBUTARY
                </text>
              </g>
            )}

            {/* ICESat-2 Karakoram Transect */}
            {layerICESat && (
              <g opacity={opacityICESat / 100} className="transition-opacity pointer-events-none">
                <line x1="180" y1="20" x2="820" y2="760" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="6 4" />
                <circle cx="480" cy="380" r="4.5" fill="#8ed5ff" filter="url(#glow-cyan)" />
                <text x="680" y="650" fill="#38bdf8" className="font-mono text-[9px] uppercase tracking-wider">
                  ICESat-2 ATL06 [TRACK #0721]
                </text>
              </g>
            )}

            {/* Measurement Line */}
            {isMeasuring && measurePoints.length > 0 && (
              <g className="pointer-events-none">
                {measurePoints.map((pt, i) => (
                  <circle key={i} cx={pt.x} cy={pt.y} r="5" fill="#4edea3" stroke="#ffffff" strokeWidth="1.5" />
                ))}
                {measurePoints.length === 2 && (
                  <>
                    <line
                      x1={measurePoints[0].x}
                      y1={measurePoints[0].y}
                      x2={measurePoints[1].x}
                      y2={measurePoints[1].y}
                      stroke="#4edea3"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    <rect
                      x={(measurePoints[0].x + measurePoints[1].x) / 2 - 40}
                      y={(measurePoints[0].y + measurePoints[1].y) / 2 - 16}
                      width="80"
                      height="20"
                      rx="4"
                      fill="#0a0e14"
                      stroke="#4edea3"
                      strokeWidth="1"
                    />
                    <text
                      x={(measurePoints[0].x + measurePoints[1].x) / 2}
                      y={(measurePoints[0].y + measurePoints[1].y) / 2 - 2}
                      fill="#4edea3"
                      textAnchor="middle"
                      className="font-mono text-[10px] font-bold"
                    >
                      {calculateDistance()}
                    </text>
                  </>
                )}
              </g>
            )}
          </svg>
        </div>

        {/* Dynamic Hover Tooltip */}
        {hoveredGlacier && (
          <div className="absolute pointer-events-none px-2.5 py-1 bg-surface-container-lowest/90 backdrop-blur-md border border-primary text-primary font-mono text-[11px] rounded shadow-lg top-16 left-1/2 -translate-x-1/2 z-30">
            SIACHEN SECTOR: {hoveredGlacier} [CLICK TO INSPECT]
          </div>
        )}

        {/* 2. OBJECT HUD POPOVER */}
        {isHudOpen && (
          <div className="absolute left-[38%] top-[18%] w-96 bg-surface-container/95 backdrop-blur-xl rounded-xl shadow-2xl p-space-md z-30 transition-all border border-outline-variant/40">
            <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-error to-transparent" />

            <div className="flex items-start justify-between gap-space-sm mb-space-sm">
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2 h-2 rounded-full bg-error animate-ping" />
                  <span className="font-label-md text-[10px] text-error uppercase tracking-wider font-semibold">
                    {selectedTarget.severityLabel} RISK • SIACHEN RADAR
                  </span>
                </div>
                <h2 className="font-headline-sm text-[15px] text-on-surface font-semibold tracking-tight mt-0.5">
                  {selectedTarget.name} ({selectedTarget.code})
                </h2>
                <span className="font-body-sm text-[11px] text-outline">
                  Karakoram Range • Nubra Basin Drainage
                </span>
              </div>
              <button
                onClick={() => setIsHudOpen(false)}
                className="text-outline hover:text-on-surface transition-colors p-1 rounded-lg hover:bg-surface-variant"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-space-xs mb-space-md">
              <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col">
                <span className="font-label-sm text-[9px] text-outline uppercase tracking-wider">
                  Surface Area
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-[17px] font-bold font-mono text-on-surface">
                    {selectedTarget.area}
                  </span>
                  <span className="font-label-sm text-[10px] text-tertiary ml-auto font-semibold">
                    {selectedTarget.areaChange}
                  </span>
                </div>
                <span className="font-label-sm text-[9px] text-outline/80">
                  76km Transect Spine
                </span>
              </div>

              <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col">
                <span className="font-label-sm text-[9px] text-outline uppercase tracking-wider">
                  Ice Mass Volume
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-[17px] font-bold font-mono text-on-surface">
                    {selectedTarget.volume}
                  </span>
                  <span className="text-[11px] text-outline">B m³</span>
                </div>
                <span className="font-label-sm text-[9px] text-secondary">
                  GPR modeled
                </span>
              </div>

              <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col col-span-2">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-[9px] text-outline uppercase tracking-wider">
                    Structural Crevasse Risk
                  </span>
                  <span className="font-label-sm text-[10px] font-semibold text-error">
                    {selectedTarget.deficit}
                  </span>
                </div>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mt-1.5 mb-1">
                  <div
                    className="bg-error h-full rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)] transition-all"
                    style={{ width: `${selectedTarget.deficitPct}%` }}
                  />
                </div>
                <span className="text-[10px] text-on-surface-variant">
                  {selectedTarget.description}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] bg-surface-container-lowest/60 px-space-sm py-1.5 rounded-lg mb-space-md">
              <div className="flex items-center gap-1.5 text-outline">
                <span className="material-symbols-outlined text-[15px] text-primary">
                  satellite_alt
                </span>
                <span>Sentinel-1B InSAR / ICESat-2</span>
              </div>
              <span className="text-on-surface-variant font-mono">
                Today 11:38 UTC (Live)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button className="flex items-center justify-center gap-1 py-1.5 px-2 bg-primary-container text-on-primary-container rounded-lg font-label-sm text-[10px] font-semibold hover:brightness-110 shadow-md transition-all">
                <span className="material-symbols-outlined text-[14px]">
                  view_in_ar
                </span>
                GPR Sounding
              </button>
              <button className="flex items-center justify-center gap-1 py-1.5 px-2 bg-surface-variant text-on-surface rounded-lg font-label-sm text-[10px] font-medium hover:bg-surface-bright transition-colors">
                <span className="material-symbols-outlined text-[14px]">
                  stacked_line_chart
                </span>
                Crevasse Slice
              </button>
              <button className="flex items-center justify-center gap-1 py-1.5 px-2 bg-surface-variant text-on-surface rounded-lg font-label-sm text-[10px] font-medium hover:bg-surface-bright transition-colors">
                <span className="material-symbols-outlined text-[14px]">
                  download
                </span>
                GeoJSON
              </button>
            </div>
          </div>
        )}

        {/* 3. MAP HUD TOP TOOLBAR */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20 max-w-[95%]">
          <div className="flex items-center p-1 bg-surface-container/90 backdrop-blur-xl rounded-xl shadow-xl border border-outline-variant/30">
            {[
              { id: "sar", label: "SAR Coherence", icon: "radar" },
              { id: "optical", label: "True Color", icon: "satellite" },
              { id: "dem", label: "Elevation DEM", icon: "terrain" },
              { id: "insar", label: "InSAR Fringe", icon: "waves" },
              { id: "thermal", label: "Thermal IR", icon: "thermostat" },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSpectralMode(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-sm text-[10px] transition-all ${
                  spectralMode === mode.id
                    ? "bg-primary-container text-on-primary-container font-semibold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {mode.icon}
                </span>
                <span>{mode.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center p-1 bg-surface-container/90 backdrop-blur-xl rounded-xl shadow-xl border border-outline-variant/30">
            <button
              onClick={() => {
                setIsMeasuring(!isMeasuring);
                setMeasurePoints([]);
              }}
              className={`p-2 rounded-lg transition-colors ${
                isMeasuring
                  ? "bg-secondary text-on-secondary font-bold"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant"
              }`}
              title={isMeasuring ? "Measuring Active: Click 2 points" : "Measure 76km Transect Distance"}
            >
              <span className="material-symbols-outlined text-[18px]">
                straighten
              </span>
            </button>
            <button
              onClick={resetView}
              className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
              title="Reset Zoom & Pan"
            >
              <span className="material-symbols-outlined text-[18px]">
                center_focus_strong
              </span>
            </button>
            <button
              onClick={() => setZoom((prev) => Math.min(prev * 1.25, 4.5))}
              className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
              title="Zoom In (+)"
            >
              <span className="material-symbols-outlined text-[18px]">
                add
              </span>
            </button>
            <button
              onClick={() => setZoom((prev) => Math.max(prev * 0.8, 0.75))}
              className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
              title="Zoom Out (-)"
            >
              <span className="material-symbols-outlined text-[18px]">
                remove
              </span>
            </button>
          </div>
        </div>

        {/* 4. BOTTOM-LEFT TELEMETRY STATUS HUD */}
        <div className="absolute bottom-24 left-6 flex items-center gap-4 bg-surface-container/90 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-xl z-20 border border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="font-label-sm text-[10px] text-outline uppercase">
              Target Focal
            </span>
            <span className="font-label-sm text-[10px] text-on-surface font-mono">
              {cursorCoords.lat}, {cursorCoords.lon}
            </span>
          </div>
          <div className="w-px h-3.5 bg-surface-variant" />
          <div className="flex items-center gap-1.5">
            <span className="font-label-sm text-[10px] text-outline">ZOOM</span>
            <span className="font-label-sm text-[10px] text-primary font-mono font-semibold">
              {(zoom * 12.4).toFixed(1)}x
            </span>
          </div>
          <div className="w-px h-3.5 bg-surface-variant" />
          <div className="flex items-center gap-1.5">
            <span className="font-label-sm text-[10px] text-outline">ELEV</span>
            <span className="font-label-sm text-[10px] text-on-surface font-mono">
              {cursorCoords.elev}
            </span>
          </div>
          <div className="w-px h-3.5 bg-surface-variant" />
          <div className="flex flex-col items-center">
            <div className="w-16 h-1 bg-on-surface relative">
              <div className="absolute -top-1 left-0 w-0.5 h-2 bg-on-surface" />
              <div className="absolute -top-1 right-0 w-0.5 h-2 bg-on-surface" />
            </div>
            <span className="font-label-sm text-[9px] text-outline mt-0.5">
              {Math.round(2000 / zoom)} m
            </span>
          </div>
        </div>
      </div>

      {/* 5. LEFT DRAWER: LAYERS & SENSORS */}
      {isLeftDrawerOpen && (
        <aside className="absolute left-6 top-4 bottom-24 w-80 bg-surface-container/95 backdrop-blur-2xl rounded-2xl shadow-2xl flex flex-col z-20 overflow-hidden border border-outline-variant/30">
          <div className="p-space-md flex items-center justify-between bg-surface-container-high/60 shrink-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">
                layers
              </span>
              <div className="flex flex-col">
                <h3 className="font-headline-sm text-[13px] text-on-surface font-medium leading-none">
                  Siachen Radar Layers
                </h3>
                <span className="font-label-sm text-[10px] text-outline mt-0.5">
                  Karakoram Sentinel-1B Feeds
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setOpacityGlaciers(85);
                  setOpacityCrevasses(100);
                  setOpacityInSAR(65);
                  setOpacityICESat(90);
                }}
                className="p-1.5 text-outline hover:text-on-surface rounded-lg hover:bg-surface-variant transition-colors"
                title="Reset Opacity"
              >
                <span className="material-symbols-outlined text-[16px]">
                  restart_alt
                </span>
              </button>
              <button
                onClick={() => setIsLeftDrawerOpen(false)}
                className="p-1.5 text-outline hover:text-on-surface rounded-lg hover:bg-surface-variant transition-colors"
                title="Collapse Drawer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  first_page
                </span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-space-md flex flex-col gap-space-lg">
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-[10px] text-outline uppercase tracking-wider">
                  Geospatial Vectors
                </span>
                <span className="font-label-sm text-[10px] text-primary font-mono">
                  4 Active
                </span>
              </div>

              {/* Layer 1: Siachen Trunk */}
              <div className="p-space-sm bg-surface-container-low rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={layerGlaciers}
                      onChange={(e) => setLayerGlaciers(e.target.checked)}
                      className="w-4 h-4 rounded bg-surface-container-highest text-primary-container focus:ring-0 cursor-pointer"
                    />
                    <span className="font-body-md text-[11px] text-on-surface font-medium">
                      Siachen 76km Spine
                    </span>
                  </label>
                  <span className="font-label-sm text-[9px] text-outline font-mono">
                    712 km²
                  </span>
                </div>
                <div className="flex items-center gap-3 pl-6">
                  <span className="font-label-sm text-[9px] text-outline">
                    Opacity
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={opacityGlaciers}
                    onChange={(e) => setOpacityGlaciers(Number(e.target.value))}
                    className="w-full h-1 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary-container"
                  />
                  <span className="font-label-sm text-[9px] text-outline font-mono w-7 text-right">
                    {opacityGlaciers}%
                  </span>
                </div>
              </div>

              {/* Layer 2: Crevasse Radar */}
              <div className="p-space-sm bg-surface-container-low rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={layerCrevasses}
                      onChange={(e) => setLayerCrevasses(e.target.checked)}
                      className="w-4 h-4 rounded bg-surface-container-highest text-error focus:ring-0 cursor-pointer"
                    />
                    <span className="font-body-md text-[11px] text-on-surface font-medium">
                      Transverse Crevasse Fields
                    </span>
                  </label>
                  <span className="font-label-sm text-[9px] px-1.5 py-0.5 rounded bg-error/15 text-error font-medium">
                    28 Fields
                  </span>
                </div>
                <div className="flex items-center gap-3 pl-6">
                  <span className="font-label-sm text-[9px] text-outline">
                    Opacity
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={opacityCrevasses}
                    onChange={(e) => setOpacityCrevasses(Number(e.target.value))}
                    className="w-full h-1 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-error"
                  />
                  <span className="font-label-sm text-[9px] text-outline font-mono w-7 text-right">
                    {opacityCrevasses}%
                  </span>
                </div>
              </div>

              {/* Layer 3: Tributary InSAR */}
              <div className="p-space-sm bg-surface-container-low rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={layerInSAR}
                      onChange={(e) => setLayerInSAR(e.target.checked)}
                      className="w-4 h-4 rounded bg-surface-container-highest text-primary-container focus:ring-0 cursor-pointer"
                    />
                    <span className="font-body-md text-[11px] text-on-surface font-medium">
                      Teram Shehr Tributary Flow
                    </span>
                  </label>
                  <span className="font-label-sm text-[9px] text-secondary font-mono">
                    0.48 m/d
                  </span>
                </div>
                <div className="flex items-center gap-3 pl-6">
                  <span className="font-label-sm text-[9px] text-outline">
                    Opacity
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={opacityInSAR}
                    onChange={(e) => setOpacityInSAR(Number(e.target.value))}
                    className="w-full h-1 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary-container"
                  />
                  <span className="font-label-sm text-[9px] text-outline font-mono w-7 text-right">
                    {opacityInSAR}%
                  </span>
                </div>
              </div>

              {/* Layer 4: ICESat-2 */}
              <div className="p-space-sm bg-surface-container-low rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={layerICESat}
                      onChange={(e) => setLayerICESat(e.target.checked)}
                      className="w-4 h-4 rounded bg-surface-container-highest text-primary-container focus:ring-0 cursor-pointer"
                    />
                    <span className="font-body-md text-[11px] text-on-surface font-medium">
                      ICESat-2 Laser Tracks
                    </span>
                  </label>
                  <span className="font-label-sm text-[9px] text-secondary font-mono">
                    #0721
                  </span>
                </div>
                <div className="flex items-center gap-3 pl-6">
                  <span className="font-label-sm text-[9px] text-outline">
                    Opacity
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={opacityICESat}
                    onChange={(e) => setOpacityICESat(Number(e.target.value))}
                    className="w-full h-1 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary-container"
                  />
                  <span className="font-label-sm text-[9px] text-outline font-mono w-7 text-right">
                    {opacityICESat}%
                  </span>
                </div>
              </div>
            </div>

            {/* Constellation Mesh */}
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-[10px] text-outline uppercase tracking-wider">
                  Karakoram Constellation
                </span>
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              </div>
              <div className="space-y-1.5">
                {[
                  { name: "Sentinel-1B C-SAR", desc: "10m InSAR Coherence", time: "18m ago", active: true },
                  { name: "TerraSAR-X High-Res", desc: "1m Spotlight Strip", time: "34m ago", active: true },
                  { name: "ICESat-2 ATLAS", desc: "0.7m Photons (ATL06)", time: "1h ago", active: true },
                  { name: "Cartosat-3 Optical", desc: "0.28m Super-Res", time: "Live Pass", active: true },
                ].map((sensor) => (
                  <div key={sensor.name} className="p-2 rounded-lg bg-surface-container-low flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${sensor.active ? "bg-secondary" : "bg-outline"}`} />
                      <div className="flex flex-col">
                        <span className="font-body-sm text-[11px] text-on-surface font-medium">{sensor.name}</span>
                        <span className="font-label-sm text-[9px] text-outline">{sensor.desc}</span>
                      </div>
                    </div>
                    <span className="font-label-sm text-[9px] text-outline font-mono">{sensor.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      )}

      {!isLeftDrawerOpen && (
        <button
          onClick={() => setIsLeftDrawerOpen(true)}
          className="absolute left-4 top-4 z-20 p-2.5 bg-surface-container/90 backdrop-blur-xl rounded-xl shadow-xl text-primary border border-outline-variant/40 hover:bg-surface-container-high transition-colors"
          title="Open Layers"
        >
          <span className="material-symbols-outlined text-[20px]">layers</span>
        </button>
      )}

      {/* 6. RIGHT DRAWER: TRIAGE QUEUE */}
      {isRightDrawerOpen && (
        <aside className="absolute right-6 top-4 bottom-24 w-88 bg-surface-container/95 backdrop-blur-2xl rounded-2xl shadow-2xl flex flex-col z-20 overflow-hidden border border-outline-variant/30">
          <div className="p-space-md flex items-center justify-between bg-surface-container-high/60 shrink-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-tertiary">
                crisis_alert
              </span>
              <div className="flex flex-col">
                <h3 className="font-headline-sm text-[13px] text-on-surface font-medium leading-none">
                  Siachen Hazard Triage
                </h3>
                <span className="font-label-sm text-[10px] text-outline mt-0.5">
                  5 Karakoram Sectors Monitored
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsRightDrawerOpen(false)}
              className="p-1.5 text-outline hover:text-on-surface rounded-lg hover:bg-surface-variant transition-colors"
              title="Collapse Drawer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>

          <div className="p-space-md flex flex-col gap-space-sm bg-surface-container-low/40">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-[10px] text-outline uppercase tracking-wider">
                Severity Filter
              </span>
              <button
                onClick={() => setSeverityFilter("all")}
                className="font-label-sm text-[10px] text-primary hover:underline"
              >
                Reset
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: "all", label: "All (5)" },
                { id: "crit", label: "Crit (2)" },
                { id: "warn", label: "Warn (1)" },
                { id: "watch", label: "Watch (1)" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSeverityFilter(filter.id)}
                  className={`py-1 px-1.5 text-center rounded-lg font-label-sm text-[10px] transition-colors ${
                    severityFilter === filter.id
                      ? "bg-primary-container text-on-primary-container font-semibold"
                      : "bg-surface-variant text-on-surface hover:bg-surface-bright"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded-full bg-error/20 text-error font-label-sm text-[9px] cursor-pointer hover:bg-error/30 font-medium">
                Crevasse Opening
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-primary font-label-sm text-[9px] cursor-pointer hover:bg-primary-container/30">
                Surge Waves
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-[9px] cursor-pointer hover:bg-surface-bright">
                Ice Avalanches
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-space-md flex flex-col gap-2">
            {filteredTriage.map((item) => {
              const isSelected = selectedTarget.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => focusOnTarget(item)}
                  className={`p-3 rounded-xl flex flex-col gap-1 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-error/15 ring-1 ring-error/50"
                      : "bg-surface-container-low hover:bg-surface-container-high"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-1.5 py-0.5 rounded font-label-sm text-[9px] font-semibold tracking-wider ${
                        item.severity === "crit"
                          ? "bg-error text-on-error"
                          : item.severity === "warn"
                          ? "bg-tertiary-container/40 text-tertiary"
                          : item.severity === "watch"
                          ? "bg-secondary-container/40 text-secondary"
                          : "bg-surface-variant text-outline"
                      }`}
                    >
                      {item.severityLabel}
                    </span>
                    <span className="font-label-sm text-[9px] text-outline font-mono">
                      {item.code}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-headline-sm text-[12px] text-on-surface font-medium">
                      {item.name}
                    </span>
                    <span
                      className={`font-label-sm text-[10px] font-semibold ${
                        item.severity === "crit"
                          ? "text-error"
                          : item.severity === "warn"
                          ? "text-tertiary"
                          : "text-secondary"
                      }`}
                    >
                      {item.metric}
                    </span>
                  </div>
                  <p className="font-body-sm text-[10px] text-on-surface-variant line-clamp-1">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="p-space-md bg-surface-container-high/60 flex items-center gap-2 shrink-0">
            <button className="flex-1 py-2 px-3 rounded-lg bg-surface-variant text-on-surface font-label-sm text-[10px] font-medium hover:bg-surface-bright transition-colors text-center">
              Save View Preset
            </button>
            <button
              className="py-2 px-3 rounded-lg bg-surface-container-highest text-outline hover:text-on-surface font-label-sm text-[10px] transition-colors"
              title="Export Alert Queue"
            >
              <span className="material-symbols-outlined text-[16px]">
                file_upload
              </span>
            </button>
          </div>
        </aside>
      )}

      {!isRightDrawerOpen && (
        <button
          onClick={() => setIsRightDrawerOpen(true)}
          className="absolute right-4 top-4 z-20 p-2.5 bg-surface-container/90 backdrop-blur-xl rounded-xl shadow-xl text-tertiary border border-outline-variant/40 hover:bg-surface-container-high transition-colors"
          title="Open Triage"
        >
          <span className="material-symbols-outlined text-[20px]">
            crisis_alert
          </span>
        </button>
      )}

      {/* 7. BOTTOM SCRUBBER */}
      <footer className="absolute bottom-4 left-6 right-6 h-18 bg-surface-container/95 backdrop-blur-2xl rounded-2xl shadow-2xl px-space-lg flex items-center justify-between z-20 border border-outline-variant/30">
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center hover:brightness-110 shadow-lg transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined text-[24px]">
              {isPlaying ? "pause" : "play_arrow"}
            </span>
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-[13px] text-on-surface font-semibold font-mono">
                29 SEP 2026
              </span>
              <span className="font-label-sm text-[9px] px-1.5 py-0.5 rounded bg-surface-variant text-primary font-mono font-medium">
                LIVE T-0
              </span>
            </div>
            <span className="font-label-sm text-[10px] text-outline font-mono">
              11:38 UTC • SIACHEN SWATH 0721
            </span>
          </div>

          <div className="w-px h-8 bg-surface-variant hidden md:block" />

          <div className="hidden lg:flex items-center p-1 bg-surface-container-low rounded-xl">
            {[
              { id: "split", label: "Split Swipe (2021 Baseline)" },
              { id: "heatmap", label: "Surge Heatmap" },
              { id: "insar", label: "InSAR Pairs" },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setComparisonMode(mode.id)}
                className={`px-2.5 py-1 rounded-lg font-label-sm text-[10px] transition-colors ${
                  comparisonMode === mode.id
                    ? "bg-surface-variant text-on-surface font-medium"
                    : "text-outline hover:text-on-surface"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-8 flex flex-col justify-center gap-1.5">
          <div className="relative w-full flex items-center">
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                setScrubberProgress(pct);
                setSplitPos(pct);
              }}
              className="w-full h-1.5 bg-surface-container-highest rounded-full relative cursor-pointer"
            >
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full"
                style={{ width: `${scrubberProgress}%` }}
              />

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setScrubberProgress(20);
                  setSplitPos(20);
                }}
                className="absolute -top-1 left-[20%] w-3.5 h-3.5 rounded-full bg-surface-container ring-2 ring-tertiary cursor-pointer hover:scale-125 transition-transform"
                title="Oct 2021: Karakoram Anomaly Surge"
              />
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setScrubberProgress(65);
                  setSplitPos(65);
                }}
                className="absolute -top-1 left-[65%] w-3.5 h-3.5 rounded-full bg-surface-container ring-2 ring-error cursor-pointer hover:scale-125 transition-transform"
                title="Jun 2024: Saltoro Crevasse Widening"
              />
              <div
                className="absolute -top-1.5 -ml-2 w-4 h-4 rounded-full bg-primary-container shadow-[0_0_12px_rgba(56,189,248,0.8)] cursor-pointer"
                style={{ left: `${scrubberProgress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-outline font-label-sm text-[9px] font-mono">
            <span>JAN 2020</span>
            <span className="text-tertiary">OCT 2021 [SURGE]</span>
            <span>JAN 2023</span>
            <span className="text-error">JUN 2024 [CREVASSE BREACH]</span>
            <span className="text-secondary font-semibold">
              SEP 2026 [LIVE SIACHEN RADAR]
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-surface-container-low rounded-xl p-1">
            {["1x", "4x", "12x"].map((speed) => (
              <button
                key={speed}
                onClick={() => setSpeedMultiplier(speed)}
                className={`px-2 py-1 font-label-sm text-[10px] font-mono rounded-lg transition-colors ${
                  speedMultiplier === speed
                    ? "bg-surface-variant text-on-surface font-semibold"
                    : "text-outline hover:text-on-surface"
                }`}
              >
                {speed}
              </button>
            ))}
          </div>
          <button
            className="p-2 text-outline hover:text-on-surface rounded-xl hover:bg-surface-variant transition-colors"
            title="Scrubber Settings"
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
