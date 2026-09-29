"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";

interface SatelliteObservation {
  id: string;
  sceneId: string;
  platform: "Sentinel-1B" | "Landsat-9" | "Sentinel-2B" | "ICESat-2";
  sensorType: "SAR" | "Optical" | "Multispectral" | "Laser Altimetry";
  targetSector: string;
  acquisitionTime: string;
  relativeTime: string;
  resolutionM: number;
  cloudCoverPct: number;
  processingLevel: "Level-1C" | "Level-2A" | "ATL06 Geolocation" | "IW SLC";
  coherenceScore?: number;
  imageThumbnail: string;
  bandsAvailable: string[];
  fileSizeMb: number;
  orbitPass: string;
  sunElevationDeg?: number;
  incidenceAngleDeg?: number;
  summary: string;
}

const OBSERVATIONS_CATALOG: SatelliteObservation[] = [
  {
    id: "obs-1",
    sceneId: "S1B_IW_SLC__1SDV_20260930T094412_SIACHEN_DESC",
    platform: "Sentinel-1B",
    sensorType: "SAR",
    targetSector: "Teram Shehr Subglacial Basin",
    acquisitionTime: "2026-09-30 09:44:12 UTC",
    relativeTime: "18m ago",
    resolutionM: 5.0,
    cloudCoverPct: 0.0,
    processingLevel: "IW SLC",
    coherenceScore: 0.88,
    imageThumbnail: "/images/glof-valley-sat.jpg",
    bandsAvailable: ["VV", "VH", "Interferometric Phase", "Coherence"],
    fileSizeMb: 940,
    orbitPass: "Descending (Pass 106)",
    incidenceAngleDeg: 38.4,
    summary: "C-band Synthetic Aperture Radar dual-pol pass capturing subglacial surface dilation and transverse crevasse displacement.",
  },
  {
    id: "obs-2",
    sceneId: "LC09_L2SP_148035_20260930_20260930_02_T1",
    platform: "Landsat-9",
    sensorType: "Multispectral",
    targetSector: "Siachen Central Trunk & Saltoro",
    acquisitionTime: "2026-09-30 06:12:45 UTC",
    relativeTime: "3h 50m ago",
    resolutionM: 15.0,
    cloudCoverPct: 4.2,
    processingLevel: "Level-2A",
    imageThumbnail: "/images/khumbu-sat.jpg",
    bandsAvailable: ["B1-Ultra Blue", "B2-Blue", "B3-Green", "B4-Red", "B5-NIR", "B6-SWIR1", "B7-SWIR2", "B10-TIRS"],
    fileSizeMb: 1120,
    orbitPass: "Path 148, Row 035",
    sunElevationDeg: 49.8,
    summary: "High-radiometric optical multispectral acquisition capturing moraine supraglacial pond formation and snowline retreat.",
  },
  {
    id: "obs-3",
    sceneId: "S2B_MSIL2A_20260929T055819_N0500_R019_T43SFU",
    platform: "Sentinel-2B",
    sensorType: "Optical",
    targetSector: "Nubra Valley Terminal Snout",
    acquisitionTime: "2026-09-29 05:58:19 UTC",
    relativeTime: "1d ago",
    resolutionM: 10.0,
    cloudCoverPct: 1.8,
    processingLevel: "Level-2A",
    imageThumbnail: "/images/imja-lake-sat.jpg",
    bandsAvailable: ["B2-Blue", "B3-Green", "B4-Red", "B8-NIR", "NDWI Mask", "NDSI Snow Index"],
    fileSizeMb: 820,
    orbitPass: "Descending (Pass 019)",
    sunElevationDeg: 52.1,
    summary: "10m MSI atmospheric bottom-of-atmosphere reflectance scene isolating sediment run-off plumes and river stage geometry.",
  },
  {
    id: "obs-4",
    sceneId: "ATL06_20260928221509_07210803_006_01",
    platform: "ICESat-2",
    sensorType: "Laser Altimetry",
    targetSector: "Indira Col & Upper Accumulation Zone",
    acquisitionTime: "2026-09-28 22:15:09 UTC",
    relativeTime: "1d 11h ago",
    resolutionM: 0.7,
    cloudCoverPct: 0.0,
    processingLevel: "ATL06 Geolocation",
    imageThumbnail: "/images/glof-valley-sat.jpg",
    bandsAvailable: ["Photon Count", "Height Profile (h_li)", "Slope Corr", "Quality Flag"],
    fileSizeMb: 310,
    orbitPass: "Track #0721",
    summary: "Six-beam photon-counting ATLAS laser altimeter transect yielding precision glacier surface elevation anomalies (-3.2m drift).",
  },
  {
    id: "obs-5",
    sceneId: "S1A_IW_GRDH_1SDV_20260927T101830_SALTORO_ASC",
    platform: "Sentinel-1B",
    sensorType: "SAR",
    targetSector: "Saltoro Hanging Glacier Flank",
    acquisitionTime: "2026-09-27 10:18:30 UTC",
    relativeTime: "2d ago",
    resolutionM: 10.0,
    cloudCoverPct: 0.0,
    processingLevel: "Level-1C",
    coherenceScore: 0.92,
    imageThumbnail: "/images/khumbu-sat.jpg",
    bandsAvailable: ["VV Backscatter", "VH Backscatter", "Polarimetric Ratio"],
    fileSizeMb: 760,
    orbitPass: "Ascending (Pass 033)",
    incidenceAngleDeg: 42.1,
    summary: "Ascending geometry C-band SAR pass mapping steep ice cliff backscatter anomalies and hanging serac detachment zones.",
  },
  {
    id: "obs-6",
    sceneId: "LC09_L2SP_148035_20260924_20260924_02_T1",
    platform: "Landsat-9",
    sensorType: "Multispectral",
    targetSector: "Teram Shehr & Rimo Muztagh",
    acquisitionTime: "2026-09-24 06:12:15 UTC",
    relativeTime: "5d ago",
    resolutionM: 15.0,
    cloudCoverPct: 8.5,
    processingLevel: "Level-2A",
    imageThumbnail: "/images/imja-lake-sat.jpg",
    bandsAvailable: ["B1-B7", "NDWI", "Thermal Band 10"],
    fileSizeMb: 1080,
    orbitPass: "Path 148, Row 035",
    sunElevationDeg: 47.3,
    summary: "Clear-sky multispectral coverage demonstrating subglacial lake shoreline expansion (+18% perimeter increase over 16 days).",
  },
];

