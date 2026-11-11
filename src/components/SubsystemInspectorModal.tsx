import React from 'react';
import { X, Wrench, AlertTriangle, ShieldCheck, Zap, Thermometer, Activity } from 'lucide-react';
import { GridComponentHealth } from '../types/microgrid';

interface SubsystemInspectorModalProps {
  componentId: string | null;
  onClose: () => void;
  component: GridComponentHealth | undefined;
  livePowerKw?: number;
  onInjectFault: (id: string) => void;
  onRepairComponent: (id: string) => void;
}

const SUBSYSTEM_SPECS: { [key: string]: { title: string; desc: string; polarDesign: string } } = {
  load: {
    title: 'Maitri 2 Polar Research Complex & Life Support',
    desc: 'Deep ice core drilling labs, geomagnetic observatory, atmospheric LIDAR, living quarters for 35 overwintering scientists, and life support systems.',
    polarDesign: 'Aerodynamic elevated hull with multi-zone temperature regulation, hydronic waste-heat recovery loop, and sub-4ms UPS continuity.',
  },
  bus: {
    title: 'Smart Switchgear & Solid-State Bus',
    desc: 'Central microgrid 400V AC interconnection bus with ultra-fast solid-state transfer switches and Edge AI synchronization.',
    polarDesign: 'Redundant gas-insulated switchgear (GIS) with cold-climate SF6 blend and sub-cycle microsecond fault isolation.',
  },
  bat: {
    title: 'BESS 600 kWh Lithium Iron Phosphate (LFP)',
    desc: 'Distributed grid battery storage system providing synthetic inertia, primary frequency response, and solar/wind surplus buffer.',
    polarDesign: 'Aerogel-insulated ISO shipping containers with active HVAC hydronic preheating keeping cells at +18°C even at -45°C ambient.',
  },
  dg: {
    title: 'Emergency Diesel Gensets (2× 100 kW)',
    desc: 'Cold-weather backup diesel generation units running low-sulfur polar arctic diesel fuel with exhaust heat recovery.',
    polarDesign: 'Engine block electric preheaters, fuel line tracing, and automatic loading modulation to prevent wet-stacking.',
  },
  pv: {
    title: 'Bifacial Solar PV Array (150 kWp)',
    desc: 'N-type TOPCon bifacial modules arranged in 32 strings angled at 52° for maximum snow shedding and albedo reflection from blue ice.',
    polarDesign: 'Hydrophobic anti-snow nano-coating, high-strength galvanized steel ground mounts rated for 55 m/s katabatic gusts.',
  },
  wt0: {
    title: 'Polar Wind Turbine 1 (60 kW Direct-Drive)',
    desc: 'Direct-drive permanent magnet synchronous generator with full power converter and variable pitch control.',
    polarDesign: 'Carbon-fiber electro-thermal blade de-icing, low-temperature synthetic grease rated down to -50°C, storm feathering.',
  },
  wt1: {
    title: 'Polar Wind Turbine 2 (60 kW Direct-Drive)',
    desc: 'Direct-drive permanent magnet synchronous generator with full power converter and variable pitch control.',
    polarDesign: 'Carbon-fiber electro-thermal blade de-icing, low-temperature synthetic grease rated down to -50°C, storm feathering.',
  },
  wt2: {
    title: 'Polar Wind Turbine 3 (60 kW Direct-Drive)',
    desc: 'Direct-drive permanent magnet synchronous generator with full power converter and variable pitch control.',
    polarDesign: 'Carbon-fiber electro-thermal blade de-icing, low-temperature synthetic grease rated down to -50°C, storm feathering.',
  },
  ely: {
    title: 'PEM Electrolyzer (Lake Priyadarshini Pure Meltwater Loop)',
    desc: 'Proton Exchange Membrane electrolyzer converting summer renewable surplus into pure green hydrogen (~55 kWh/kg).',
    polarDesign: 'Ultra-pure closed loop meltwater filtration, freeze-protection recirculation, and waste heat recovery into station radiators.',
  },
  h2: {
    title: 'Hydrogen Seasonal Storage (400 kg @ 700 bar)',
    desc: 'Type-IV carbon composite high-pressure cylinders holding 400 kg H₂ (~6.7 MWh electric equivalent) for seasonal dark period.',
    polarDesign: 'Explosion-proof safety enclosures with thermal pressure relief devices (TPRD) and ultrasonic leak detection.',
  },
  fc: {
    title: 'PEM Fuel Cell (80 kW Combined Heat & Power)',
    desc: 'Converts stored green hydrogen into clean zero-emission electricity (~16.7 kWh/kg) during polar night or deficit.',
    polarDesign: 'Integrated CHP heat exchanger routing 82% waste heat directly to station living quarters, avoiding electrical heating.',
  },
  sat: {
    title: 'ISRO Polar Ground Terminal & Parabolic Radome',
    desc: 'Multi-constellation ISRO GSAT/CMS Polar Orbit relay, Starlink Polar & Iridium NEXT tracking station for real-time telemetry to NCPOR Goa.',
    polarDesign: 'Heated radome dome preventing rime ice build-up with azimuth-elevation servo tracking and Ku/Ka band feeds.',
  },
};

