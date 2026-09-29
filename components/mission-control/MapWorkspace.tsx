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
  imja: {
    id: "imja",
    name: "GLACIER-IMJA-TSHO",
    code: "[T-92]",
    riskLevel: "LEVEL-4 RISK",
    riskClass: "bg-error-container/40 text-error border-error/50",
    area: "41.8 km²",
    areaChange: "(-1.65%)",
    proglacialVol: "78.2M m³",
    volChange: "(+42.0%)",
    moraineDef: "+14.2 cm/yr",
    seepageCoeff: "0.44 k_fs",
    status: "RULE_04 ACTIVE",
    focalPoint: { x: 470, y: 350 },
  },
  khumbu: {
    id: "khumbu",
    name: "KHUMBU GLACIER",
    code: "[KG-04]",
    riskLevel: "LEVEL-2 WARNING",
    riskClass: "bg-tertiary-container/30 text-tertiary border-tertiary/50",
    area: "68.4 km²",
    areaChange: "(-0.92%)",
    proglacialVol: "14.5M m³",
    volChange: "(+12.4%)",
    moraineDef: "+6.8 cm/yr",
    seepageCoeff: "0.28 k_fs",
    status: "SURVEILLANCE EXPANDED",
    focalPoint: { x: 330, y: 320 },
  },
  ngozumpa: {
    id: "ngozumpa",
    name: "NGOZUMPA TONGUE",
    code: "[NG-18]",
    riskLevel: "LEVEL-3 ALERT",
    riskClass: "bg-tertiary-container/40 text-tertiary border-tertiary/60",
    area: "82.1 km²",
    areaChange: "(-2.10%)",
    proglacialVol: "52.8M m³",
    volChange: "(+28.7%)",
    moraineDef: "+11.1 cm/yr",
    seepageCoeff: "0.39 k_fs",
    status: "POND COALESCENCE OBSERVED",
    focalPoint: { x: 150, y: 220 },
  },
};

