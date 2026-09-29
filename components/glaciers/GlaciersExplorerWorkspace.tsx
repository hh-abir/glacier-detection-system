"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

interface GlacierRecord {
  id: string;
  name: string;
  code: string;
  sector: "Main Siachen Trunk" | "Saltoro Flank" | "Teram Shehr" | "Nubra Basin" | "Shyok Confluence";
  areaKm2: number;
  lengthKm: number;
  volumeKm3: number;
  elevationM: number;
  velocityCmDay: number;
  riskLevel: "High Advisory" | "Moderate Risk" | "Nominal";
  trend: "Surging" | "Accelerating" | "Stable" | "Retreating";
  moraineStability: number; // 0 - 100%
  description: string;
  lastObservation: string;
}

const GLACIERS_DATA: GlacierRecord[] = [
  {
    id: "siachen_main",
    name: "Siachen Glacier (Central Trunk)",
    code: "GL-SIACHEN-01",
    sector: "Main Siachen Trunk",
    areaKm2: 712,
    lengthKm: 76,
    volumeKm3: 340,
    elevationM: 5420,
    velocityCmDay: 28,
    riskLevel: "Moderate Risk",
    trend: "Accelerating",
    moraineStability: 74,
    description: "Central 76km glacier trunk connecting Indira Col to Nubra terminal snout with active transverse crevasse dilation.",
    lastObservation: "28m ago (Sentinel-1B)",
  },
  {
    id: "teram_shehr",
    name: "Teram Shehr Subglacial Basin",
    code: "GL-SIACHEN-04",
    sector: "Teram Shehr",
    areaKm2: 185,
    lengthKm: 28,
    volumeKm3: 84,
    elevationM: 4780,
    velocityCmDay: 42,
    riskLevel: "High Advisory",
    trend: "Surging",
    moraineStability: 48,
    description: "Major eastern tributary displaying rapid subglacial melt reservoir expansion and marginal moraine dam factor.",
    lastObservation: "14m ago (Landsat-9)",
  },
  {
    id: "saltoro_serac",
    name: "Saltoro Hanging Wall Serac",
    code: "GL-SALTORO-09",
    sector: "Saltoro Flank",
    areaKm2: 94,
    lengthKm: 16,
    volumeKm3: 28,
    elevationM: 6120,
    velocityCmDay: 14,
    riskLevel: "High Advisory",
    trend: "Accelerating",
    moraineStability: 42,
    description: "Steep hanging ice cleavage wall with 420,000 m³ mass detachment risk monitored by InSAR interferometry.",
    lastObservation: "48m ago (ESA SAR)",
  },
  {
    id: "bilafond_la",
    name: "Bilafond La Glacier",
    code: "GL-SALTORO-04",
    sector: "Saltoro Flank",
    areaKm2: 62,
    lengthKm: 12,
    volumeKm3: 19,
    elevationM: 5540,
    velocityCmDay: 6,
    riskLevel: "Moderate Risk",
    trend: "Stable",
    moraineStability: 82,
    description: "Cold-ice alpine saddle glacier flanking the southwestern ridge with intact permafrost core.",
    lastObservation: "1h 12m ago (Sentinel-2)",
  },
  {
    id: "lolofond",
    name: "Lolofond Tributary Glacier",
    code: "GL-SIACHEN-02",
    sector: "Main Siachen Trunk",
    areaKm2: 54,
    lengthKm: 11,
    volumeKm3: 14,
    elevationM: 5280,
    velocityCmDay: 8,
    riskLevel: "Nominal",
    trend: "Stable",
    moraineStability: 88,
    description: "Western tributary entering the middle Siachen trunk with stable supraglacial moraine cover.",
    lastObservation: "2h ago (Landsat-9)",
  },
  {
    id: "chong_kumdan",
    name: "Chong Kumdan Glacier",
    code: "GL-SHYOK-07",
    sector: "Shyok Confluence",
    areaKm2: 142,
    lengthKm: 24,
    volumeKm3: 52,
    elevationM: 4920,
    velocityCmDay: 32,
    riskLevel: "Moderate Risk",
    trend: "Surging",
    moraineStability: 64,
    description: "Known Karakoram surge-type glacier periodically advancing into the Upper Shyok River channel.",
    lastObservation: "3h ago (Sentinel-1B)",
  },
  {
    id: "rimo_system",
    name: "Rimo Glacier System (North & Central)",
    code: "GL-SHYOK-01",
    sector: "Shyok Confluence",
    areaKm2: 286,
    lengthKm: 44,
    volumeKm3: 118,
    elevationM: 5680,
    velocityCmDay: 12,
    riskLevel: "Moderate Risk",
    trend: "Stable",
    moraineStability: 78,
    description: "Vast ice field system draining eastward toward the Upper Shyok headwaters, cold-ice basal regime.",
    lastObservation: "3h 45m ago (ICESat-2)",
  },
  {
    id: "singhi",
    name: "Singhi Glacier",
    code: "GL-TERAM-05",
    sector: "Teram Shehr",
    areaKm2: 78,
    lengthKm: 15,
    volumeKm3: 22,
    elevationM: 5340,
    velocityCmDay: 10,
    riskLevel: "Nominal",
    trend: "Stable",
    moraineStability: 86,
    description: "High-altitude basin north of Teram Shehr providing continuous cold firn accumulation.",
    lastObservation: "4h ago (Sentinel-2)",
  },
  {
    id: "karakoram_pass",
    name: "Karakoram Pass Glacial Massif",
    code: "GL-TERAM-08",
    sector: "Teram Shehr",
    areaKm2: 46,
    lengthKm: 9,
    volumeKm3: 11,
    elevationM: 5570,
    velocityCmDay: 4,
    riskLevel: "Nominal",
    trend: "Stable",
    moraineStability: 91,
    description: "High divide permafrost snowfields with low mass turnover and minimal melting.",
    lastObservation: "5h ago (Landsat-9)",
  },
  {
    id: "gyong_la",
    name: "Gyong La Tongue",
    code: "GL-SALTORO-03",
    sector: "Saltoro Flank",
    areaKm2: 38,
    lengthKm: 8,
    volumeKm3: 9,
    elevationM: 5680,
    velocityCmDay: 7,
    riskLevel: "Moderate Risk",
    trend: "Retreating",
    moraineStability: 71,
    description: "Southern Saltoro tongue exhibiting slow terminus thinning and supraglacial lakelet coalescence.",
    lastObservation: "5h 30m ago (Sentinel-1B)",
  },
  {
    id: "warshi_basin",
    name: "Warshi Meltwater Basin",
    code: "GL-NUBRA-06",
    sector: "Nubra Basin",
    areaKm2: 22,
    lengthKm: 6,
    volumeKm3: 4,
    elevationM: 3840,
    velocityCmDay: 16,
    riskLevel: "Moderate Risk",
    trend: "Accelerating",
    moraineStability: 67,
    description: "Transition zone between glacial snout and upper Nubra riverbed with extensive gravel terraces.",
    lastObservation: "6h ago (Hydrology Gauge)",
  },
  {
    id: "panamik_basin",
    name: "Panamik Fluvial Outflow Zone",
    code: "GL-NUBRA-02",
    sector: "Nubra Basin",
    areaKm2: 18,
    lengthKm: 5,
    volumeKm3: 2,
    elevationM: 3210,
    velocityCmDay: 2,
    riskLevel: "Nominal",
    trend: "Stable",
    moraineStability: 94,
    description: "Low-gradient alluvial valley section with geothermal springs and river discharge monitoring arrays.",
    lastObservation: "6h 15m ago (Hydrology Gauge)",
  },
  {
    id: "indira_col",
    name: "Indira Col Accumulation Névé",
    code: "GL-SIACHEN-00",
    sector: "Main Siachen Trunk",
    areaKm2: 96,
    lengthKm: 14,
    volumeKm3: 45,
    elevationM: 5753,
    velocityCmDay: 3,
    riskLevel: "Nominal",
    trend: "Stable",
    moraineStability: 96,
    description: "Northernmost headwall source of Siachen Glacier, cold-firn accumulation zone above 5,700m.",
    lastObservation: "7h ago (ICESat-2)",
  },
  {
    id: "nubra_snout",
    name: "Nubra Valley Terminal Snout",
    code: "GL-SIACHEN-99",
    sector: "Main Siachen Trunk",
    areaKm2: 34,
    lengthKm: 7,
    volumeKm3: 8,
    elevationM: 3620,
    velocityCmDay: 18,
    riskLevel: "Moderate Risk",
    trend: "Retreating",
    moraineStability: 62,
    description: "Terminal ablation terminus discharging into the Nubra Riverbed with heavy debris mantle.",
    lastObservation: "7h 45m ago (Sentinel-1B)",
  },
];

