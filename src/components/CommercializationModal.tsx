import React, { useState } from 'react';
import {
  Briefcase,
  TrendingUp,
  ShieldCheck,
  Zap,
  Flame,
  BatteryCharging,
  DollarSign,
  AlertTriangle,
  Layers,
  X,
  Target,
  BarChart3,
  Cpu,
  RefreshCw,
  Globe,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface CommercializationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommercializationModal: React.FC<CommercializationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'commercial' | 'problems' | 'renewability'>('commercial');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none font-mono text-slate-100">
      <div className="w-full max-w-4xl max-h-[92vh] bg-[#0b1624] border border-sky-500/40 rounded-2xl shadow-2xl p-6 relative flex flex-col overflow-hidden">
        {/* Glow backdrop circles */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-emerald-400 text-slate-950 font-bold shadow-lg shadow-sky-500/20">
              <Briefcase className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight font-sans">
                  EDGE-AI POLAR EMS: COMMERCIALIZATION & TECH BLUEPRINT
                </h2>
                <span className="text-[10px] px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/40 rounded font-bold">
                  IP & ARCHITECTURE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Commercial Deployment Vectors, Solved Industry Dilemmas, and Thermodynamic 100% Renewability Model
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

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 mb-4 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('commercial')}
            className={`py-2 px-3.5 text-xs font-bold font-sans flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'commercial'
                ? 'border-sky-400 text-sky-300 bg-sky-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            1. Commercialization & GTM
          </button>

          <button
            onClick={() => setActiveTab('problems')}
            className={`py-2 px-3.5 text-xs font-bold font-sans flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'problems'
                ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            2. Real-World Problems Solved
          </button>

          <button
            onClick={() => setActiveTab('renewability')}
            className={`py-2 px-3.5 text-xs font-bold font-sans flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'renewability'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            3. How 100% Renewability Works
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto space-y-4 pr-1.5 flex-1">
          {/* TAB 1: Commercialization */}
          {activeTab === 'commercial' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wide">
                  Executive Commercial Thesis
                </span>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Off-grid and fringe-grid power generation globally relies on diesel generators running in harsh climates where fuel delivery costs $2.50 to $8.00 per liter due to ice-road transport, helicopters, or icebreakers. The Maitri 2 Edge AI EMS packages extreme polar-grade microgrid algorithms into a dual-mode commercial product: a drop-in hardware SCADA edge appliance + cloud-agnostic SaaS optimization engine.
                </p>
              </div>

              {/* 4 Commercial Markets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-sky-400 font-sans font-bold text-xs">
                    <Target className="w-4 h-4" />
                    Remote Mining & Extraction (Arctic / Outbacks)
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Northern Canada, Alaska, Western Australia, and the Chilean Andes operate 24/7 off-grid mines consuming millions of liters of diesel. Deploying this EMS replaces 65–85% of diesel with hybridized solar, wind, and battery storage.
                  </p>
                  <div className="text-[10px] text-emerald-400 font-mono font-bold">
                    Market Size: $14.2B Off-Grid Mining Power
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-sans font-bold text-xs">
                    <Globe className="w-4 h-4" />
                    Defense, Island Bases & Critical Radar Outposts
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Forward operating bases and early warning radar installations require 99.999% power security with zero reliance on vulnerable fuel supply convoys. The EMS provides autonomous black-start and cyber-resilient satellite links.
                  </p>
                  <div className="text-[10px] text-emerald-400 font-mono font-bold">
                    Market Size: $8.7B Defense Microgrids
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-sans font-bold text-xs">
                    <Cpu className="w-4 h-4" />
                    Off-Grid Telecom Towers & Frontier Compute
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Over 1.2 million telecom towers worldwide run off-grid on unreliable diesel generators. The EMS features edge inference and vibration FFT predictive maintenance, lowering site visit costs by 70%.
                  </p>
                  <div className="text-[10px] text-emerald-400 font-mono font-bold">
                    Market Size: $6.1B Telecom Energy Infrastructure
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-sans font-bold text-xs">
                    <DollarSign className="w-4 h-4" />
                    P2P Energy Trading & Carbon Credit Consortiums
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Commercial microgrid parks (eco-resorts, islands, industrial clusters) use the built-in SHA-256 Proof-of-Green-Power (PoGP) blockchain ledger to trade surplus kilowatt-hours and mint audited Renewable Energy Certificates (RECs).
                  </p>
                  <div className="text-[10px] text-emerald-400 font-mono font-bold">
                    Revenue Model: 1.5% Clearing Transaction Fee
                  </div>
                </div>
              </div>

              {/* Business Model Breakdown */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-300 font-sans">
                  Revenue Streams & Financial Payback
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-sans">1. Edge Controller Hardware</div>
                    <div className="text-white font-bold my-1 font-sans">Industrial Rugged RTU</div>
                    <p className="text-[10px] text-slate-400 font-sans">
                      $25k–$75k per site one-time capex with sub-cycle solid-state transfer control.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-sans">2. SaaS Optimization Fee</div>
                    <div className="text-white font-bold my-1 font-sans">Neural Merit Dispatch</div>
                    <p className="text-[10px] text-slate-400 font-sans">
                      $1,200–$4,500/month recurring subscription tiered by megawatt-hour managed.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-sans">3. Performance Sharing</div>
                    <div className="text-white font-bold my-1 font-sans">Gainshare on Fuel Saved</div>
                    <p className="text-[10px] text-slate-400 font-sans">
                      Capture 15–20% of net diesel fuel savings verified via tamper-proof telemetry.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Problems Solved */}
          {activeTab === 'problems' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs font-sans text-amber-200">
                Conventional microgrid controllers fail in remote, extreme environments due to static rule hysteresis, lack of synthetic inertia, and zero seasonal storage capability. Here is how the Maitri 2 EMS solves each fundamental bottleneck:
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    problem: 'The "Polar Fuel Penalty" & Astronomical Fuel Delivery Costs',
                    desc: 'Delivering Arctic diesel to isolated sites costs $2.85 to $7.00/liter due to airlifts, icebreakers, and tracked tractors.',
                    solution: 'EMS Solution: Multi-objective neural dispatch dynamically prioritizes $0/kWh marginal solar and wind, curtailing 0% and displacing 98%+ of diesel fuel.',
                    icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
                  },
                  {
                    problem: 'Generator Wet-Stacking and Carbon Build-up Under Light Loads',
                    desc: 'Running diesel generators under 40% rated capacity causes incomplete fuel combustion, unburned oil in exhaust, and catastrophic cylinder failure.',
                    solution: 'EMS Solution: AI enforces strict Minimum Loading constraints; when renewable deficit is small, the fuel cell or BESS bridges the gap rather than turning on diesel at low load.',
                    icon: <Flame className="w-4 h-4 text-orange-400" />,
                  },
                  {
                    problem: 'Grid Frequency Collapse & Blackouts During Extreme Katabatic Gusts',
                    desc: 'Gusts jumping from 5 to 30 m/s in seconds cause conventional synchronous generators to trip offline due to phase misalignment.',
                    solution: 'EMS Solution: Solid-State Bus provides synthetic inertia through BESS inverters with <4ms response, maintaining 50Hz / 400V grid voltage without diesel spinning reserve.',
                    icon: <Zap className="w-4 h-4 text-amber-400" />,
                  },
                  {
                    problem: 'The "Seasonal Dark Cliff" (4 Months Polar Night)',
                    desc: 'Batteries only store energy for 4 to 12 hours. When polar night sets in and solar irradiance is 0 W/m² for months, conventional solar microgrids completely collapse back to 100% diesel.',
                    solution: 'EMS Solution: Seasonal Hydrogen Hub. Converts summer excess solar into 400 kg compressed H₂ at 700 bar (~6.7 MWh electric equivalent), discharging via 80 kW fuel cell with 82% heat recovery.',
                    icon: <RefreshCw className="w-4 h-4 text-cyan-400" />,
                  },
                  {
                    problem: 'Unplanned Mechanical Downtime in Sub-Zero Weather',
                    desc: 'Equipment repairs during blizzards (-40°C) are life-threatening and risk station evacuation.',
                    solution: 'EMS Solution: AI Predictive Health monitoring runs vibration FFT harmonics, bearing temperature z-scores, and automatically derates failing units before catastrophic trips occur.',
                    icon: <ShieldCheck className="w-4 h-4 text-purple-400" />,
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-white font-sans">
                      {item.icon}
                      <span>{item.problem}</span>
                    </div>
                    <p className="text-[11px] text-red-300/80 font-sans leading-relaxed">
                      <strong>Pain Point:</strong> {item.desc}
                    </p>
                    <p className="text-[11px] text-emerald-300 font-sans leading-relaxed">
                      <strong>Resolution:</strong> {item.solution}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: How 100% Renewability is Achieved */}
          {activeTab === 'renewability' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                  Thermodynamic & Multi-Timescale Architecture
                </span>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  "100% Renewable" in a microgrid does not mean having solar panels that only work at noon. It requires bridging milliseconds to seasons without synchronous fossil generators. The Maitri 2 EMS accomplishes this through a 4-tier temporal energy coupling hierarchy:
                </p>
              </div>

              {/* 4 Temporal Tiers */}
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center font-bold shrink-0 text-xs">
                    &lt;100ms
                  </div>
                  <div className="space-y-1 font-sans">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Tier 1: Sub-Cycle Synthetic Inertia & Solid-State Transfer</span>
                      <span className="text-[10px] text-sky-400 font-mono">Power Quality</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Grid-forming silicon carbide (SiC) inverters emulate mechanical turbine momentum. When sudden cloud cover or turbine cut-outs occur, the solid-state bus transfers power in under 4ms, keeping station frequency locked at 50Hz without diesel spinning reserve.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold shrink-0 text-xs">
                    Hours
                  </div>
                  <div className="space-y-1 font-sans">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Tier 2: Intraday Buffer via BESS (600 kWh LFP)</span>
                      <span className="text-[10px] text-purple-400 font-mono">Diurnal Balance</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Thermally conditioned Lithium Iron Phosphate cells maintained at +18°C absorb midday solar spikes and wind lulls. Neural lookahead adjusts the dynamic State of Charge (SoC) reserve floor based on next-3-hour weather forecasts.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold shrink-0 text-xs">
                    Months
                  </div>
                  <div className="space-y-1 font-sans">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Tier 3: Seasonal Green Hydrogen (Lake Priyadarshini Loop)</span>
                      <span className="text-[10px] text-cyan-400 font-mono">Seasonal Autonomy</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      During 24/7 summer polar day, solar PV (150 kWp) and polar wind generate massive surpluses beyond battery capacity. The 100 kW PEM electrolyzer converts excess electricity into pure hydrogen (55 kWh/kg) stored at 700 bar (400 kg = ~6.7 MWh). During the 4-month winter polar night, an 80 kW PEM fuel cell discharges clean electricity + hot water for life support.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold shrink-0 text-xs">
                    AI Look
                  </div>
                  <div className="space-y-1 font-sans">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Tier 4: Neural Merit-Order Multi-Objective Dispatch</span>
                      <span className="text-[10px] text-emerald-400 font-mono">Continuous Co-Optimization</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      The Edge AI solves a constrained optimization problem every simulation tick: Minimizing Levelized Cost of Energy (LCOE) while penalizing generator cold-starts and carbon emissions. Diesel is mathematically ranked last ($0.85/kWh) and never dispatched when battery or H₂ state allows green bridging.
                    </p>
                  </div>
                </div>
              </div>

              {/* Formula & Energy Balance Summary */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">ENERGY BALANCE EQUATION</span>
                  <span className="text-sky-300 font-bold">P_gen(t) - P_load(t) = P_bat(t) + P_ely(t) - P_fc(t) + P_curtail(t)</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-emerald-400 font-bold block text-sm">0.0 Liters Diesel</span>
                  <span className="text-slate-400 text-[10px]">Under Normal 24/7 Ops</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Maitri 2 Polar Microgrid SCADA v4.2 · Commercial Licensing Architecture</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-sans text-xs transition-colors"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
