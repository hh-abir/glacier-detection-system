"use client";

import React, { useState, useEffect, useRef } from "react";

interface GlacierData {
  id: string;
  name: string;
  code: string;
  riskLevel: string;
  riskClass: string;
  area: string;
  areaChange: string;
  proglacialVol: string;
  volChange: string;
  moraineDef: string;
  seepageCoeff: string;
  status: string;
  focalPoint: { x: number; y: number };
}

const GLACIERS: Record<string, GlacierData> = {
  siachen_trunk: {
    id: "siachen_trunk",
    name: "SIACHEN MAIN TRUNK",
    code: "[SC-01]",
    riskLevel: "LEVEL-3 SURGE WATCH",
    riskClass: "bg-tertiary-container/40 text-tertiary border-tertiary/60",
    area: "712 km² (76km)",
    areaChange: "(-0.45%)",
    proglacialVol: "340B m³",
    volChange: "(+3.8% Surge)",
    moraineDef: "+8.4 cm/yr",
    seepageCoeff: "0.19 k_fs",
    status: "CENTRAL CREVASSE SURGE ACTIVE",
    focalPoint: { x: 420, y: 310 },
  },
  teram_shehr: {
    id: "teram_shehr",
    name: "TERAM SHEHR TRIBUTARY",
    code: "[TS-03]",
    riskLevel: "LEVEL-2 FAST FLOW",
    riskClass: "bg-primary-container/30 text-primary border-primary/50",
    area: "185 km²",
    areaChange: "(+1.12%)",
    proglacialVol: "84B m³",
    volChange: "(+8.4%)",
    moraineDef: "+12.2 cm/yr",
    seepageCoeff: "0.22 k_fs",
    status: "CONFLUENCE THRUST DETECTED",
    focalPoint: { x: 580, y: 220 },
  },
  saltoro_ridge: {
    id: "saltoro_ridge",
    name: "SALTORO CREVASSE ZONE",
    code: "[SR-09]",
    riskLevel: "LEVEL-4 AVALANCHE DANGER",
    riskClass: "bg-error-container/40 text-error border-error/50",
    area: "94 km²",
    areaChange: "(-2.80%)",
    proglacialVol: "28B m³",
    volChange: "(-4.2%)",
    moraineDef: "+24.5 cm/yr",
    seepageCoeff: "0.58 k_fs",
    status: "EXTREME BASAL SLIP DETECTED",
    focalPoint: { x: 260, y: 390 },
  },
  bilafond_la: {
    id: "bilafond_la",
    name: "BILAFOND LA GLACIER",
    code: "[BL-04]",
    riskLevel: "LEVEL-2 SADDLE COLD ICE",
    riskClass: "bg-secondary-container/30 text-secondary border-secondary/50",
    area: "62 km²",
    areaChange: "(0.00%)",
    proglacialVol: "19B m³",
    volChange: "(Stable)",
    moraineDef: "+4.1 cm/yr",
    seepageCoeff: "0.12 k_fs",
    status: "PERMAFROST STABLE",
    focalPoint: { x: 210, y: 220 },
  },
};

