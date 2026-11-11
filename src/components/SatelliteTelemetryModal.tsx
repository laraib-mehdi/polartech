import React, { useState } from 'react';
import {
  Satellite,
  Radio,
  Lock,
  Unlock,
  Key,
  Shield,
  Activity,
  X,
  CheckCircle,
  Wifi,
  Compass,
} from 'lucide-react';
import { SatelliteTelemetry } from '../types/microgrid';

interface SatelliteTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  satellite: SatelliteTelemetry;
  onAuthorizeRemoteCommand: (authKey: string) => boolean;
  onTriggerRemoteBlackstart: () => void;
  onSwitchConstellation: (constellation: SatelliteTelemetry['constellation']) => void;
}

export const SatelliteTelemetryModal: React.FC<SatelliteTelemetryModalProps> = ({
  isOpen,
  onClose,
  satellite,
  onAuthorizeRemoteCommand,
  onTriggerRemoteBlackstart,
  onSwitchConstellation,
}) => {
  const [authInput, setAuthInput] = useState('');
  const [authStatus, setAuthStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onAuthorizeRemoteCommand(authInput.trim());
    if (success) {
      setAuthStatus('SUCCESS: Cryptographic signature verified. Remote SCADA authorization granted.');
    } else {
      setAuthStatus('ERROR: Invalid authorization key. Use demo key: POLAR-SCADA-2026');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-2xl bg-[#0b1624] border border-purple-800/80 rounded-2xl shadow-2xl p-6 text-slate-100 font-mono relative overflow-hidden">
        {/* Glowing backdrop circle */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Satellite className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                LEO SATELLITE TELEMETRY & REMOTE SCADA
                <span className="text-[10px] px-2 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 rounded">
                  {satellite.status}
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                ISRO Polar Deep-Space Gateway & LEO Constellation · Maitri 2 Ground Tracking Station
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

        {/* Constellation Selector */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-sans text-slate-400">Constellation:</span>
          {(['ISRO_POLAR_LINK', 'STARLINK_POLAR', 'IRIDIUM_NEXT'] as const).map((c) => (
            <button
              key={c}
              onClick={() => onSwitchConstellation(c)}
              className={`px-3 py-1 text-xs rounded-lg font-sans font-medium transition-all ${
                satellite.constellation === c
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {c === 'ISRO_POLAR_LINK' ? 'ISRO POLAR SAT' : c.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Real-time Link Budget Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Downlink Throughput</span>
            <span className="text-emerald-400 font-bold text-base">{satellite.downlinkSpeedMbps.toFixed(1)} Mbps</span>
            <span className="text-[10px] text-slate-400 block">Ka-band Carrier</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Uplink Telemetry</span>
            <span className="text-cyan-400 font-bold text-base">{satellite.uplinkSpeedMbps.toFixed(1)} Mbps</span>
            <span className="text-[10px] text-slate-400 block">Secure Tunnel</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">RTT Latency</span>
            <span className="text-purple-300 font-bold text-base">{satellite.latencyMs} ms</span>
            <span className="text-[10px] text-slate-400 block">Jitter: ±2.1 ms</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Carrier-to-Noise (C/N₀)</span>
            <span className="text-white font-bold text-base">{satellite.carrierToNoiseDb.toFixed(1)} dB-Hz</span>
            <span className="text-[10px] text-slate-400 block">Packet Loss: {satellite.packetLossPercent.toFixed(2)}%</span>
          </div>
        </div>

        {/* Tracking Antenna Coordinates */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 mb-5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-purple-400" />
            <span className="text-slate-300">Antenna Pointing Angle:</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Elevation: <strong className="text-white">{satellite.elevationDeg.toFixed(1)}°</strong></span>
            <span>Azimuth: <strong className="text-white">{satellite.azimuthDeg.toFixed(1)}° True</strong></span>
            <span>Handshake: <strong className="text-emerald-400">AES-256-GCM</strong></span>
          </div>
        </div>

        {/* Remote SCADA Cryptographic Command Authorization */}
        <div className="p-4 rounded-xl bg-slate-950 border border-purple-900/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-400" />
              <span className="font-sans font-bold text-sm text-white">Remote SCADA Command Terminal</span>
            </div>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              {satellite.isRemoteCommandAuthorized ? (
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <Unlock className="w-3.5 h-3.5" /> AUTHORIZED
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1 font-bold">
                  <Lock className="w-3.5 h-3.5" /> LOCKED
                </span>
              )}
            </span>
          </div>

          {!satellite.isRemoteCommandAuthorized ? (
            <form onSubmit={handleAuthenticate} className="space-y-3">
              <p className="text-xs text-slate-400 font-sans">
                Enter polar research station operator credential token to issue remote grid dispatch commands over satellite:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={authInput}
                  onChange={(e) => setAuthInput(e.target.value)}
                  placeholder="Demo key: POLAR-SCADA-2026"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Authorize
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Operator verified. Remote command nonce active: {satellite.commandAuthNonce}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onTriggerRemoteBlackstart}
                  className="flex-1 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold font-sans transition-all shadow-md shadow-red-600/30"
                >
                  Execute Remote Microgrid Islanding & Continuity Sync
                </button>
              </div>
            </div>
          )}

          {authStatus && (
            <div
              className={`mt-2 text-xs font-sans ${
                authStatus.startsWith('SUCCESS') ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {authStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
