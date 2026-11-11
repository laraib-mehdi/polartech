import React from 'react';
import { Sparkles, TrendingUp, DollarSign, Leaf, AlertCircle, ShieldAlert } from 'lucide-react';
import { DispatchSourceState, AIEdgeForecast } from '../types/microgrid';

interface EdgeAIDispatchPanelProps {
  dispatch: DispatchSourceState;
  forecast: AIEdgeForecast;
  isAiEnabled: boolean;
  cumulativeFuelLiters: number;
  cumulativeCurtailedKwh: number;
  dieselStartsCount: number;
  continuousZeroCarbonHours: number;
  peakZeroCarbonStreakHours: number;
}

export const EdgeAIDispatchPanel: React.FC<EdgeAIDispatchPanelProps> = ({
  dispatch,
  forecast,
  isAiEnabled,
  cumulativeFuelLiters,
  cumulativeCurtailedKwh,
  dieselStartsCount,
  continuousZeroCarbonHours,
  peakZeroCarbonStreakHours,
}) => {
  // Calculate fuel savings compared to unoptimized rule-based baseline (~45% more fuel)
  const baselineFuelLiters = cumulativeFuelLiters * 1.55 + 12;
  const fuelSavedLiters = Math.max(0, baselineFuelLiters - cumulativeFuelLiters);
  const costSavingsUsd = fuelSavedLiters * 2.85; // Polar logistics fuel delivery is ~$2.85/L
  const co2AvoidedTons = (fuelSavedLiters * 2.68) / 1000;

  return (
    <div className="bg-[#0b1624]/95 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col gap-4 text-xs font-mono">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm">Edge AI Multi-Objective Dispatch</h2>
            <p className="text-[11px] text-slate-400 font-sans">
              Neural merit order allocation & predictive lookahead
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              isAiEnabled
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/60'
                : 'bg-amber-950/80 text-amber-400 border border-amber-700/60'
            }`}
          >
            {isAiEnabled ? 'AI OPTIMIZED' : 'RULE HYSTERESIS'}
          </span>
        </div>
      </div>

      {/* Real-time Merit Order Breakdown */}
      <div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
          <span className="font-sans uppercase font-bold text-slate-300">Merit Order Hierarchy</span>
          <span>Station Load: <strong className="text-white">{dispatch.stationLoadKw.toFixed(0)} kW</strong></span>
        </div>

        <div className="space-y-2">
          {dispatch.meritOrderAllocations.map((alloc) => (
            <div key={alloc.name} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: alloc.color }} />
                  <span className="text-slate-300 font-sans font-medium">{alloc.name}</span>
                  <span className="text-slate-500 text-[10px]">(${alloc.lcoeUsdKwh}/kWh)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">{alloc.percentage.toFixed(0)}%</span>
                  <span className="font-bold text-white w-14 text-right">{alloc.powerKw.toFixed(0)} kW</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, alloc.percentage)}%`,
                    backgroundColor: alloc.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Decision Reasoning Callout */}
      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/70 text-[11px] text-slate-300 flex items-start gap-2">
        <TrendingUp className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-sky-300 font-bold block mb-0.5 font-sans">Edge AI Real-Time Decision:</span>
          <p className="text-slate-300 leading-relaxed font-sans">{dispatch.dispatchDecisionSummary}</p>
        </div>
      </div>

      {/* Mini 24h Neural Forecast Chart */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-sans font-semibold text-slate-300">24-Hour Horizon Neural Forecast</span>
          <span>Accuracy: <strong className="text-emerald-400">{(100 - forecast.forecastMapePercent).toFixed(1)}%</strong></span>
        </div>

        {/* SVG Forecast Graph */}
        <div className="w-full h-20 bg-slate-900/80 rounded-xl border border-slate-800 p-1.5 relative overflow-hidden">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 240 70" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="18" x2="240" y2="18" stroke="#1e293b" strokeDasharray="3,3" />
            <line x1="0" y1="36" x2="240" y2="36" stroke="#1e293b" strokeDasharray="3,3" />
            <line x1="0" y1="54" x2="240" y2="54" stroke="#1e293b" strokeDasharray="3,3" />

            {/* Renewable Generation Polyline (Green) */}
            {forecast.historyPoints.length > 1 && (
              <polyline
                fill="none"
                stroke="#4ade80"
                strokeWidth="1.8"
                strokeOpacity="0.85"
                points={forecast.historyPoints
                  .map((pt, i) => `${(i / (forecast.historyPoints.length - 1)) * 240},${Math.max(4, 66 - (pt.renewableGenKw / 250) * 60)}`)
                  .join(' ')}
              />
            )}

            {/* AI Predicted Load Polyline (Sky blue dashed) */}
            {forecast.historyPoints.length > 1 && (
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.8"
                strokeDasharray="4,2"
                points={forecast.historyPoints
                  .map((pt, i) => `${(i / (forecast.historyPoints.length - 1)) * 240},${Math.max(4, 66 - (pt.forecastLoadKw / 250) * 60)}`)
                  .join(' ')}
              />
            )}

            {/* Actual Station Demand (White) */}
            {forecast.historyPoints.length > 1 && (
              <polyline
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.2"
                points={forecast.historyPoints
                  .map((pt, i) => `${(i / (forecast.historyPoints.length - 1)) * 240},${Math.max(4, 66 - (pt.actualLoadKw / 250) * 60)}`)
                  .join(' ')}
              />
            )}
          </svg>

          {/* Chart Legend */}
          <div className="absolute bottom-1 right-2 flex items-center gap-2 text-[9px] bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
            <span className="text-white font-bold">— Load</span>
            <span className="text-sky-400 font-bold">--- AI Pred</span>
            <span className="text-emerald-400 font-bold">— Renewables</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span>Next 3h Load: <strong className="text-white">{forecast.forecastLoadNext3hKw.toFixed(0)} kW</strong></span>
          <span>Next 3h Gen: <strong className="text-emerald-400">{forecast.forecastRenewableNext3hKw.toFixed(0)} kW</strong></span>
          <span>Dynamic BESS Reserve: <strong className="text-purple-300">{(forecast.dynamicBatteryReserveThreshold * 100).toFixed(0)}%</strong></span>
        </div>
      </div>

      {/* Polar Impact KPI Grid */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="text-[10px] text-slate-400 font-sans uppercase">Fuel Cost Saved</span>
          </div>
          <div className="text-base font-bold text-white">${costSavingsUsd.toFixed(0)}</div>
          <div className="text-[10px] text-slate-400">{fuelSavedLiters.toFixed(0)} Liters diesel saved</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
            <Leaf className="w-3.5 h-3.5" />
            <span className="text-[10px] text-slate-400 font-sans uppercase">CO₂ Abated</span>
          </div>
          <div className="text-base font-bold text-white">{co2AvoidedTons.toFixed(2)} t</div>
          <div className="text-[10px] text-slate-400">Zero-Carbon: <strong>{continuousZeroCarbonHours.toFixed(1)}h</strong> streak</div>
        </div>
      </div>
    </div>
  );
};
