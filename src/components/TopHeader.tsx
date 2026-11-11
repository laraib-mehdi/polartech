import React from 'react';
import {
  Satellite,
  Coins,
  ShieldCheck,
  Zap,
  Flame,
  Radio,
  Cpu,
  RefreshCw,
  Sun,
  Wind,
  Thermometer,
  CloudSnow,
  Trophy,
  Star,
  Briefcase,
  Leaf,
} from 'lucide-react';
import { MeteorologicalData, SatelliteTelemetry } from '../types/microgrid';

interface TopHeaderProps {
  weather: MeteorologicalData;
  satellite: SatelliteTelemetry;
  isAiEnabled: boolean;
  onToggleAi: () => void;
  isHydrogenEnabled: boolean;
  onToggleHydrogen: () => void;
  isBlizzardMode: boolean;
  onToggleBlizzardMode: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  onOpenSatelliteModal: () => void;
  onOpenBlockchainModal: () => void;
  onOpenWeatherModal: () => void;
  onOpenRankingsModal?: () => void;
  onOpenCommercialModal?: () => void;
  onOpenCarbonModal?: () => void;
  onResetAllFaults: () => void;
  activeFaultCount: number;
  renewableSharePercent: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  weather,
  satellite,
  isAiEnabled,
  onToggleAi,
  isHydrogenEnabled,
  onToggleHydrogen,
  isBlizzardMode,
  onToggleBlizzardMode,
  showLabels,
  onToggleLabels,
  onOpenSatelliteModal,
  onOpenBlockchainModal,
  onOpenWeatherModal,
  onOpenRankingsModal,
  onOpenCommercialModal,
  onOpenCarbonModal,
  onResetAllFaults,
  activeFaultCount,
  renewableSharePercent,
}) => {
  const formatSolarTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours % 1) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  return (
    <header className="w-full bg-[#070e17]/95 border-b border-slate-800/90 backdrop-blur-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-30 select-none">
      {/* Brand & Station Header */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-400 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-[#070e17] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#070e17] pulse-live" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
              MAITRI 2 POLAR STATION
            </h1>
            {/* #1 Station Award Badge */}
            <button
              onClick={onOpenRankingsModal}
              className="group flex items-center gap-1 text-[10px] px-2 py-0.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/50 rounded font-mono font-bold transition-all shadow-sm shadow-amber-500/10 cursor-pointer"
              title="Click to view #1 Global Polar Research Station Benchmark & Index"
            >
              <Trophy className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>GLOBAL RANK #1</span>
            </button>
            <span className="text-[10px] px-1.5 py-0.5 bg-sky-950/80 text-sky-400 border border-sky-800/60 rounded font-mono font-medium hidden sm:inline-block">
              EDGE-AI SCADA v4.2
            </span>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
            <span className="text-slate-300 font-medium">70.76°S, 11.73°E · Schirmacher Oasis</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400/90 font-medium hidden sm:inline">NCPOR India</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-sky-300 font-semibold">Solar Time {formatSolarTime(weather.stationSolarHour)}</span>
          </p>
        </div>
      </div>

      {/* Center Live Telemetry Badges */}
      <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
        {/* Renewability Pill / Carbon Accounting Trigger */}
        <button
          onClick={onOpenCarbonModal}
          className="bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-emerald-600/80 rounded-lg px-2.5 py-1.5 flex items-center gap-2 cursor-pointer transition-colors"
          title="Click to inspect Carbon Offset Accounting, Tree-Planting Equivalencies & Environmental Ledger"
        >
          <span className="text-[10px] text-slate-400 uppercase">Renewable:</span>
          <span
            className={`font-bold flex items-center gap-1 ${
              renewableSharePercent >= 90
                ? 'text-emerald-400 glow-green'
                : renewableSharePercent >= 60
                ? 'text-sky-400 glow-cyan'
                : 'text-amber-400'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {renewableSharePercent.toFixed(1)}%
          </span>
        </button>

        {/* Weather Quick Pill */}
        <button
          onClick={onOpenWeatherModal}
          className="bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 flex items-center gap-2.5 text-slate-300 transition-colors"
          title="Click to view detailed Antarctic weather telemetry"
        >
          <div className="flex items-center gap-1 text-sky-400">
            <Thermometer className="w-3.5 h-3.5" />
            <span>{weather.airTemp.toFixed(1)}°C</span>
          </div>
          <div className="flex items-center gap-1 text-cyan-300">
            <Wind className="w-3.5 h-3.5" />
            <span>{weather.windSpeed.toFixed(1)} m/s</span>
          </div>
          <div className="flex items-center gap-1 text-amber-300">
            <Sun className="w-3.5 h-3.5" />
            <span>{weather.sunElevationDeg.toFixed(0)}°</span>
          </div>
        </button>

        {/* LEO Satellite Telemetry Link */}
        <button
          onClick={onOpenSatelliteModal}
          className="bg-slate-900/90 hover:bg-slate-800/90 border border-purple-800/60 rounded-lg px-2.5 py-1.5 flex items-center gap-2 text-purple-300 transition-colors"
          title="Click to inspect Satellite Telemetry & Remote Command authorization"
        >
          <Satellite className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span className="font-semibold">{satellite.constellation === 'ISRO_POLAR_LINK' ? 'ISRO Polar Sat' : satellite.constellation.replaceAll('_', ' ')}</span>
          <span className="text-[11px] text-emerald-400 font-bold">{satellite.latencyMs}ms</span>
        </button>

        {/* Blockchain Energy Trading Hub */}
        <button
          onClick={onOpenBlockchainModal}
          className="bg-slate-900/90 hover:bg-slate-800/90 border border-emerald-800/60 rounded-lg px-2.5 py-1.5 flex items-center gap-2 text-emerald-300 transition-colors"
          title="Click to open Blockchain Energy Trading Ledger"
        >
          <Coins className="w-3.5 h-3.5 text-emerald-400" />
          <span>P2P Grid Ledger</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-live" />
        </button>

        {/* Commercialization & 100% Renewability Blueprint */}
        <button
          onClick={onOpenCommercialModal}
          className="bg-slate-900/90 hover:bg-slate-800/90 border border-sky-800/60 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-sky-300 transition-colors cursor-pointer"
          title="Click to inspect EMS Commercialization, Problems Solved & 100% Renewable Architecture"
        >
          <Briefcase className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold">EMS Blueprint</span>
        </button>

        {/* Carbon Accounting & Ecological Impact */}
        <button
          onClick={onOpenCarbonModal}
          className="bg-slate-900/90 hover:bg-slate-800/90 border border-emerald-800/60 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-emerald-300 transition-colors cursor-pointer"
          title="Click to view Carbon Offset Accounting, Tree-Planting Equivalencies & Environmental Ledger"
        >
          <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold">CO₂ Offset</span>
        </button>
      </div>

      {/* Right Controls & Operational Modes */}
      <div className="flex items-center gap-2">
        {/* Edge AI Toggle */}
        <button
          onClick={onToggleAi}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            isAiEnabled
              ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md shadow-sky-600/30'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
          title="Toggle Edge AI multi-objective neural dispatch"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>{isAiEnabled ? 'EDGE AI: ON' : 'LEGACY RULES'}</span>
        </button>

        {/* Hydrogen Storage Toggle */}
        <button
          onClick={onToggleHydrogen}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            isHydrogenEnabled
              ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-600/30'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
          title="Toggle Seasonal Hydrogen (PEM Electrolyzer & Fuel Cell) co-optimization"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>{isHydrogenEnabled ? 'H₂ HUB: ON' : 'H₂ OFF'}</span>
        </button>

        {/* Blizzard Survival Black-Start Toggle */}
        <button
          onClick={onToggleBlizzardMode}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            isBlizzardMode
              ? 'bg-red-600 text-white animate-pulse shadow-md shadow-red-600/40'
              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
          }`}
          title="Activate Extreme Polar Blizzard Survival & Uninterruptible Continuity"
        >
          <CloudSnow className="w-3.5 h-3.5" />
          <span>{isBlizzardMode ? 'BLIZZARD SURVIVAL' : 'NORMAL OPS'}</span>
        </button>

        {/* Repair Crew / Fault Clear */}
        {activeFaultCount > 0 && (
          <button
            onClick={onResetAllFaults}
            className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
            title="Dispatch emergency repair crew to reset all degraded components"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Crew Repair ({activeFaultCount})</span>
          </button>
        )}
      </div>
    </header>
  );
};