export default function ObservationsWorkspace() {
  const [selectedObs, setSelectedObs] = useState<SatelliteObservation>(OBSERVATIONS_CATALOG[0]);
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");
  const [sensorFilter, setSensorFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Visualizer adjustments
  const [activeBandMode, setActiveBandMode] = useState<string>("RGB");
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(105);
  const [invert, setInvert] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Zoom & Pan for image viewer
  const [imgZoom, setImgZoom] = useState<number>(1);
  const [imgPan, setImgPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Filtered catalog
  const filteredCatalog = useMemo(() => {
    return OBSERVATIONS_CATALOG.filter((obs) => {
      if (platformFilter !== "ALL" && obs.platform !== platformFilter) return false;
      if (sensorFilter !== "ALL" && obs.sensorType !== sensorFilter) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return (
          obs.sceneId.toLowerCase().includes(q) ||
          obs.targetSector.toLowerCase().includes(q) ||
          obs.platform.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [platformFilter, sensorFilter, searchQuery]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX - imgPan.x, y: e.clientY - imgPan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    setImgPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };

  const handleMouseUp = () => setIsPanning(false);

  const resetViewport = () => {
    setImgZoom(1);
    setImgPan({ x: 0, y: 0 });
    setBrightness(100);
    setContrast(105);
    setInvert(false);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-52px)] overflow-hidden p-3.5 bg-[#080c14] text-slate-200 select-none">
      {/* 2-COLUMN OBSERVATION WORKSPACE: CATALOG FEED (32%) + RADIOMETRIC SCENE INSPECTOR (68%) */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-3.5 h-full min-h-0 overflow-hidden">
        {/* LEFT COLUMN: FILTERABLE SATELLITE SCENE CATALOG (COL-SPAN-4) */}
        <div className="xl:col-span-4 flex flex-col h-full min-h-0 rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-xl backdrop-blur-md">
          {/* Header & Search */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-950/40 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-sm font-semibold text-slate-100 font-sans">
                  Satellite Observations
                </h1>
                <p className="text-[11px] text-slate-400 font-mono">
                  Siachen &amp; Eastern Karakoram Orbital Stream
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/30">
                {filteredCatalog.length} SCENES
              </span>
            </div>

            {/* Real-time search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">
                search
              </span>
              <input
                type="text"
                placeholder="Search scene ID, sensor, or sector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/60 transition-colors font-sans"
              />
            </div>

            {/* Constellation Filter Pills */}
            <div className="flex flex-wrap items-center gap-1">
              {["ALL", "Sentinel-1B", "Landsat-9", "Sentinel-2B", "ICESat-2"].map((plat) => (
                <button
                  key={plat}
                  onClick={() => setPlatformFilter(plat)}
                  className={`px-2 py-1 rounded text-[10.5px] font-medium transition-colors ${
                    platformFilter === plat
                      ? "bg-sky-500 text-white font-semibold shadow-sm"
                      : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800/80"
                  }`}
                >
                  {plat}
                </button>
              ))}
            </div>

            {/* Sensor Type Filter */}
            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
              <span className="text-slate-500">TYPE:</span>
              {["ALL", "SAR", "Optical", "Multispectral"].map((sensor) => (
                <button
                  key={sensor}
                  onClick={() => setSensorFilter(sensor)}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    sensorFilter === sensor
                      ? "text-sky-300 font-bold bg-sky-500/20 border border-sky-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {sensor}
                </button>
              ))}
            </div>
          </div>

          {/* Observations List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredCatalog.map((obs) => {
              const isSelected = selectedObs.id === obs.id;

              return (
                <div
                  key={obs.id}
                  onClick={() => setSelectedObs(obs)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col gap-2 ${
                    isSelected
                      ? "bg-slate-800/90 border-sky-500 shadow-md ring-1 ring-sky-500/30"
                      : "bg-slate-950/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono font-semibold ${
                          obs.sensorType === "SAR"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : obs.sensorType === "Optical"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : obs.sensorType === "Multispectral"
                            ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {obs.platform}
                      </span>
                      <span className="font-sans text-xs font-semibold text-slate-100 truncate max-w-[160px]">
                        {obs.targetSector}
                      </span>
                    </div>

                    <span className="font-mono text-[10.5px] text-slate-400">
                      {obs.relativeTime}
                    </span>
                  </div>

                  <p className="font-mono text-[10px] text-slate-400 truncate">
                    {obs.sceneId}
                  </p>

                  <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                    <span className="text-slate-300">Res: {obs.resolutionM}m</span>
                    <span>Cloud: {obs.cloudCoverPct}%</span>
                    <span>{obs.processingLevel}</span>
                    <span className="text-slate-300">{obs.fileSizeMb} MB</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: RADIOMETRIC SCENE INSPECTOR & SPECTRAL CANVAS (COL-SPAN-8) */}
        <div className="xl:col-span-8 flex flex-col h-full min-h-0 rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden relative shadow-xl backdrop-blur-md">
          {/* Top Inspector Bar */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-sans text-sm font-semibold text-slate-100">
                  {selectedObs.targetSector}
                </span>
                <span className="font-mono text-[10.5px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30">
                  {selectedObs.processingLevel}
                </span>
                <span className="font-mono text-[11px] text-slate-400 hidden sm:inline">
                  {selectedObs.orbitPass}
                </span>
              </div>
              <span className="font-mono text-[10.5px] text-slate-400 mt-0.5">
                Acquired: {selectedObs.acquisitionTime} • GSD: {selectedObs.resolutionM}m
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Link
                href={`/investigate?scene=${encodeURIComponent(selectedObs.sceneId)}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-sans text-xs font-semibold transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[15px]">explore</span>
                <span>Open in Investigation</span>
              </Link>

              <button
                onClick={() => alert(`Starting Cloud-Optimized GeoTIFF download for ${selectedObs.sceneId}`)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans text-xs font-medium border border-slate-700 transition-colors"
                title="Download Cloud-Optimized GeoTIFF"
              >
                <span className="material-symbols-outlined text-[15px]">download</span>
                <span className="hidden md:inline">GeoTIFF</span>
              </button>
            </div>
          </div>

          {/* Canvas Sub-Header: Band Switcher & Radiometric Controls */}
          <div className="px-3.5 py-2 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
            {/* Band Composites */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/60 rounded-lg p-0.5">
              <span className="text-[10px] font-mono text-slate-400 px-1.5 uppercase">
                Band:
              </span>
              {["RGB", "CIR", "NDWI", "SAR Phase", "Thermal"].map((b) => (
                <button
                  key={b}
                  onClick={() => setActiveBandMode(b)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    activeBandMode === b
                      ? "bg-sky-500 text-white font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            {/* Visual Adjustments */}
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <span>Bright:</span>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-16 h-1 bg-slate-800 rounded accent-sky-400"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span>Contrast:</span>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  className="w-16 h-1 bg-slate-800 rounded accent-sky-400"
                />
              </div>

              <button
                onClick={() => setInvert(!invert)}
                className={`px-1.5 py-0.5 rounded border text-[10.5px] transition-colors ${
                  invert
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                Invert
              </button>

              <button
                onClick={resetViewport}
                className="text-slate-400 hover:text-slate-200"
                title="Reset Image Adjustments"
              >
                <span className="material-symbols-outlined text-[15px]">refresh</span>
              </button>
            </div>
          </div>

          {/* Interactive Scene Viewer Canvas */}
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className={`relative flex-1 w-full h-full overflow-hidden bg-[#05070d] ${
              isPanning ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            <div
              className="relative w-full h-full origin-center transition-transform duration-75 ease-out flex items-center justify-center"
              style={{
                transform: `translate(${imgPan.x}px, ${imgPan.y}px) scale(${imgZoom})`,
              }}
            >
              {/* Satellite Image Display */}
              <div
                className="w-full h-full bg-contain bg-center bg-no-repeat transition-all duration-150"
                style={{
                  backgroundImage: `url('${selectedObs.imageThumbnail}')`,
                  filter: `brightness(${brightness}%) contrast(${contrast}%) ${
                    invert ? "invert(1)" : ""
                  } ${
                    activeBandMode === "CIR"
                      ? "hue-rotate(180deg) saturate(180%)"
                      : activeBandMode === "NDWI"
                      ? "hue-rotate(90deg) contrast(140%)"
                      : activeBandMode === "SAR Phase"
                      ? "saturate(0%) contrast(160%)"
                      : activeBandMode === "Thermal"
                      ? "hue-rotate(240deg) saturate(200%)"
                      : ""
                  }`,
                }}
              />

              {/* Cartographic Coordinate Overlay Grid */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none opacity-20 border border-slate-700 grid grid-cols-6 grid-rows-4">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="border border-slate-600/40" />
                  ))}
                </div>
              )}
            </div>

            {/* Bottom-Left Radiometric & Resolution Badge */}
            <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 shadow-md">
              <span className="text-sky-400 font-semibold">{selectedObs.platform}</span>
              <span>•</span>
              <span>{activeBandMode} Composite</span>
              <span>•</span>
              <span>Zoom: {(imgZoom * 100).toFixed(0)}%</span>
            </div>

            {/* Bottom-Right Zoom & Grid Controls */}
            <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 bg-slate-950/85 backdrop-blur-md border border-slate-800 p-1 rounded-lg shadow-md">
              <button
                onClick={() => setImgZoom((prev) => Math.min(prev * 1.25, 4))}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-[15px]">add</span>
              </button>
              <button
                onClick={() => setImgZoom((prev) => Math.max(prev * 0.8, 0.5))}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-[15px]">remove</span>
              </button>
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-1 rounded ${
                  showGrid ? "text-sky-400" : "text-slate-500 hover:text-slate-300"
                }`}
                title="Toggle Coordinate Grid"
              >
                <span className="material-symbols-outlined text-[15px]">grid_4x4</span>
              </button>
              <button
                onClick={resetViewport}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                title="Fit to Screen"
              >
                <span className="material-symbols-outlined text-[15px]">fit_screen</span>
              </button>
            </div>
          </div>

          {/* Bottom Telemetry Footer Strip */}
          <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] flex flex-col md:flex-row items-start md:items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="material-symbols-outlined text-sky-400 text-[16px]">info</span>
              <span className="font-sans leading-relaxed">{selectedObs.summary}</span>
            </div>

            <div className="flex items-center gap-3 font-mono text-[10px] text-slate-400 shrink-0">
              <span>Bands: {selectedObs.bandsAvailable.length}</span>
              <span>•</span>
              <span>Sun El: {selectedObs.sunElevationDeg ? `${selectedObs.sunElevationDeg}°` : "N/A"}</span>
              <span>•</span>
              <span>Incidence: {selectedObs.incidenceAngleDeg ? `${selectedObs.incidenceAngleDeg}°` : "N/A"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