export const SubsystemInspectorModal: React.FC<SubsystemInspectorModalProps> = ({
  componentId,
  onClose,
  component,
  livePowerKw,
  onInjectFault,
  onRepairComponent,
}) => {
  if (!componentId || componentId === 'overview') return null;

  const spec = SUBSYSTEM_SPECS[componentId] || {
    title: component?.name || 'Subsystem Asset',
    desc: 'Polar station microgrid critical infrastructure component.',
    polarDesign: 'Hardened for extreme Antarctic weather and maritime salt spray.',
  };

  return (
    <div className="fixed bottom-4 right-4 lg:right-[515px] z-40 w-80 sm:w-96 bg-[#0b1624]/95 border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-slate-100 font-mono backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-200 select-none">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white text-xs font-sans truncate">{spec.title}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[11px] text-slate-400 font-sans mb-3 leading-relaxed">{spec.desc}</p>

      {/* Live Telemetry Card */}
      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-sans">Current Power Flow:</span>
          <strong className="text-white text-sm font-bold">
            {livePowerKw !== undefined ? `${livePowerKw.toFixed(1)} kW` : 'ACTIVE'}
          </strong>
        </div>

        {component && (
          <>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-sans">Health Index:</span>
              <span
                className={`font-bold ${
                  component.healthScore > 80
                    ? 'text-emerald-400'
                    : component.healthScore > 50
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {component.healthScore.toFixed(0)}%
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-sans">Vibration Z-Score:</span>
              <span className={`font-bold ${component.anomalyZScore > 3 ? 'text-red-400' : 'text-slate-300'}`}>
                {component.anomalyZScore.toFixed(2)}σ
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-sans">Remaining Useful Life:</span>
              <span className="text-sky-300 font-bold">
                {component.rulHours > 9000 ? '>5000h' : `${component.rulHours}h`}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Polar Engineering Specs Callout */}
      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 mb-3 text-[10px] text-slate-400 font-sans">
        <span className="text-sky-400 font-bold block mb-1">Polar Hardening & Design:</span>
        <p className="leading-relaxed">{spec.polarDesign}</p>
      </div>

      {/* Actions */}
      {component && (
        <div className="flex gap-2 text-xs font-sans">
          <button
            onClick={() => onInjectFault(component.id)}
            className="flex-1 py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl transition-all"
          >
            Inject Anomaly
          </button>
          <button
            onClick={() => onRepairComponent(component.id)}
            className="flex-1 py-1.5 px-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold transition-all"
          >
            Service / Repair
          </button>
        </div>
      )}
    </div>
  );
};