export default function MapWorkspace() {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Live mouse coordinates in Siachen region (35°N, 77°E)
  const [coords, setCoords] = useState<{ lat: string; lon: string; elev: string }>({
    lat: `35°25'12"N`,
    lon: `77°06'30"E`,
    elev: `5,420m ASL`,
  });

  const [activeLayers, setActiveLayers] = useState<string[]>([
    "sar",
    "vectors",
  ]);
  const [selectedGlacier, setSelectedGlacier] = useState<GlacierData>(
    GLACIERS.siachen_trunk
  );
  const [timelineVal, setTimelineVal] = useState<number>(2026.7);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hoveredGlacier, setHoveredGlacier] = useState<string | null>(null);

  // Auto-play
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimelineVal((prev) => {
        if (prev >= 2026.9) return 2020;
        return +(prev + 0.1).toFixed(1);
      });
    }, 400);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const toggleLayer = (id: string) => {
    setActiveLayers((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    });
  };

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

    // Siachen latitude (35.1 to 35.6 N) and longitude (76.8 to 77.3 E)
    const latDeg = 35.58 - relY * 0.42;
    const lonDeg = 76.85 + relX * 0.45;
    const calcElev = Math.round(3620 + (1 - relY) * 2133); // 3620m snout to 5753m Indira col

    const latMin = Math.floor((latDeg % 1) * 60);
    const latSec = Math.floor((((latDeg % 1) * 60) % 1) * 60);
    const lonMin = Math.floor((lonDeg % 1) * 60);
    const lonSec = Math.floor((((lonDeg % 1) * 60) % 1) * 60);

    setCoords({
      lat: `35°${latMin.toString().padStart(2, "0")}'${latSec.toString().padStart(2, "0")}"N`,
      lon: `77°${lonMin.toString().padStart(2, "0")}'${lonSec.toString().padStart(2, "0")}"E`,
      elev: `${calcElev.toLocaleString()}m ASL`,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.87;
    setZoom((prev) => Math.min(Math.max(prev * factor, 0.75), 4.5));
  };

  const focusGlacier = (glacier: GlacierData) => {
    setSelectedGlacier(glacier);
    if (mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      const targetX = (glacier.focalPoint.x / 800) * rect.width;
      const targetY = (glacier.focalPoint.y / 600) * rect.height;

      setZoom(1.7);
      setPan({
        x: rect.width / 2 - targetX * 1.7,
        y: rect.height / 2 - targetY * 1.7,
      });
    }
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="w-[68%] h-full flex flex-col relative border-r border-outline-variant/30 bg-surface-container-lowest overflow-hidden">
      {/* MAP CONTROLS & HUD HEADER */}
      <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between pointer-events-none">
        {/* Layer Selector Chips */}
        <div className="pointer-events-auto flex items-center bg-surface-container-lowest/90 backdrop-blur-md border border-outline-variant/50 p-space-xs gap-1 shadow-lg">
          <button
            onClick={() => toggleLayer("sar")}
            className={`px-space-sm py-1 font-label-sm text-[10px] font-semibold flex items-center gap-1 transition-colors ${
              activeLayers.includes("sar")
                ? "bg-primary text-on-primary"
                : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">radar</span>
            <span>SIACHEN SAR INTERFEROMETRY</span>
          </button>

          <button
            onClick={() => toggleLayer("optical")}
            className={`px-space-sm py-1 font-label-sm text-[10px] flex items-center gap-1 transition-colors ${
              activeLayers.includes("optical")
                ? "bg-primary text-on-primary font-semibold"
                : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">palette</span>
            <span>TRUE COLOR ORTHO</span>
          </button>

          <button
            onClick={() => toggleLayer("crevasses")}
            className={`px-space-sm py-1 font-label-sm text-[10px] flex items-center gap-1 transition-colors ${
              activeLayers.includes("crevasses")
                ? "bg-error text-white font-semibold"
                : "bg-surface-container hover:bg-surface-container-high text-error"
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">warning</span>
            <span>CREVASSE FIELD RADAR</span>
          </button>

          <button
            onClick={() => toggleLayer("vectors")}
            className={`px-space-sm py-1 font-label-sm text-[10px] flex items-center gap-1 transition-colors ${
              activeLayers.includes("vectors")
                ? "bg-secondary text-on-secondary font-semibold"
                : "bg-surface-container hover:bg-surface-container-high text-secondary"
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">navigation</span>
            <span>FLOW VELOCITY VECTORS</span>
          </button>
        </div>

        {/* Telemetry Coordinates Badge & Zoom Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="flex items-center gap-space-sm bg-surface-container-lowest/90 backdrop-blur-md border border-outline-variant/50 px-space-md py-1 font-label-sm text-[10px] text-on-surface">
            <div className="flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-[14px]">
                file_download_done
              </span>
              <span>{coords.lat} {coords.lon}</span>
            </div>
            <span className="text-outline-variant">|</span>
            <span className="text-secondary font-mono">{coords.elev}</span>
            <span className="text-outline-variant">|</span>
            <span className="text-on-surface-variant font-mono">
              Z{(zoom * 12.4).toFixed(1)}
            </span>
          </div>

          <div className="flex items-center bg-surface-container-lowest/90 backdrop-blur-md border border-outline-variant/50 p-0.5 gap-0.5 shadow-lg">
            <button
              onClick={() => setZoom((prev) => Math.min(prev * 1.25, 4.5))}
              className="p-1 hover:bg-surface-container-high text-on-surface rounded transition-colors"
              title="Zoom In"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
            </button>
            <button
              onClick={() => setZoom((prev) => Math.max(prev * 0.8, 0.75))}
              className="p-1 hover:bg-surface-container-high text-on-surface rounded transition-colors"
              title="Zoom Out"
            >
              <span className="material-symbols-outlined text-[14px]">remove</span>
            </button>
            <button
              onClick={resetView}
              className="p-1 hover:bg-surface-container-high text-on-surface rounded transition-colors"
              title="Reset View"
            >
              <span className="material-symbols-outlined text-[14px]">center_focus_strong</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAP VIEWPORT */}
      <div
        ref={mapContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`relative w-full h-full bg-[#060a10] flex items-center justify-center overflow-hidden ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <div
          className="relative w-full h-full origin-center transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {/* High-Altitude Glaciated Karakoram Satellite Texture */}
          <div
            className="absolute inset-0 opacity-45 mix-blend-luminosity bg-cover bg-center transition-all duration-700"
            style={{
              backgroundImage: `url('/images/imja-lake-sat.jpg')`,
              filter: activeLayers.includes("sar")
                ? "grayscale(100%) contrast(165%) brightness(90%)"
                : "none",
            }}
          />

          {/* SVG Vector Layer: 76KM SIACHEN TRANSECT */}
          <svg
            className="absolute inset-0 w-full h-full select-none"
            viewBox="0 0 800 600"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="coordGrid"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 100 0 L 0 0 0 100"
                  fill="none"
                  stroke="#1c2533"
                  strokeWidth="0.75"
                  strokeDasharray="2,6"
                />
                <circle cx="0" cy="0" r="1.5" fill="#323e4f" />
              </pattern>

              <linearGradient id="siachenIceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c4e7ff" stopOpacity="0.35" />
                <stop offset="50%" stopColor="#7bd0ff" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.15" />
              </linearGradient>

              <linearGradient id="crevasseHazardGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            <rect width="100%" height="100%" fill="url(#coordGrid)" opacity="0.65" />

            {/* ICESat-2 ATL06 Karakoram Transect Line */}
            <g opacity="0.85">
              <line
                x1="120"
                y1="0"
                x2="680"
                y2="600"
                stroke="#38bdf8"
                strokeWidth="1.2"
                strokeDasharray="6,4"
              />
              <text
                x="510"
                y="520"
                fill="#38bdf8"
                className="font-label-sm text-[9px] tracking-widest uppercase font-mono"
              >
                ICESat-2 ATL06 KARAKORAM TRANSECT [RGT 0721]
              </text>
              <circle cx="380" cy="280" r="3.5" fill="#38bdf8" />
              <circle cx="280" cy="170" r="3.5" fill="#38bdf8" />
              <circle cx="480" cy="390" r="3.5" fill="#38bdf8" />
            </g>

            {/* SATELLITE PASS BOUNDARY */}
            <polygon
              points="80,20 620,10 740,560 140,580"
              fill="none"
              stroke="#4edea3"
              strokeWidth="1"
              strokeDasharray="8,4"
              opacity="0.35"
            />
            <text
              x="160"
              y="40"
              fill="#4edea3"
              className="font-label-sm text-[9px] uppercase tracking-wider font-mono"
            >
              SENTINEL-1B C-SAR SWATH: S1B_IW_SLC__1SDV_SIACHEN
            </text>

            {/* GLACIER 1: SIACHEN MAIN TRUNK (76 KM SERPENTINE ICE HIGHWAY) */}
            <g
              id="glacier-siachen-poly"
              onClick={() => focusGlacier(GLACIERS.siachen_trunk)}
              onMouseEnter={() => setHoveredGlacier("Siachen Main Trunk (76 km)")}
              onMouseLeave={() => setHoveredGlacier(null)}
              className="cursor-pointer group"
            >
              {/* Grand Serpentine Main Glacier Ribbon */}
              <path
                d="M 280,60 Q 330,120 370,190 T 430,290 T 460,390 T 420,490 T 360,570 L 320,560 Q 370,480 395,385 T 345,280 T 300,180 T 250,70 Z"
                fill="url(#siachenIceGradient)"
                stroke="#8ed5ff"
                strokeWidth={selectedGlacier.id === "siachen_trunk" ? "2.8" : "1.8"}
                className="transition-all"
              />

              {/* Medial Moraine Ribbons running down the length */}
              <path
                d="M 265,65 Q 315,125 355,185 T 412,285 T 438,388 T 392,488 T 340,565"
                fill="none"
                stroke="#3e484f"
                strokeWidth="1"
                strokeDasharray="6,3"
                opacity="0.7"
              />

              {/* Flow Velocity Arrows */}
              {activeLayers.includes("vectors") && (
                <g className="transition-opacity">
                  <path d="M 335,140 L 350,175 M 350,175 L 344,168 M 350,175 L 354,169" stroke="#7bd0ff" strokeWidth="1.5" />
                  <path d="M 390,240 L 410,278 M 410,278 L 403,272 M 410,278 L 413,270" stroke="#7bd0ff" strokeWidth="1.5" />
                  <path d="M 435,340 L 438,380 M 438,380 L 433,372 M 438,380 L 442,373" stroke="#7bd0ff" strokeWidth="1.5" />
                  <path d="M 425,430 L 400,470 M 400,470 L 401,462 M 400,470 L 408,465" stroke="#7bd0ff" strokeWidth="1.5" />
                </g>
              )}

              {/* Indira Col Accumulation Source Marker */}
              <circle cx="265" cy="65" r="4.5" fill="#c4e7ff" stroke="#00354a" strokeWidth="1.5" />
              <text x="210" y="55" fill="#c4e7ff" className="font-mono text-[10px] font-bold">
                INDIRA COL [5,753m]
              </text>

              {/* Siachen Main Trunk Label */}
              <text x="430" y="270" fill="#8ed5ff" className="font-mono text-[11px] font-bold tracking-wider">
                SIACHEN MAIN TRUNK [SC-01]
              </text>
              <text x="430" y="284" fill="#bdc8d1" className="font-mono text-[9px]">
                76 KM LENGTH | FLOW: 0.34 m/day | AREA: 712 km²
              </text>

              {/* Snout Nubra Outflow Marker */}
              <circle cx="340" cy="565" r="4" fill="#38bdf8" />
              <text x="355" y="570" fill="#38bdf8" className="font-mono text-[9px] font-semibold">
                SNOUT / NUBRA RIVERBED [3,620m]
              </text>
            </g>

            {/* GLACIER 2: TERAM SHEHR EASTERN TRIBUTARY */}
            <g
              id="glacier-teram-shehr"
              onClick={() => focusGlacier(GLACIERS.teram_shehr)}
              onMouseEnter={() => setHoveredGlacier("Teram Shehr Glacier")}
              onMouseLeave={() => setHoveredGlacier(null)}
              className="cursor-pointer group"
            >
              <path
                d="M 680,180 Q 610,210 520,240 T 430,290 L 415,270 Q 510,225 590,195 T 660,165 Z"
                fill="#38bdf8"
                fillOpacity={selectedGlacier.id === "teram_shehr" ? "0.3" : "0.15"}
                stroke="#38bdf8"
                strokeWidth={selectedGlacier.id === "teram_shehr" ? "2.5" : "1.4"}
              />
              <text x="540" y="210" fill="#38bdf8" className="font-mono text-[10px] font-semibold">
                TERAM SHEHR TRIBUTARY [TS-03]
              </text>
            </g>

            {/* GLACIER 3: SALTORO RIDGE & CREVASSE FIELD */}
            <g
              id="glacier-saltoro"
              onClick={() => focusGlacier(GLACIERS.saltoro_ridge)}
              onMouseEnter={() => setHoveredGlacier("Saltoro Ridge & Crevasse Zone")}
              onMouseLeave={() => setHoveredGlacier(null)}
              className="cursor-pointer group"
            >
              <path
                d="M 180,320 Q 230,350 280,380 T 360,400 L 350,420 Q 270,410 210,380 T 160,340 Z"
                fill="#ffb4ab"
                fillOpacity={selectedGlacier.id === "saltoro_ridge" ? "0.35" : "0.18"}
                stroke="#ef4444"
                strokeWidth={selectedGlacier.id === "saltoro_ridge" ? "2.8" : "1.8"}
              />

              {/* Crevasse Hazard Hatch Lines */}
              <g stroke="#ef4444" strokeWidth="1.2">
                <line x1="240" y1="360" x2="255" y2="380" />
                <line x1="265" y1="370" x2="280" y2="390" />
                <line x1="290" y1="380" x2="305" y2="400" />
                <line x1="315" y1="385" x2="330" y2="405" />
              </g>

              <circle cx="260" cy="385" r="5" fill="#ef4444" className="animate-ping" />
              <text x="180" y="440" fill="#ffb4ab" className="font-mono text-[10px] font-bold">
                SALTORO CREVASSE ZONE [SR-09]
              </text>
              <text x="180" y="454" fill="#ef4444" className="font-mono text-[9px] font-semibold">
                LEVEL-4 AVALANCHE &amp; FRACTURE THREAT
              </text>
            </g>

            {/* GLACIER 4: BILAFOND LA */}
            <g
              id="glacier-bilafond"
              onClick={() => focusGlacier(GLACIERS.bilafond_la)}
              onMouseEnter={() => setHoveredGlacier("Bilafond La Glacier Saddle")}
              onMouseLeave={() => setHoveredGlacier(null)}
              className="cursor-pointer group"
            >
              <path
                d="M 150,190 Q 210,210 260,230 L 250,250 Q 200,230 140,210 Z"
                fill="#4edea3"
                fillOpacity="0.18"
                stroke="#4edea3"
                strokeWidth="1.2"
                strokeDasharray="4,2"
              />
              <text x="130" y="180" fill="#4edea3" className="font-mono text-[10px] font-semibold">
                BILAFOND LA SADDLE [BL-04]
              </text>
            </g>

            {/* Radar Crosshairs */}
            <circle cx="400" cy="300" r="180" fill="none" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="4,8" opacity="0.25" />
            <line x1="400" y1="270" x2="400" y2="330" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
            <line x1="370" y1="300" x2="430" y2="300" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
          </svg>
        </div>

        {/* Hover label */}
        {hoveredGlacier && (
          <div className="absolute pointer-events-none px-2.5 py-1 bg-surface-container-lowest/95 border border-primary text-primary font-mono text-[11px] rounded top-14 left-1/2 -translate-x-1/2 z-30 shadow-lg">
            SIACHEN SECTOR: {hoveredGlacier} [CLICK TO LOCK FOV]
          </div>
        )}

        {/* FLOATING TACTICAL HUD CARD FOR SIACHEN TARGET */}
        <div className="absolute bottom-16 left-4 z-20 w-84 bg-surface-container-lowest/95 backdrop-blur-md border border-outline-variant/60 p-space-sm shadow-2xl">
          <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/30 mb-space-xs">
            <div className="flex items-center gap-space-xs">
              <span className="w-2 h-2 bg-secondary animate-ping" />
              <span className="font-label-md text-[11px] font-bold text-on-surface">
                {selectedGlacier.name} {selectedGlacier.code}
              </span>
            </div>
            <span
              className={`font-label-sm text-[9px] px-1 py-0.2 font-bold border ${selectedGlacier.riskClass}`}
            >
              {selectedGlacier.riskLevel}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-space-xs font-label-sm text-[10px] mb-space-xs">
            <div className="bg-surface-container-low p-1.5 border border-outline-variant/20 rounded">
              <span className="text-on-surface-variant block text-[9px] uppercase">
                TOTAL ICE COVER
              </span>
              <span className="text-on-surface font-mono text-[11px] font-semibold">
                {selectedGlacier.area}
              </span>
              <span className="text-secondary text-[10px] ml-1">
                {selectedGlacier.areaChange}
              </span>
            </div>
            <div className="bg-surface-container-low p-1.5 border border-outline-variant/20 rounded">
              <span className="text-on-surface-variant block text-[9px] uppercase">
                ICE MASS VOLUME
              </span>
              <span className="text-primary font-mono text-[11px] font-semibold">
                {selectedGlacier.proglacialVol}
              </span>
              <span className="text-tertiary text-[10px] ml-1">
                {selectedGlacier.volChange}
              </span>
            </div>
            <div className="bg-surface-container-low p-1.5 border border-outline-variant/20 rounded">
              <span className="text-on-surface-variant block text-[9px] uppercase">
                MORAINE CREEP
              </span>
              <span className="text-tertiary font-mono text-[11px] font-semibold">
                {selectedGlacier.moraineDef}
              </span>
            </div>
            <div className="bg-surface-container-low p-1.5 border border-outline-variant/20 rounded">
              <span className="text-on-surface-variant block text-[9px] uppercase">
                SUBGLACIAL DRAINAGE
              </span>
              <span className="text-secondary font-mono text-[11px] font-semibold">
                {selectedGlacier.seepageCoeff}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20 text-label-sm font-label-sm text-[10px]">
            <span className="text-on-surface-variant font-mono">
              STATUS: {selectedGlacier.status}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => focusGlacier(selectedGlacier)}
                className="px-2 py-0.5 bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-sm text-[10px] border border-outline-variant/40 transition-colors"
              >
                CENTER
              </button>
              <button
                onClick={() => focusGlacier(selectedGlacier)}
                className="px-2 py-0.5 bg-primary hover:bg-primary-container text-on-primary font-label-sm text-[10px] font-semibold transition-colors"
              >
                LOCK FOV
              </button>
            </div>
          </div>
        </div>

        {/* MAP SCALE & NORTH ARROW */}
        <div className="absolute bottom-4 right-4 z-20 flex items-end gap-space-md pointer-events-none">
          <div className="bg-surface-container-lowest/90 border border-outline-variant/50 p-2 text-right font-label-sm text-[10px]">
            <div className="flex items-center justify-end gap-1 mb-1">
              <span className="text-on-surface-variant uppercase text-[9px]">
                GROUND RESOLUTION:
              </span>
              <span className="text-secondary font-mono">
                {Math.round(10 / zoom)}m / PIXEL
              </span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className="font-mono text-[9px] text-on-surface-variant">0</span>
              <div className="w-24 h-1.5 bg-surface-container-highest border border-outline-variant/60 relative">
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-on-surface" />
              </div>
              <span className="font-mono text-[9px] text-on-surface-variant">
                {(5.0 / zoom).toFixed(1)} KM
              </span>
            </div>
          </div>

          <div className="bg-surface-container-lowest/90 border border-outline-variant/50 w-8 h-10 flex flex-col items-center justify-center p-1">
            <span className="text-[9px] font-bold text-primary leading-none">N</span>
            <span className="material-symbols-outlined text-[16px] text-primary">
              navigation
            </span>
          </div>
        </div>

        {/* TIME SCRUBBER TIMELINE */}
        <div className="absolute bottom-3 left-4 right-36 z-20 bg-surface-container-lowest/95 backdrop-blur-md border border-outline-variant/50 px-space-md py-1.5 flex items-center gap-space-md">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-primary hover:text-primary-fixed flex items-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isPlaying ? "pause" : "play_arrow"}
            </span>
          </button>

          <div className="flex items-center gap-2 text-label-sm font-label-sm text-[10px] text-on-surface-variant whitespace-nowrap">
            <span className="text-primary font-mono font-semibold">2020</span>
            <span className="text-outline-variant">--</span>
            <span className="text-on-surface font-mono font-bold">
              {timelineVal >= 2026 ? "2026.09 [CURRENT]" : timelineVal.toFixed(1)}
            </span>
          </div>

          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min="2020"
              max="2026.9"
              step="0.1"
              value={timelineVal}
              onChange={(e) => setTimelineVal(parseFloat(e.target.value))}
              className="w-full h-1 bg-surface-container-highest appearance-none cursor-pointer accent-primary"
            />
            <div className="absolute inset-x-0 flex justify-between pointer-events-none -top-1">
              <span className="w-0.5 h-3 bg-outline-variant/60" />
              <span className="w-0.5 h-2 bg-outline-variant/40" />
              <span className="w-0.5 h-2 bg-outline-variant/40" />
              <span className="w-0.5 h-3 bg-outline-variant/60" />
              <span className="w-0.5 h-2 bg-outline-variant/40" />
              <span className="w-0.5 h-2 bg-outline-variant/40" />
              <span className="w-0.5 h-3 bg-secondary" />
            </div>
          </div>

          <div className="flex items-center gap-1 font-label-sm text-[10px]">
            <span className="text-on-surface-variant text-[9px]">SIACHEN SURGE CYCLE:</span>
            <span className="px-1 py-0.5 bg-surface-container-high border border-outline-variant/40 text-secondary font-mono">
              KARAKORAM ANOMALY ACTIVE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