export default function MapWorkspace() {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Live mouse coordinates
  const [coords, setCoords] = useState<{ lat: string; lon: string; elev: string }>({
    lat: `27°59'17"N`,
    lon: `86°55'31"E`,
    elev: `5,364m ASL`,
  });

  const [activeLayers, setActiveLayers] = useState<string[]>([
    "sar",
    "vectors",
  ]);
  const [selectedGlacier, setSelectedGlacier] = useState<GlacierData>(
    GLACIERS.imja
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

    const latDeg = 28.01 - relY * 0.06;
    const lonDeg = 86.89 + relX * 0.08;
    const calcElev = Math.round(5100 + (1 - relY) * 980);

    const latMin = Math.floor((latDeg % 1) * 60);
    const latSec = Math.floor((((latDeg % 1) * 60) % 1) * 60);
    const lonMin = Math.floor((lonDeg % 1) * 60);
    const lonSec = Math.floor((((lonDeg % 1) * 60) % 1) * 60);

    setCoords({
      lat: `27°${latMin.toString().padStart(2, "0")}'${latSec.toString().padStart(2, "0")}"N`,
      lon: `86°${lonMin.toString().padStart(2, "0")}'${lonSec.toString().padStart(2, "0")}"E`,
      elev: `${calcElev.toLocaleString()}m ASL`,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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
            <span>SAR INTENSITY</span>
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
            <span>OPTICAL RGB</span>
          </button>

          <button
            onClick={() => toggleLayer("bathy")}
            className={`px-space-sm py-1 font-label-sm text-[10px] flex items-center gap-1 transition-colors ${
              activeLayers.includes("bathy")
                ? "bg-primary text-on-primary font-semibold"
                : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">water</span>
            <span>LAKE DEPTH BATHY</span>
          </button>

          <button
            onClick={() => toggleLayer("dem")}
            className={`px-space-sm py-1 font-label-sm text-[10px] flex items-center gap-1 transition-colors ${
              activeLayers.includes("dem")
                ? "bg-primary text-on-primary font-semibold"
                : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">filter_hdr</span>
            <span>CONTOURS (DEM)</span>
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
            <span>VELOCITY VECTORS</span>
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

      {/* MAP VIEWPORT (PAN & ZOOM CONTAINER) */}
      <div
        ref={mapContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`relative w-full h-full bg-[#070b10] flex items-center justify-center overflow-hidden ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {/* Transformable Canvas Group */}
        <div
          className="relative w-full h-full origin-center transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {/* Orthorectified Background Texture */}
          <div
            className="absolute inset-0 opacity-40 mix-blend-luminosity bg-cover bg-center transition-all duration-700"
            style={{
              backgroundImage: `url('/images/khumbu-sat.jpg')`,
              filter: activeLayers.includes("sar")
                ? "grayscale(100%) contrast(150%)"
                : "none",
            }}
          />

          {/* SVG Vector Layer */}
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
                  stroke="#242c38"
                  strokeWidth="0.75"
                  strokeDasharray="2,6"
                />
                <circle cx="0" cy="0" r="1.5" fill="#3e484f" />
              </pattern>

              <radialGradient id="lakeDepthGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                <stop offset="85%" stopColor="#0369a1" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#082f49" stopOpacity="0.9" />
              </radialGradient>
            </defs>

            {/* Coordinate Cross Grid */}
            <rect width="100%" height="100%" fill="url(#coordGrid)" opacity="0.65" />

            {/* Satellite Ground Track */}
            <g opacity="0.85">
              <line
                x1="60"
                y1="0"
                x2="720"
                y2="600"
                stroke="#8ed5ff"
                strokeWidth="1.2"
                strokeDasharray="5,3"
              />
              <text
                x="520"
                y="510"
                fill="#8ed5ff"
                className="font-label-sm text-[9px] tracking-widest uppercase font-mono"
              >
                ICESat-2 ATL06 GROUND TRACK [RGT 0429]
              </text>
              <circle cx="380" cy="300" r="3" fill="#8ed5ff" />
              <circle cx="280" cy="210" r="3" fill="#8ed5ff" />
              <circle cx="480" cy="390" r="3" fill="#8ed5ff" />
            </g>

            {/* Sentinel-2 Swath */}
            <polygon
              points="120,40 580,20 660,540 180,590"
              fill="none"
              stroke="#4edea3"
              strokeWidth="1"
              strokeDasharray="8,4"
              opacity="0.4"
            />
            <text
              x="200"
              y="55"
              fill="#4edea3"
              className="font-label-sm text-[9px] uppercase tracking-wider font-mono"
            >
              SWATH: S2B_MSIL2A_20260929T050649
            </text>

            {/* Glacier 1: Khumbu Glacier */}
            <g
              id="glacier-khumbu-poly"
              onClick={() => focusGlacier(GLACIERS.khumbu)}
              onMouseEnter={() => setHoveredGlacier("Khumbu Glacier")}
              onMouseLeave={() => setHoveredGlacier(null)}
              className="cursor-pointer group"
            >
              <path
                d="M 280,140 Q 320,180 340,240 T 360,330 T 345,410 T 325,480 L 295,475 Q 310,400 315,310 T 290,210 Z"
                fill="#ff975d"
                fillOpacity={selectedGlacier.id === "khumbu" ? "0.25" : "0.12"}
                stroke="#ff975d"
                strokeWidth={selectedGlacier.id === "khumbu" ? "2.5" : "1.5"}
                strokeDasharray="4,2"
                className="transition-all"
              />
              {activeLayers.includes("vectors") && (
                <g className="transition-opacity">
                  <path
                    d="M 320,240 L 325,270 M 325,270 L 322,263 M 325,270 L 329,264"
                    stroke="#ffbf9e"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M 345,330 L 348,365 M 348,365 L 344,357 M 348,365 L 352,358"
                    stroke="#ffbf9e"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M 330,410 L 326,440 M 326,440 L 323,433 M 326,440 L 329,434"
                    stroke="#ffbf9e"
                    strokeWidth="1.5"
                  />
                </g>
              )}
              <ellipse
                cx="330"
                cy="360"
                rx="9"
                ry="5"
                fill="#0284c7"
                stroke="#38bdf8"
                strokeWidth="1"
              />
              <ellipse
                cx="322"
                cy="390"
                rx="12"
                ry="7"
                fill="#0284c7"
                stroke="#38bdf8"
                strokeWidth="1"
              />
              <text
                x="250"
                y="160"
                fill="#ffbf9e"
                className="font-label-md text-[11px] font-semibold tracking-wider font-mono"
              >
                KHUMBU GLACIER [KG-04]
              </text>
              <text
                x="250"
                y="174"
                fill="#bdc8d1"
                className="font-label-sm text-[9px] font-mono"
              >
                FLOW: 0.18 m/day | RETREAT: -14.2m/yr
              </text>
            </g>

            {/* Glacier 2: Imja Glacier & Lake Imja Tsho */}
            <g
              id="glacier-imja-poly"
              onClick={() => focusGlacier(GLACIERS.imja)}
              onMouseEnter={() => setHoveredGlacier("Imja Tsho")}
              onMouseLeave={() => setHoveredGlacier(null)}
              className="cursor-pointer group"
            >
              <path
                d="M 430,310 Q 490,320 540,305 T 620,330 T 600,380 L 480,395 T 420,360 Z"
                fill="#ffb4ab"
                fillOpacity={selectedGlacier.id === "imja" ? "0.28" : "0.15"}
                stroke="#ef4444"
                strokeWidth={selectedGlacier.id === "imja" ? "3" : "2"}
                className="transition-all"
              />
              <path
                d="M 435,335 C 455,330 480,332 495,342 C 510,352 505,372 485,378 C 460,384 435,375 428,355 Z"
                fill="url(#lakeDepthGrad)"
                stroke="#ef4444"
                strokeWidth="1.5"
              />
              <ellipse
                cx="468"
                cy="355"
                rx="42"
                ry="24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="1"
                strokeDasharray="3,3"
                className="animate-pulse"
              />
              <circle
                cx="426"
                cy="353"
                r="5"
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <text
                x="460"
                y="295"
                fill="#ffb4ab"
                className="font-label-md text-[11px] font-bold tracking-widest font-mono"
              >
                IMJA TSHO [GL-2798-02]
              </text>
              <text
                x="460"
                y="308"
                fill="#ef4444"
                className="font-label-sm text-[9px] font-semibold font-mono"
              >
                CRITICAL GLOF THREAT (LEVEL 4)
              </text>
            </g>

            {/* Glacier 3: Ngozumpa */}
            <g
              id="glacier-ngozumpa-poly"
              onClick={() => focusGlacier(GLACIERS.ngozumpa)}
              onMouseEnter={() => setHoveredGlacier("Ngozumpa Tongue")}
              onMouseLeave={() => setHoveredGlacier(null)}
              className="cursor-pointer group"
            >
              <path
                d="M 140,80 Q 165,140 170,220 T 160,320 L 130,310 Q 140,220 135,140 Z"
                fill="#ff975d"
                fillOpacity={selectedGlacier.id === "ngozumpa" ? "0.22" : "0.1"}
                stroke="#ff975d"
                strokeWidth={selectedGlacier.id === "ngozumpa" ? "2.5" : "1.2"}
                strokeDasharray="6,3"
              />
              <circle cx="155" cy="245" r="7" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
              <circle cx="158" cy="270" r="10" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
              <text
                x="80"
                y="95"
                fill="#ffbf9e"
                className="font-label-sm text-[10px] font-semibold font-mono"
              >
                NGOZUMPA TONGUE
              </text>
            </g>

            {/* Radar FOV Reticle */}
            <circle
              cx="400"
              cy="300"
              r="180"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="0.5"
              strokeDasharray="4,8"
              opacity="0.3"
            />
            <line x1="400" y1="270" x2="400" y2="330" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
            <line x1="370" y1="300" x2="430" y2="300" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
          </svg>
        </div>

        {/* Hover label */}
        {hoveredGlacier && (
          <div className="absolute pointer-events-none px-2 py-0.5 bg-surface-container-lowest/90 border border-primary text-primary font-mono text-[10px] rounded top-14 left-1/2 -translate-x-1/2 z-30">
            TARGET: {hoveredGlacier} [CLICK TO LOCK]
          </div>
        )}

        {/* FLOATING TACTICAL HUD CARD */}
        <div className="absolute bottom-16 left-4 z-20 w-80 bg-surface-container-lowest/95 backdrop-blur-md border border-outline-variant/60 p-space-sm shadow-2xl">
          <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/30 mb-space-xs">
            <div className="flex items-center gap-space-xs">
              <span className="w-2 h-2 bg-error animate-ping" />
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
            <div className="bg-surface-container-low p-1 border border-outline-variant/20">
              <span className="text-on-surface-variant block text-[9px] uppercase">
                GLACIER AREA
              </span>
              <span className="text-on-surface font-mono text-[11px] font-semibold">
                {selectedGlacier.area}
              </span>
              <span className="text-error text-[10px] ml-1">
                {selectedGlacier.areaChange}
              </span>
            </div>
            <div className="bg-surface-container-low p-1 border border-outline-variant/20">
              <span className="text-on-surface-variant block text-[9px] uppercase">
                PROGLACIAL VOL
              </span>
              <span className="text-primary font-mono text-[11px] font-semibold">
                {selectedGlacier.proglacialVol}
              </span>
              <span className="text-error text-[10px] ml-1">
                {selectedGlacier.volChange}
              </span>
            </div>
            <div className="bg-surface-container-low p-1 border border-outline-variant/20">
              <span className="text-on-surface-variant block text-[9px] uppercase">
                MORAINE WALL DEF
              </span>
              <span className="text-error font-mono text-[11px] font-semibold">
                {selectedGlacier.moraineDef}
              </span>
            </div>
            <div className="bg-surface-container-low p-1 border border-outline-variant/20">
              <span className="text-on-surface-variant block text-[9px] uppercase">
                SEEPAGE COEFF
              </span>
              <span className="text-tertiary font-mono text-[11px] font-semibold">
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
                {(2.0 / zoom).toFixed(1)} KM
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
            <span className="text-on-surface-variant text-[9px]">COMPARISON:</span>
            <span className="px-1 py-0.5 bg-surface-container-high border border-outline-variant/40 text-secondary font-mono">
              T-MINUS 24 MO
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
