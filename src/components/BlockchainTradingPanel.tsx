import React, { useState } from 'react';
import {
  Coins,
  ShieldCheck,
  Blocks,
  ArrowRightLeft,
  X,
  FileCheck2,
  Lock,
  Globe2,
  Sparkles,
} from 'lucide-react';
import { BlockchainEnergyBlock } from '../types/microgrid';

interface BlockchainTradingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: BlockchainEnergyBlock[];
  onExecuteTrade: (trade: {
    buyerStation: string;
    energyKwh: number;
    pricePerKwh: number;
    carrierType: 'H2_CRYOGENIC_TRANSFER' | 'MICROWAVE_BEAM_PILOT' | 'VIRTUAL_P2P_CREDIT';
  }) => void;
  currentStationRenewableShare: number;
}

export const BlockchainTradingPanel: React.FC<BlockchainTradingPanelProps> = ({
  isOpen,
  onClose,
  blocks,
  onExecuteTrade,
  currentStationRenewableShare,
}) => {
  const [targetStation, setTargetStation] = useState('Maitri 1 Base (India Legacy · 2.5km)');
  const [tradeAmountKwh, setTradeAmountKwh] = useState(50);
  const [tradePriceUsd, setTradePriceUsd] = useState(0.18);
  const [carrierType, setCarrierType] = useState<'VIRTUAL_P2P_CREDIT' | 'H2_CRYOGENIC_TRANSFER'>(
    'VIRTUAL_P2P_CREDIT'
  );
  const [txSuccessMessage, setTxSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmitTrade = (e: React.FormEvent) => {
    e.preventDefault();
    onExecuteTrade({
      buyerStation: targetStation,
      energyKwh: tradeAmountKwh,
      pricePerKwh: tradePriceUsd,
      carrierType,
    });
    setTxSuccessMessage(
      `SMART CONTRACT EXECUTED: Transferred ${tradeAmountKwh} kWh green credit to ${targetStation}. Block mined and sealed.`
    );
    setTimeout(() => setTxSuccessMessage(null), 5000);
  };

  const latestBlock = blocks[0];
  const totalGreenKwhMinted = blocks.reduce((acc, b) => acc + b.greenEnergyMintedKwh, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-3xl bg-[#0b1624] border border-emerald-800/80 rounded-2xl shadow-2xl p-6 text-slate-100 font-mono relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Blocks className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                ANTARCTIC STATION RENEWABLE ENERGY CONSORTIUM (ASREC)
                <span className="text-[10px] px-2 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 rounded">
                  PoGP CONSENSUS
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Blockchain-Verified Energy Trading Protocols & Proof-of-Green-Power Ledger
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

        {/* Consortium Node Network Status */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 shrink-0">
          {[
            { name: 'Maitri 2 Station', country: 'Genesis Node #1', status: 'ONLINE', ping: '0.2ms' },
            { name: 'Maitri 1 Base', country: 'India Legacy · 2.5km', status: 'LINKED', ping: '1.4ms' },
            { name: 'Novolazarevskaya', country: 'Russia · 5km', status: 'LINKED', ping: '2.8ms' },
            { name: 'Princess Elisabeth', country: 'Belgium · 430km', status: 'LINKED', ping: '14ms' },
          ].map((node) => (
            <div key={node.name} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px]">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="font-bold text-white truncate">{node.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500">{node.country}</span>
                <span className="text-emerald-400 font-bold">{node.ping}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Trade Execution Form */}
        <form onSubmit={handleSubmitTrade} className="p-4 rounded-xl bg-slate-950 border border-slate-800 mb-4 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans font-bold text-sm text-white flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
              P2P Smart Contract Energy Trade
            </span>
            <span className="text-xs text-emerald-400 font-sans">
              Local Renewable Share: <strong>{currentStationRenewableShare.toFixed(1)}%</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 text-xs">
            <div>
              <label className="text-slate-400 text-[11px] block mb-1 font-sans">Buyer Station:</label>
              <select
                value={targetStation}
                onChange={(e) => setTargetStation(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Maitri 1 Base (India Legacy · 2.5km)">Maitri 1 Base (India Legacy · 2.5km)</option>
                <option value="Novolazarevskaya (Russia · 5km)">Novolazarevskaya (Russia · 5km)</option>
                <option value="Princess Elisabeth (Belgium · 430km)">Princess Elisabeth (Belgium · 430km)</option>
                <option value="Troll Station (Norway · 220km)">Troll Station (Norway · 220km)</option>
                <option value="Bharati Station (India Coastal · 3,000km)">Bharati Station (India Coastal · 3,000km)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 text-[11px] block mb-1 font-sans">Energy Amount (kWh):</label>
              <input
                type="number"
                min={10}
                max={500}
                step={10}
                value={tradeAmountKwh}
                onChange={(e) => setTradeAmountKwh(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 text-[11px] block mb-1 font-sans">Clearing Price ($/kWh):</label>
              <input
                type="number"
                min={0.05}
                max={0.5}
                step={0.01}
                value={tradePriceUsd}
                onChange={(e) => setTradePriceUsd(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-xs font-sans text-slate-300">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="carrier"
                  checked={carrierType === 'VIRTUAL_P2P_CREDIT'}
                  onChange={() => setCarrierType('VIRTUAL_P2P_CREDIT')}
                  className="accent-emerald-500"
                />
                Virtual P2P Credit
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="carrier"
                  checked={carrierType === 'H2_CRYOGENIC_TRANSFER'}
                  onChange={() => setCarrierType('H2_CRYOGENIC_TRANSFER')}
                  className="accent-emerald-500"
                />
                Cryogenic H₂ Tank Swap
              </label>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs font-sans transition-all shadow-md shadow-emerald-600/20"
            >
              Sign & Execute Trade ({(tradeAmountKwh * tradePriceUsd).toFixed(2)} USD / REC)
            </button>
          </div>

          {txSuccessMessage && (
            <div className="mt-2.5 p-2 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-lg text-xs font-sans flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{txSuccessMessage}</span>
            </div>
          )}
        </form>

        {/* Live Ledger / Block Explorer */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-sans font-semibold">
            <span>Verified Blocks (SHA-256 Ledger)</span>
            <span>Total Minted: <strong className="text-emerald-400 font-mono">{totalGreenKwhMinted.toFixed(0)} kWh</strong></span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {blocks.map((block) => (
              <div
                key={block.blockHash}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px] font-bold">
                      Block #{block.blockIndex}
                    </span>
                    <span className="text-slate-400 text-[11px] truncate max-w-xs">{block.blockHash}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{block.timestampUtc}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 pt-1">
                  <div>
                    Validator: <strong className="text-white">{block.validatorStation}</strong>
                  </div>
                  <div>
                    Green Power: <strong className="text-emerald-400">{block.greenEnergyMintedKwh.toFixed(1)} kWh</strong>
                  </div>
                  <div>
                    Offset: <strong className="text-cyan-400">{block.carbonOffsetKg.toFixed(1)} kg CO₂</strong>
                  </div>
                </div>

                {block.transactions.length > 0 && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-300 flex items-center justify-between">
                    <span>
                      Tx: {block.transactions[0].sellerStation} → {block.transactions[0].buyerStation}
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {block.transactions[0].energyAmountKwh} kWh @ ${block.transactions[0].pricePerKwhUsd}/kWh
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
