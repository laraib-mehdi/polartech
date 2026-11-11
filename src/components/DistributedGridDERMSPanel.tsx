import React from 'react';
import { BatteryCharging, Flame, Thermometer, ShieldCheck, Zap, Gauge, Radio } from 'lucide-react';
import { DistributedStorageState } from '../types/microgrid';

interface DistributedGridDERMSPanelProps {
  storage: DistributedStorageState;
  isHydrogenEnabled: boolean;
  electrolyzerKw: number;
  fuelCellKw: number;
  batteryPowerKw: number;
  ambientTempC: number;
}

export const DistributedGridDERMSPanel: React.FC<DistributedGridDERMSPanelProps> = ({
  storage,
  isHydrogenEnabled,
  electrolyzerKw,
  fuelCellKw,
  batteryPowerKw,
  ambientTempC,
}) => {
  const socPercent = storage.batterySoc * 100;
  const h2Percent = (storage.hydrogenStoredKg / 400) * 100;
  const h2EnergyMwh = (storage.hydrogenStoredKg * 16.7) / 1000;

  return (
    <div className="bg-[#0b1624]/95 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col gap-4 text-xs font-mono">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BatteryCharging className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm">Distributed Grid Management (DERMS)</h2>
            <p className="text-[11px] text-slate-400 font-sans">
              BESS dynamic conditioning & seasonal green H₂ storage
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
          DERMS ACTIVE
        </span>
      </div>

      {/* 1. BESS 600 kWh Lithium Iron Phosphate Section */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span className="font-sans font-bold text-white text-xs">BESS Container (600 kWh LFP)</span>
          </div>
          <span className="text-purple-300 font-bold">{socPercent.toFixed(1)}% SOC</span>
        </div>

        {/* Battery SOC Visual Bar */}
        <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              socPercent < 20
                ? 'bg-red-500'
                : socPercent < 45
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-emerald-500 to-purple-500'
            }`}
            style={{ width: `${Math.max(2, Math.min(100, socPercent))}%` }}
          />
        </div>

        {/* Battery Internal Telemetry Grid */}
        <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 pt-1">
          <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-500 block uppercase">Net Flow</span>
            <span
              className={`font-bold text-xs ${
                batteryPowerKw > 0.5
                  ? 'text-emerald-400'
                  : batteryPowerKw < -0.5
                  ? 'text-purple-400'
                  : 'text-slate-300'
              }`}
            >
              {batteryPowerKw > 0.5
                ? `Disch ${batteryPowerKw.toFixed(0)} kW`
                : batteryPowerKw < -0.5
                ? `Chg ${Math.abs(batteryPowerKw).toFixed(0)} kW`
                : 'Standby 0 kW'}
            </span>
          </div>

          <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-500 block uppercase">Core Temp</span>
            <span className="text-white font-bold text-xs flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-sky-400" />
              {storage.batteryTempC.toFixed(1)}°C
            </span>
            <span className="text-[9px] text-emerald-400">Insulated (+18°C preheat)</span>
          </div>

          <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-500 block uppercase">Cell SOH</span>
            <span className="text-emerald-400 font-bold text-xs">{storage.batteryStateOfHealth.toFixed(1)}%</span>
            <span className="text-[9px] text-slate-500">Nominal 600 kWh</span>
          </div>
        </div>
      </div>

      {/* 2. Green Hydrogen Seasonal Storage & Fuel Cell Section */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="font-sans font-bold text-white text-xs">Green Hydrogen Plant (700 bar)</span>
          </div>
          <span className="text-cyan-300 font-bold">
            {storage.hydrogenStoredKg.toFixed(0)} / 400 kg ({h2Percent.toFixed(0)}%)
          </span>
        </div>

        {/* H2 Tank Level Bar */}
        <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${Math.max(2, Math.min(100, h2Percent))}%` }}
          />
        </div>

        {/* Hydrogen Energy Equivalent & Autonomy */}
        <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 pt-1">
          <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-500 block uppercase">Stored Energy</span>
            <span className="text-cyan-300 font-bold text-xs">{h2EnergyMwh.toFixed(1)} MWh</span>
            <span className="text-[9px] text-slate-400">Chemical reserve</span>
          </div>

          <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-500 block uppercase">Polar Autonomy</span>
            <span className="text-emerald-400 font-bold text-xs">{storage.hydrogenAutonomyDays.toFixed(1)} Days</span>
            <span className="text-[9px] text-slate-400">Zero-sun survival</span>
          </div>

          <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-500 block uppercase">Tank Pressure</span>
            <span className="text-white font-bold text-xs">{storage.hydrogenPressureBar.toFixed(0)} bar</span>
            <span className="text-[9px] text-slate-400">Rating: 700 bar</span>
          </div>
        </div>

        {/* Electrolyzer vs Fuel Cell Live Flows */}
        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-sans">Electrolyzer (Surplus Absorption):</span>
            <strong className="text-cyan-400">{electrolyzerKw.toFixed(0)} kW</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-sans">Fuel Cell (Deficit Bridge):</span>
            <strong className="text-emerald-400">{fuelCellKw.toFixed(0)} kW</strong>
          </div>
        </div>
      </div>

      {/* 3. Combined Heat and Power (CHP) Waste Heat Thermal Cogeneration */}
      <div className="p-2.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-amber-900/40 text-[11px] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="text-amber-200 font-bold font-sans block">Waste Heat Recovery (CHP)</span>
            <span className="text-slate-400 text-[10px] font-sans">
              Hydronic loop heating station laboratories from FC & electrolyzer
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-amber-400 font-bold text-sm block">{storage.thermalHeatRecoveredKw.toFixed(1)} kWth</span>
          <span className="text-[9px] text-slate-400">Replaces electric space heating</span>
        </div>
      </div>
    </div>
  );
};