export default function GlaciersExplorerWorkspace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("All");
  const [selectedRisk, setSelectedRisk] = useState<string>("All");
  const [sortBy, setSortBy] = useState<keyof GlacierRecord>("areaKm2");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [activeGlacier, setActiveGlacier] = useState<GlacierRecord | null>(GLACIERS_DATA[0]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filtered and Sorted Records
  const filteredGlaciers = useMemo(() => {
    return GLACIERS_DATA.filter((g) => {
      const matchesSearch =
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.sector.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector = selectedSector === "All" || g.sector === selectedSector;
      const matchesRisk = selectedRisk === "All" || g.riskLevel === selectedRisk;
      return matchesSearch && matchesSector && matchesRisk;
    }).sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "desc" ? valB - valA : valA - valB;
      }
      return sortOrder === "desc"
        ? String(valB).localeCompare(String(valA))
        : String(valA).localeCompare(String(valB));
    });
  }, [searchQuery, selectedSector, selectedRisk, sortBy, sortOrder]);

  const handleSort = (field: keyof GlacierRecord) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const openGlacierDrawer = (glacier: GlacierRecord) => {
    setActiveGlacier(glacier);
    setDrawerOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-52px)] overflow-hidden bg-[#080c14] text-slate-200 select-none">
      {/* Top Header & Search Bar */}
      <section className="shrink-0 p-4 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3.5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-sky-400">terrain</span>
            <h1 className="font-heading font-bold text-base text-white tracking-tight">
              Glaciers &amp; Subglacial Basins Catalog
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700/60 text-[10px] font-mono text-slate-300">
              {filteredGlaciers.length} of {GLACIERS_DATA.length} Assets
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Eastern Karakoram Earth Observation database • Siachen, Saltoro, and Shyok catchments.
          </p>
        </div>

        {/* Action Controls & Search Input */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search glacier name, ID or sector..."
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/70"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded ${
                viewMode === "grid" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Grid Card View"
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded ${
                viewMode === "table" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Dense Table View"
            >
              <span className="material-symbols-outlined text-[16px]">view_list</span>
            </button>
          </div>
        </div>
      </section>

      {/* Filter Ribbon Strip */}
      <section className="shrink-0 px-4 py-2.5 border-b border-slate-800/60 bg-[#090e18] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Sector Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-[11px] text-slate-500 uppercase font-mono mr-1">Sector:</span>
          {["All", "Main Siachen Trunk", "Saltoro Flank", "Teram Shehr", "Nubra Basin", "Shyok Confluence"].map(
            (sector) => (
              <button
                key={sector}
                onClick={() => setSelectedSector(sector)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap ${
                  selectedSector === sector
                    ? "bg-sky-500 text-white shadow-sm"
                    : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {sector}
              </button>
            )
          )}
        </div>

        {/* Risk Filter Chips */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500 uppercase font-mono mr-1">Risk:</span>
          {["All", "High Advisory", "Moderate Risk", "Nominal"].map((risk) => (
            <button
              key={risk}
              onClick={() => setSelectedRisk(risk)}
              className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                selectedRisk === risk
                  ? risk === "High Advisory"
                    ? "bg-rose-500 text-white font-medium"
                    : risk === "Moderate Risk"
                    ? "bg-amber-500 text-white font-medium"
                    : "bg-emerald-500 text-white font-medium"
                  : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {risk}
            </button>
          ))}
        </div>
      </section>

      {/* Main Catalog Workspace with Detail Drawer */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Cards or Table */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-5">
          {viewMode === "grid" ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
              {filteredGlaciers.map((g) => {
                const isSelected = activeGlacier?.id === g.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => openGlacierDrawer(g)}
                    className={`p-4 rounded-xl bg-slate-900/60 border cursor-pointer transition-all shadow-sm flex flex-col gap-3 relative overflow-hidden backdrop-blur-md hover:bg-slate-800/50 ${
                      isSelected
                        ? "border-sky-500 ring-1 ring-sky-500/40"
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {/* Top Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="font-heading font-semibold text-sm text-white leading-tight">
                          {g.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {g.code} • {g.sector}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-semibold font-mono whitespace-nowrap ${
                          g.riskLevel === "High Advisory"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                            : g.riskLevel === "Moderate Risk"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {g.riskLevel}
                      </span>
                    </div>

                    {/* Stats Matrix Grid */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] font-mono">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-sans">Area</span>
                        <span className="text-white font-semibold">{g.areaKm2} km²</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-sans">Volume</span>
                        <span className="text-white font-semibold">{g.volumeKm3} km³</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-sans">Velocity</span>
                        <span className="text-sky-400 font-semibold">{g.velocityCmDay} cm/d</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {g.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/70 text-[10px] text-slate-400 font-mono">
                      <span>{g.lastObservation}</span>
                      <span className="text-sky-400 flex items-center gap-0.5 font-sans font-medium">
                        <span>Inspect Asset</span>
                        <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TABLE VIEW */
            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/60 shadow-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] uppercase font-mono text-slate-400">
                  <tr>
                    <th
                      onClick={() => handleSort("name")}
                      className="p-3 cursor-pointer hover:text-white"
                    >
                      Glacier Asset {sortBy === "name" && (sortOrder === "desc" ? "↓" : "↑")}
                    </th>
                    <th
                      onClick={() => handleSort("sector")}
                      className="p-3 cursor-pointer hover:text-white"
                    >
                      Sector
                    </th>
                    <th
                      onClick={() => handleSort("areaKm2")}
                      className="p-3 cursor-pointer hover:text-white font-mono"
                    >
                      Area {sortBy === "areaKm2" && (sortOrder === "desc" ? "↓" : "↑")}
                    </th>
                    <th
                      onClick={() => handleSort("volumeKm3")}
                      className="p-3 cursor-pointer hover:text-white font-mono"
                    >
                      Ice Volume {sortBy === "volumeKm3" && (sortOrder === "desc" ? "↓" : "↑")}
                    </th>
                    <th
                      onClick={() => handleSort("velocityCmDay")}
                      className="p-3 cursor-pointer hover:text-white font-mono"
                    >
                      Velocity {sortBy === "velocityCmDay" && (sortOrder === "desc" ? "↓" : "↑")}
                    </th>
                    <th
                      onClick={() => handleSort("elevationM")}
                      className="p-3 cursor-pointer hover:text-white font-mono"
                    >
                      Mean Elev
                    </th>
                    <th className="p-3">Risk Assessment</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredGlaciers.map((g) => (
                    <tr
                      key={g.id}
                      onClick={() => openGlacierDrawer(g)}
                      className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                        activeGlacier?.id === g.id ? "bg-slate-800/60" : ""
                      }`}
                    >
                      <td className="p-3">
                        <div className="font-semibold text-white">{g.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{g.code}</div>
                      </td>
                      <td className="p-3 text-slate-300">{g.sector}</td>
                      <td className="p-3 font-mono text-slate-200">{g.areaKm2} km²</td>
                      <td className="p-3 font-mono text-slate-200">{g.volumeKm3} km³</td>
                      <td className="p-3 font-mono text-sky-400 font-semibold">{g.velocityCmDay} cm/d</td>
                      <td className="p-3 font-mono text-slate-300">{g.elevationM} m</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-semibold font-mono ${
                            g.riskLevel === "High Advisory"
                              ? "bg-rose-500/20 text-rose-300"
                              : g.riskLevel === "Moderate Risk"
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-emerald-500/20 text-emerald-400"
                          }`}
                        >
                          {g.riskLevel}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button className="text-sky-400 hover:text-sky-300 font-medium text-xs">
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Analytical Detail Drawer */}
        {drawerOpen && activeGlacier && (
          <aside className="w-88 2xl:w-96 bg-slate-950/95 border-l border-slate-800 p-5 flex flex-col gap-4 overflow-y-auto z-30 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-sky-400 font-medium">
                  {activeGlacier.code}
                </span>
                <span className="font-heading font-bold text-base text-white">
                  {activeGlacier.name}
                </span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Satellite Map Orthomosaic Thumbnail */}
            <div className="h-44 w-full rounded-xl overflow-hidden relative border border-slate-800 shadow-inner group">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('/images/glof-valley-sat.jpg')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-slate-700/60">
                Sentinel-1 InSAR Coherence
              </div>
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs font-mono text-slate-300">
                <span>{activeGlacier.elevationM}m ASL</span>
                <span className="text-emerald-400">γ 0.89 Optimal</span>
              </div>
            </div>

            {/* Scientific Diagnostics Matrix */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Moraine Dam Integrity:</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        activeGlacier.moraineStability > 75
                          ? "bg-emerald-400"
                          : activeGlacier.moraineStability > 50
                          ? "bg-amber-400"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${activeGlacier.moraineStability}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-white">
                    {activeGlacier.moraineStability}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col">
                  <span className="text-[10px] text-slate-500 font-sans">Dynamic Trend</span>
                  <span className="text-sm font-semibold text-white mt-0.5">{activeGlacier.trend}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col">
                  <span className="text-[10px] text-slate-500 font-sans">Linear Length</span>
                  <span className="text-sm font-semibold text-sky-400 mt-0.5">
                    {activeGlacier.lengthKm} km
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-sans font-medium">
                  Scientific Assessment
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeGlacier.description}
                </p>
              </div>
            </div>

            {/* Cross-Platform Deep Links */}
            <div className="mt-auto flex flex-col gap-2 pt-3 border-t border-slate-800">
              <Link
                href="/investigate"
                className="w-full py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-medium text-center shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <span>Launch in Investigation Workspace</span>
                <span className="material-symbols-outlined text-[15px]">open_in_new</span>
              </Link>
              <Link
                href="/glof-modeling"
                className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium text-center border border-slate-800 transition-all"
              >
                Simulate Hydrographic Outburst
              </Link>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
