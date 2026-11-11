import React from 'react';
import { Activity, Wrench, AlertTriangle, ShieldCheck, CheckCircle2, RotateCcw } from 'lucide-react';
import { GridComponentHealth, WorkOrder } from '../types/microgrid';

interface PredictiveMaintenancePanelProps {
  components: GridComponentHealth[];
  workOrders: WorkOrder[];
  isAiEnabled: boolean;
  onInjectFault: (componentId: string) => void;
  onDispatchRepairCrew: () => void;
  onSelectComponent: (componentId: string) => void;
  selectedComponentId: string;
}

export const PredictiveMaintenancePanel: React.FC<PredictiveMaintenancePanelProps> = ({
  components,
  workOrders,
  isAiEnabled,
  onInjectFault,
  onDispatchRepairCrew,
  onSelectComponent,
  selectedComponentId,
}) => {
  const faultedCount = components.filter((c) => c.isFaultInjected || c.isDerated || c.isTripped).length;

  return (
    <div className="bg-[#0b1624]/95 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col gap-4 text-xs font-mono">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm">AI Predictive Maintenance & Health</h2>
            <p className="text-[11px] text-slate-400 font-sans">
              Vibration FFT anomaly detection & automated derating
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {faultedCount > 0 ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800 animate-pulse">
              {faultedCount} ANOMALIES DETECTED
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              ALL SYSTEMS HEALTHY
            </span>
          )}
        </div>
      </div>

      {/* Component Health Matrix */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {components.map((comp) => {
          const isSelected = selectedComponentId === comp.id;
          const statusColor = comp.isTripped
            ? 'text-red-400 border-red-800/60 bg-red-950/30'
            : comp.isDerated
            ? 'text-amber-400 border-amber-800/60 bg-amber-950/30'
            : comp.healthScore < 70
            ? 'text-yellow-400 border-yellow-800/60 bg-yellow-950/20'
            : 'text-emerald-400 border-slate-800 bg-slate-900/60';

          return (
            <div
              key={comp.id}
              onClick={() => onSelectComponent(comp.id)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isSelected ? 'ring-2 ring-sky-500 shadow-md shadow-sky-500/20' : ''
              } ${statusColor} hover:border-slate-700`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      comp.isTripped
                        ? 'bg-red-500 animate-ping'
                        : comp.isDerated
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <span className="font-sans font-bold text-white text-xs">{comp.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-sans">
                    RUL: <strong className="text-white">{comp.rulHours > 9000 ? '>5000h' : `${comp.rulHours}h`}</strong>
                  </span>
                  <span className="font-bold">{comp.healthScore.toFixed(0)}%</span>
                </div>
              </div>

              {/* Health Score Mini Bar */}
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden mb-1.5">
                <div
                  className={`h-full rounded-full ${
                    comp.healthScore < 40 ? 'bg-red-500' : comp.healthScore < 75 ? 'bg-amber-400' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.max(3, comp.healthScore)}%` }}
                />
              </div>

              {/* Anomaly Z-Score & Protection State */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans">
                <span>
                  Vibration Z-Score: <strong className={comp.anomalyZScore > 3 ? 'text-red-400' : 'text-slate-200'}>
                    {comp.anomalyZScore.toFixed(2)}σ
                  </strong>
                </span>

                <div className="flex items-center gap-1.5">
                  {comp.isTripped && (
                    <span className="text-red-400 font-bold bg-red-950/80 px-1.5 py-0.2 rounded border border-red-800">
                      TRIPPED
                    </span>
                  )}
                  {comp.isDerated && !comp.isTripped && (
                    <span className="text-amber-400 font-bold bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-800">
                      AI DERATED (-{Math.round((1 - comp.efficiencyMultiplier) * 100)}%)
                    </span>
                  )}
                  {!comp.isDerated && !comp.isTripped && (
                    <span className="text-emerald-400 font-medium">OPTIMAL</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fault Injection & Testing Actions */}
      <div className="pt-2 border-t border-slate-800 space-y-2">
        <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
          Simulate Polar Stress / Fault Injection:
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onInjectFault('wt1')}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-300 text-[11px] font-sans transition-colors text-center"
          >
            Fault WT-2 Bearing
          </button>
          <button
            onClick={() => onInjectFault('dg0')}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 text-[11px] font-sans transition-colors text-center"
          >
            Fault DG-1 Injector
          </button>
          <button
            onClick={() => onInjectFault('bat')}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-purple-300 text-[11px] font-sans transition-colors text-center"
          >
            Fault BESS Cells
          </button>
        </div>

        <button
          onClick={onDispatchRepairCrew}
          className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all text-xs font-sans"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Dispatch Station Repair Crew (Reset All)</span>
        </button>
      </div>

      {/* Autonomous Work Orders Feed */}
      {workOrders.length > 0 && (
        <div className="pt-2 border-t border-slate-800 space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
            AI Automated Work Orders:
          </span>
          <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
            {workOrders.slice(0, 3).map((wo) => (
              <div
                key={wo.id}
                className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] flex items-start gap-2"
              >
                <Wrench className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-sans truncate">{wo.subsystemName}</span>
                    <span className="text-amber-400 font-bold">{wo.status}</span>
                  </div>
                  <p className="text-slate-400 truncate">{wo.diagnosticAnomaly}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
