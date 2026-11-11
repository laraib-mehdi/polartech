import React from 'react';
import {
  CloudSnow,
  Wind,
  Sun,
  Thermometer,
  Compass,
  Radio,
  Sliders,
  Check,
  RotateCcw,
  X,
  Gauge,
} from 'lucide-react';
import { MeteorologicalData } from '../types/microgrid';

interface MeteorologicalPanelProps {
  isOpen: boolean;
  onClose: () => void;
  weather: MeteorologicalData;
  onUpdateManualOverride: (
    key: keyof MeteorologicalData['manualOverrides'],
    enabled: boolean
  ) => void;
  onUpdateManualValue: (
    key: keyof MeteorologicalData['manualValues'],
    value: number
  ) => void;
  onResetAllOverrides: () => void;
  onSetSeasonMode: (mode: MeteorologicalData['seasonMode']) => void;
}

export const MeteorologicalPanel: React.FC<MeteorologicalPanelProps> = ({
  isOpen,
  onClose,
  weather,
  onUpdateManualOverride,
  onUpdateManualValue,
  onResetAllOverrides,
  onSetSeasonMode,
}) => {
  if (!isOpen) return null;

  // Calculate wind chill factor using polar formula: Twc = 13.12 + 0.6215*Ta - 11.37*V^0.16 + 0.3965*Ta*V^0.16
  const vKmh = Math.max(1, weather.windSpeed * 3.6);
  const windChillC =
    13.12 +
    0.6215 * weather.airTemp -
    11.37 * Math.pow(vKmh, 0.16) +
    0.3965 * weather.airTemp * Math.pow(vKmh, 0.16);

  const activeOverridesCount = Object.values(weather.manualOverrides).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-2xl bg-[#0b1624] border border-sky-800/80 rounded-2xl shadow-2xl p-6 text-slate-100 font-mono relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <CloudSnow className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                ANTARCTIC METEOROLOGICAL TELEMETRY
                {activeOverridesCount > 0 ? (
                  <span className="text-[10px] px-2 py-0.5 bg-amber-950/80 text-amber-400 border border-amber-700/60 rounded">
                    {activeOverridesCount} OVERRIDES ACTIVE
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 rounded">
                    LIVE AWS TELEMETRY
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Maitri 2 Station AWS (70.76°S, 11.73°E) · Schirmacher Oasis Katabatic & Polar Plateau Corridor
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Polar Weather Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 shrink-0">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-1.5 text-sky-400 mb-1">
              <Thermometer className="w-4 h-4" />
              <span className="text-[10px] text-slate-400 uppercase">Air Temp</span>
            </div>
            <div className="text-lg font-bold text-white">{weather.airTemp.toFixed(1)}°C</div>
            <div className="text-[10px] text-slate-400">Wind Chill: <strong className="text-sky-300">{windChillC.toFixed(1)}°C</strong></div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-1.5 text-cyan-400 mb-1">
              <Wind className="w-4 h-4" />
              <span className="text-[10px] text-slate-400 uppercase">Katabatic Wind</span>
            </div>
            <div className="text-lg font-bold text-white">{weather.windSpeed.toFixed(1)} m/s</div>
            <div className="text-[10px] text-slate-400">Gusts: <strong className="text-cyan-300">{(weather.windSpeed * 1.35).toFixed(1)} m/s</strong></div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-1.5 text-amber-400 mb-1">
              <Sun className="w-4 h-4" />
              <span className="text-[10px] text-slate-400 uppercase">Sun Elevation</span>
            </div>
            <div className="text-lg font-bold text-white">{weather.sunElevationDeg.toFixed(1)}°</div>
            <div className="text-[10px] text-slate-400">Cloud: <strong className="text-amber-300">{weather.cloudCoverPercent.toFixed(0)}%</strong></div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-1.5 text-purple-400 mb-1">
              <Radio className="w-4 h-4" />
              <span className="text-[10px] text-slate-400 uppercase">Geomagnetic Kp</span>
            </div>
            <div className="text-lg font-bold text-white">Kp {weather.geomagneticKpIndex}</div>
            <div className="text-[10px] text-slate-400">Aurora / Solar flux</div>
          </div>
        </div>

        {/* Polar Season & Sun Orbit Selector */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 mb-5 shrink-0">
          <label className="text-xs font-bold text-slate-300 block mb-2 font-sans">
            Antarctic Season & Solar Irradiance Model:
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs font-sans">
            {[
              { id: 'AUTO', label: 'Auto (Astronomical Date)' },
              { id: 'SUMMER_POLAR_DAY', label: 'Summer (Midnight Sun)' },
              { id: 'WINTER_POLAR_NIGHT', label: 'Winter (Polar Night)' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => onSetSeasonMode(s.id as MeteorologicalData['seasonMode'])}
                className={`px-3 py-2 rounded-xl text-center font-medium transition-all ${
                  weather.seasonMode === s.id
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Environmental Sliders & Manual Weather Overrides */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <div className="flex items-center justify-between text-xs font-sans font-bold text-slate-300">
            <span>Simulation Parameters & Environmental Overrides</span>
            {activeOverridesCount > 0 && (
              <button
                onClick={onResetAllOverrides}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono font-normal"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All to Live
              </button>
            )}
          </div>

          {/* Wind Slider */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">
                Wind Speed: <strong className="text-cyan-400 font-mono">{weather.manualValues.windSpeed.toFixed(1)} m/s</strong>
              </span>
              <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={weather.manualOverrides.windSpeed}
                  onChange={(e) => onUpdateManualOverride('windSpeed', e.target.checked)}
                  className="accent-sky-500"
                />
                Override
              </label>
            </div>
            <input
              type="range"
              min="0"
              max="32"
              step="0.5"
              disabled={!weather.manualOverrides.windSpeed}
              value={weather.manualValues.windSpeed}
              onChange={(e) => onUpdateManualValue('windSpeed', Number(e.target.value))}
              className="w-full accent-cyan-400 disabled:opacity-40"
            />
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>0 m/s (Calm)</span>
              <span>12 m/s (Rated Peak)</span>
              <span>25 m/s (Cut-out Blizzard)</span>
            </div>
          </div>

          {/* Air Temp Slider */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">
                Air Temperature: <strong className="text-sky-400 font-mono">{weather.manualValues.airTemp.toFixed(1)}°C</strong>
              </span>
              <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={weather.manualOverrides.airTemp}
                  onChange={(e) => onUpdateManualOverride('airTemp', e.target.checked)}
                  className="accent-sky-500"
                />
                Override
              </label>
            </div>
            <input
              type="range"
              min="-45"
              max="10"
              step="0.5"
              disabled={!weather.manualOverrides.airTemp}
              value={weather.manualValues.airTemp}
              onChange={(e) => onUpdateManualValue('airTemp', Number(e.target.value))}
              className="w-full accent-sky-400 disabled:opacity-40"
            />
          </div>

          {/* Cloud Cover Slider */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">
                Cloud Cover: <strong className="text-amber-400 font-mono">{weather.manualValues.cloudCover.toFixed(0)}%</strong>
              </span>
              <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={weather.manualOverrides.cloudCover}
                  onChange={(e) => onUpdateManualOverride('cloudCover', e.target.checked)}
                  className="accent-sky-500"
                />
                Override
              </label>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              disabled={!weather.manualOverrides.cloudCover}
              value={weather.manualValues.cloudCover}
              onChange={(e) => onUpdateManualValue('cloudCover', Number(e.target.value))}
              className="w-full accent-amber-400 disabled:opacity-40"
            />
          </div>

          {/* Station Base Demand Slider */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">
                Station Base Load: <strong className="text-white font-mono">{weather.manualValues.stationLoad.toFixed(0)} kW</strong>
              </span>
              <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={weather.manualOverrides.stationLoad}
                  onChange={(e) => onUpdateManualOverride('stationLoad', e.target.checked)}
                  className="accent-sky-500"
                />
                Override
              </label>
            </div>
            <input
              type="range"
              min="40"
              max="260"
              step="5"
              disabled={!weather.manualOverrides.stationLoad}
              value={weather.manualValues.stationLoad}
              onChange={(e) => onUpdateManualValue('stationLoad', Number(e.target.value))}
              className="w-full accent-white disabled:opacity-40"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
