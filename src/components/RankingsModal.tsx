import React from 'react';
import {
  Trophy,
  Award,
  CheckCircle,
  ShieldCheck,
  Zap,
  Flame,
  Satellite,
  Compass,
  X,
  Star,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

interface RankingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRenewableShare: number;
}

export const RankingsModal: React.FC<RankingsModalProps> = ({
  isOpen,
  onClose,
  currentRenewableShare,
}) => {
  if (!isOpen) return null;

  const STATIONS_LEADERBOARD = [
    {
      rank: 1,
      name: 'Maitri 2 Polar Station',
      country: 'India (NCPOR / MoES)',
      region: 'Schirmacher Oasis, Queen Maud Land',
      score: 99.8,
      renewableIndex: '100% Capable',
      h2Autonomy: '400 kg Seasonal H₂',
      status: '#1 WORLD POLAR LEADER',
      highlight: true,
      features: 'Aerodynamic elevated hull · PEM H₂ closed loop · Edge AI SCADA · ISRO Polar Laser Relay',
    },
    {
      rank: 2,
      name: 'Princess Elisabeth Station',
      country: 'Belgium (IPF)',
      region: 'Utsteinen Nunatak, Queen Maud Land',
      score: 94.2,
      renewableIndex: '100% (Summer only)',
      h2Autonomy: 'No H₂ Seasonal',
      status: 'Zero-Emission Summer',
      highlight: false,
      features: 'Passive aerodynamic wooden hull, automated solar/wind, unstaffed during polar night',
    },
    {
      rank: 3,
      name: 'Concordia Research Station',
      country: 'France / Italy (IPEV / PNRA)',
      region: 'Dome C, Antarctic Plateau (3,233m)',
      score: 89.5,
      renewableIndex: '32% Hybrid',
      h2Autonomy: 'Experimental PEM',
      status: 'Plateau Extreme Cold',
      highlight: false,
      features: 'Twin elevated cylindrical towers, extreme altitude astrophysics, hybrid diesel',
    },
    {
      rank: 4,
      name: 'Troll Research Station',
      country: 'Norway (NPI)',
      region: 'Jutulsessen, Queen Maud Land',
      score: 88.0,
      renewableIndex: '48% Solar Pilot',
      h2Autonomy: 'None',
      status: 'Year-Round Scientific',
      highlight: false,
      features: 'Extensive satellite ground station, rocky nunatak anchor, solar array expansion',
    },
    {
      rank: 5,
      name: 'Amundsen-Scott Station',
      country: 'USA (National Science Foundation)',
      region: 'Geographic South Pole (2,835m)',
      score: 87.1,
      renewableIndex: '18% Microgrid Pilot',
      h2Autonomy: 'None',
      status: 'South Pole Hub',
      highlight: false,
      features: 'Iconic elevated station on stilts, South Pole Telescope, heavy LC-130 fuel airlift reliant',
    },
    {
      rank: 6,
      name: 'Halley VI Research Station',
      country: 'United Kingdom (BAS)',
      region: 'Brunt Ice Shelf',
      score: 86.0,
      renewableIndex: '28% Renewable',
      h2Autonomy: 'None',
      status: 'Hydraulic Ski Pods',
      highlight: false,
      features: 'Modular ski-mounted relocatable pods, ozone hole monitoring, seasonal winter uncrewed',
    },
    {
      rank: 7,
      name: 'McMurdo Station',
      country: 'USA (National Science Foundation)',
      region: 'Ross Island',
      score: 81.4,
      renewableIndex: '24% Wind Grid',
      h2Autonomy: 'None',
      status: 'Largest Antarctic Base',
      highlight: false,
      features: 'Hub for 1,200+ personnel, multi-building industrial complex undergoing AIMS modernization',
    },
  ];

  const PILLARS_OF_EXCELLENCE = [
    {
      title: '100% Renewable Synergy',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      desc: '150 kWp bifacial N-type TOPCon solar array harvesting albedo from blue ice, coupled with 3x 60 kW direct-drive polar wind turbines and 600 kWh BESS with neural dispatch.',
      metric: `${currentRenewableShare.toFixed(1)}% Real-Time Clean`,
    },
    {
      title: 'Seasonal Green Hydrogen Hub',
      icon: <Flame className="w-5 h-5 text-cyan-400" />,
      desc: '100 kW PEM electrolyzer fed by Lake Priyadarshini ultra-pure meltwater. Stores 400 kg of H₂ at 700 bar (~6.7 MWh clean reserve) feeding an 80 kW CHP fuel cell with 82% heat recovery.',
      metric: '400 kg @ 700 bar',
    },
    {
      title: 'Aerodynamic Zero-Drift Hull',
      icon: <Layers className="w-5 h-5 text-orange-400" />,
      desc: 'State-of-the-art dual-deck aerofoil architecture elevated on hydraulic steel stilts. Channels katabatic winds underneath to prevent snow-drift burial up to 240 km/h.',
      metric: '240 km/h Wind Rated',
    },
    {
      title: 'ISRO Deep-Space & Polar Link',
      icon: <Satellite className="w-5 h-5 text-purple-400" />,
      desc: 'Dual-axis heated tracking radome connecting to ISRO GSAT/CMS Polar Orbit satellites and LEO laser constellation for continuous high-speed telemetry with NCPOR HQ in Goa, India.',
      metric: '220 Mbps Low Latency',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="w-full max-w-4xl max-h-[92vh] bg-[#0b1624] border border-amber-500/50 rounded-2xl shadow-2xl p-6 text-slate-100 font-mono relative flex flex-col overflow-hidden">
        {/* Glowing backdrop circle */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 text-slate-950 font-bold shadow-lg shadow-amber-500/30">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5 font-sans">
                  GLOBAL POLAR RESEARCH STATION BENCHMARK
                </h2>
                <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                  MAITRI 2 #1 RANK
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Antarctic Treaty System & Polar Microgrid Council Official 2026 Rankings
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

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto space-y-5 pr-1.5 flex-1">
          {/* Top Hero Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-sky-950/40 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-xs rounded font-sans">
                  WORLD #1 RANKED
                </span>
                <span className="text-xs text-amber-300 font-bold">Score: 99.8 / 100</span>
              </div>
              <h3 className="text-lg font-bold text-white font-sans">
                Maitri 2 Polar Research Station (India · NCPOR / MoES)
              </h3>
              <p className="text-xs text-slate-300 font-sans">
                Certified as the world's most advanced, resilient, and eco-sustainable polar research complex under the Madrid Protocol Net-Zero Polar Standard.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-center p-2.5 rounded-lg bg-slate-950/80 border border-amber-500/40 min-w-[90px]">
                <div className="text-xs text-slate-400">Availability</div>
                <div className="text-base font-bold text-emerald-400">99.998%</div>
              </div>
              <div className="text-center p-2.5 rounded-lg bg-slate-950/80 border border-amber-500/40 min-w-[90px]">
                <div className="text-xs text-slate-400">Madrid Accord</div>
                <div className="text-base font-bold text-sky-400">NET-ZERO</div>
              </div>
            </div>
          </div>

          {/* 4 Pillars Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Pillars of Polar Excellence
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PILLARS_OF_EXCELLENCE.map((p) => (
                <div
                  key={p.title}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors flex gap-3"
                >
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0 h-fit">
                    {p.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-sans">{p.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-bold">
                        {p.metric}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Antarctic Station Global Scorecard
            </h4>
            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5 w-12 text-center">Rank</th>
                    <th className="p-2.5">Station & Nation</th>
                    <th className="p-2.5 hidden md:table-cell">Region</th>
                    <th className="p-2.5 text-center">Score</th>
                    <th className="p-2.5 hidden sm:table-cell">Renewability</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {STATIONS_LEADERBOARD.map((st) => (
                    <tr
                      key={st.name}
                      className={
                        st.highlight
                          ? 'bg-amber-950/25 text-white font-semibold'
                          : 'text-slate-300 hover:bg-slate-900/40'
                      }
                    >
                      <td className="p-2.5 text-center font-mono">
                        {st.rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs shadow">
                            1
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono">#{st.rank}</span>
                        )}
                      </td>
                      <td className="p-2.5">
                        <div className="font-bold flex items-center gap-1.5">
                          {st.name}
                          {st.highlight && (
                            <span className="text-[9px] px-1 py-0.2 bg-amber-500/30 text-amber-300 border border-amber-500/50 rounded font-mono">
                              NCPOR
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{st.country}</div>
                      </td>
                      <td className="p-2.5 text-[11px] text-slate-400 hidden md:table-cell">
                        {st.region}
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold text-emerald-400">
                        {st.score}
                      </td>
                      <td className="p-2.5 text-[11px] hidden sm:table-cell font-mono text-slate-300">
                        {st.renewableIndex}
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                            st.highlight
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {st.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>NCPOR Ministry of Earth Sciences · Madrid Protocol Annex VI Certified</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-sans text-xs transition-colors"
          >
            Close Benchmark
          </button>
        </div>
      </div>
    </div>
  );
};
