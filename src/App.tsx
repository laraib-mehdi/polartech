import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  BatteryCharging,
  Activity,
  Maximize2,
  Minimize2,
  Layers,
  HelpCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  MeteorologicalData,
  GridComponentHealth,
  DispatchSourceState,
  DistributedStorageState,
  AIEdgeForecast,
  SatelliteTelemetry,
  BlockchainEnergyBlock,
  WorkOrder,
} from './types/microgrid';
import {
  calculateSunElevation,
  calculateSolarPvOutput,
  calculateSingleWindTurbineKw,
  executeDispatch,
  updateComponentHealth,
  generateBlockHash,
  calculateSatelliteTelemetryQuality,
} from './services/microgridRules';
import { MicrogridScene3D } from './components/MicrogridScene3D';
import { TopHeader } from './components/TopHeader';
import { EdgeAIDispatchPanel } from './components/EdgeAIDispatchPanel';
import { DistributedGridDERMSPanel } from './components/DistributedGridDERMSPanel';
import { PredictiveMaintenancePanel } from './components/PredictiveMaintenancePanel';
import { SatelliteTelemetryModal } from './components/SatelliteTelemetryModal';
import { BlockchainTradingPanel } from './components/BlockchainTradingPanel';
import { MeteorologicalPanel } from './components/MeteorologicalPanel';
import { SubsystemInspectorModal } from './components/SubsystemInspectorModal';
import { RankingsModal } from './components/RankingsModal';

export default function App() {
  // 1. Meteorological & Environmental State (Maitri 2 Station, Schirmacher Oasis, Queen Maud Land)
  const [weather, setWeather] = useState<MeteorologicalData>({
    timestamp: Date.now(),
    stationSolarHour: 13.5, // 1:30 PM local solar time
    airTemp: -9.5, // °C
    windSpeed: 7.5, // m/s
    windGust: 10.2, // m/s
    windDirectionDeg: 240, // typical katabatic wind from polar plateau
    cloudCoverPercent: 25,
    sunElevationDeg: 28.5,
    solarIrradianceWpm2: 520,
    blizzardRiskLevel: 'NONE',
    geomagneticKpIndex: 2,
    atmosphericPressureHpa: 988,
    seasonMode: 'SUMMER_POLAR_DAY', // Polar day currently
    manualOverrides: {
      windSpeed: false,
      cloudCover: false,
      airTemp: false,
      stationLoad: false,
      simSpeed: false,
    },
    manualValues: {
      windSpeed: 7.5,
      cloudCover: 25,
      airTemp: -9.5,
      stationLoad: 110,
      simSpeed: 1.0,
    },
  });

  // 2. Health & Predictive Maintenance Matrix
  const [components, setComponents] = useState<GridComponentHealth[]>([
    {
      id: 'wt0',
      name: 'WT-1 Polar (60 kW)',
      category: 'WIND',
      healthScore: 98,
      vibrationMmS: 0.8,
      temperatureC: -12,
      anomalyZScore: 0.2,
      isFaultInjected: false,
      isDerated: false,
      isTripped: false,
      rulHours: 4200,
      repairTimeRemainingSec: 0,
      efficiencyMultiplier: 1.0,
    },
    {
      id: 'wt1',
      name: 'WT-2 Polar (60 kW)',
      category: 'WIND',
      healthScore: 94,
      vibrationMmS: 1.1,
      temperatureC: -11,
      anomalyZScore: 0.4,
      isFaultInjected: false,
      isDerated: false,
      isTripped: false,
      rulHours: 3800,
      repairTimeRemainingSec: 0,
      efficiencyMultiplier: 1.0,
    },
    {
      id: 'wt2',
      name: 'WT-3 Polar (60 kW)',
      category: 'WIND',
      healthScore: 96,
      vibrationMmS: 0.9,
      temperatureC: -13,
      anomalyZScore: 0.3,
      isFaultInjected: false,
      isDerated: false,
      isTripped: false,
      rulHours: 4050,
      repairTimeRemainingSec: 0,
      efficiencyMultiplier: 1.0,
    },
    {
      id: 'pv',
      name: 'Solar PV Array (150 kWp)',
      category: 'SOLAR',
      healthScore: 99,
      vibrationMmS: 0.1,
      temperatureC: -7,
      anomalyZScore: 0.1,
      isFaultInjected: false,
      isDerated: false,
      isTripped: false,
      rulHours: 8500,
      repairTimeRemainingSec: 0,
      efficiencyMultiplier: 1.0,
    },
    {
      id: 'bat',
      name: 'BESS 600 kWh LFP Cells',
      category: 'BATTERY',
      healthScore: 97,
      vibrationMmS: 0.2,
      temperatureC: 18.5,
      anomalyZScore: 0.2,
      isFaultInjected: false,
      isDerated: false,
      isTripped: false,
      rulHours: 6200,
      repairTimeRemainingSec: 0,
      efficiencyMultiplier: 1.0,
    },
    {
      id: 'ely',
      name: 'PEM Electrolyzer (100 kW)',
      category: 'HYDROGEN',
      healthScore: 95,
      vibrationMmS: 0.3,
      temperatureC: 38.0,
      anomalyZScore: 0.3,
      isFaultInjected: false,
      isDerated: false,
      isTripped: false,
      rulHours: 5100,
      repairTimeRemainingSec: 0,
      efficiencyMultiplier: 1.0,
    },
    {
      id: 'fc',
      name: 'PEM Fuel Cell (80 kW)',
      category: 'HYDROGEN',
      healthScore: 96,
      vibrationMmS: 0.4,
      temperatureC: 45.0,
      anomalyZScore: 0.2,
      isFaultInjected: false,
      isDerated: false,
      isTripped: false,
      rulHours: 4900,
      repairTimeRemainingSec: 0,
      efficiencyMultiplier: 1.0,
    },
    {
      id: 'dg0',
      name: 'Diesel Genset 1 (100 kW)',
      category: 'DIESEL',
      healthScore: 92,
      vibrationMmS: 1.4,
      temperatureC: 22.0,
      anomalyZScore: 0.5,
      isFaultInjected: false,
      isDerated: false,
      isTripped: false,
      rulHours: 2800,
      repairTimeRemainingSec: 0,
      efficiencyMultiplier: 1.0,
    },
    {
      id: 'dg1',
      name: 'Diesel Genset 2 (100 kW)',
      category: 'DIESEL',
      healthScore: 93,
      vibrationMmS: 1.3,
      temperatureC: 21.5,
      anomalyZScore: 0.4,
      isFaultInjected: false,
      isDerated: false,
      isTripped: false,
      rulHours: 2950,
      repairTimeRemainingSec: 0,
      efficiencyMultiplier: 1.0,
    },
  ]);

  // 3. Storage & Distributed Grid State
  const [storage, setStorage] = useState<DistributedStorageState>({
    batterySoc: 0.68,
    batteryCapacityKwh: 600,
    batteryTempC: 18.2,
    batteryStateOfHealth: 98.4,
    hydrogenStoredKg: 245, // ~4.1 MWh stored
    hydrogenPressureBar: 428,
    hydrogenAutonomyDays: 3.8,
    thermalHeatRecoveredKw: 14.5,
    cumulativeFuelLiters: 48,
    cumulativeCurtailedKwh: 120,
    dieselStartsCount: 1,
    dieselRunHours: 1.2,
    continuousZeroCarbonHours: 38.4,
    peakZeroCarbonStreakHours: 72.0,
    renewableSharePercent: 98.5,
  });

  // 4. Dispatch Source State
  const [dispatch, setDispatch] = useState<DispatchSourceState>({
    pvPowerKw: 88,
    windPowerKw: 62,
    windUnitsKw: [20, 21, 21],
    batteryPowerKw: -32, // charging 32 kW
    fuelCellPowerKw: 0,
    electrolyzerPowerKw: 8,
    dieselPowerKw: 0,
    curtailedPowerKw: 0,
    stationLoadKw: 110,
    unservedLoadKw: 0,
    dispatchDecisionSummary: 'Edge AI: Surplus renewables stored in BESS at 0 emissions',
    meritOrderAllocations: [],
  });

  // 5. AI Neural 24-Hour Lookahead Forecast
  const [forecast, setForecast] = useState<AIEdgeForecast>({
    currentLoadKw: 110,
    forecastLoadNext1hKw: 112,
    forecastLoadNext3hKw: 115,
    forecastRenewableNext3hKw: 155,
    forecastDeficitNext3hKwh: 0,
    dynamicBatteryReserveThreshold: 0.16,
    forecastMapePercent: 4.8,
    historyPoints: Array.from({ length: 24 }).map((_, i) => ({
      timestamp: Date.now() - (24 - i) * 3600 * 1000,
      actualLoadKw: 100 + Math.sin((i / 24) * Math.PI * 2) * 15,
      forecastLoadKw: 98 + Math.sin((i / 24) * Math.PI * 2) * 16,
      renewableGenKw: 120 + Math.cos((i / 24) * Math.PI * 2) * 45,
    })),
  });

  // 6. LEO Satellite Telemetry Link State
  const [satellite, setSatellite] = useState<SatelliteTelemetry>({
    satelliteName: 'ISRO-GSAT7-POLAR-RELAY',
    constellation: 'ISRO_POLAR_LINK',
    status: 'OPTIMAL_LOCK',
    elevationDeg: 54.2,
    azimuthDeg: 148.6,
    carrierToNoiseDb: 22.8,
    uplinkSpeedMbps: 45.0,
    downlinkSpeedMbps: 220.0,
    latencyMs: 19,
    packetLossPercent: 0.005,
    lastTelemetrySyncUtc: new Date().toISOString(),
    isRemoteCommandAuthorized: false,
    commandAuthNonce: 'NONCE-8472-MAITRI-VERIFIED',
  });

  // 7. Blockchain Energy Trading Ledger
  const [blockchainBlocks, setBlockchainBlocks] = useState<BlockchainEnergyBlock[]>([
    {
      blockIndex: 14208,
      timestampUtc: '2026-11-10T18:50:00Z',
      previousHash: '0x00084f92c10b71a482d93e1a74c82b091f83c182a4',
      blockHash: '0x00091e7c2a41d94b81c2f94821a83b9c71e8402a11',
      merkleRoot: '0x4f82c91a7b3e',
      validatorStation: 'Maitri 2 Station (Genesis Node #1)',
      greenEnergyMintedKwh: 280.5,
      carbonOffsetKg: 187.9,
      transactionsCount: 1,
      transactions: [
        {
          txId: 'tx-8391',
          sellerStation: 'Maitri 2 Station',
          buyerStation: 'Maitri 1 Base (India Legacy · 2.5km)',
          energyAmountKwh: 45,
          tokenAmountREC: 45,
          pricePerKwhUsd: 0.18,
          carrierType: 'VIRTUAL_P2P_CREDIT',
          status: 'CONFIRMED',
        },
      ],
    },
  ]);

  // 8. Automated Work Orders
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
    {
      id: 'WO-1042',
      timestamp: '18:30 UTC',
      subsystemId: 'wt1',
      subsystemName: 'Wind Turbine 2',
      severity: 'LOW',
      status: 'DETECTED',
      diagnosticAnomaly: 'Vibration high-frequency harmonic at 3.2 kHz detected. Bearing lubrication scheduled.',
      recommendedAction: 'Synthetic polar grease replenishment during low-wind window.',
      estimatedDowntimeHours: 1.5,
    },
  ]);

  // 9. Operational Controls & Modal UI States
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const [isHydrogenEnabled, setIsHydrogenEnabled] = useState(true);
  const [isBlizzardMode, setIsBlizzardMode] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedSubsystemId, setSelectedSubsystemId] = useState('overview');
  const [isSatelliteModalOpen, setIsSatelliteModalOpen] = useState(false);
  const [isBlockchainModalOpen, setIsBlockchainModalOpen] = useState(false);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [isRankingsModalOpen, setIsRankingsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dispatch' | 'storage' | 'maintenance'>('dispatch');

  // Fast Ref for loop
  const loopStateRef = useRef({
    weather,
    components,
    storage,
    dispatch,
    forecast,
    satellite,
    isAiEnabled,
    isHydrogenEnabled,
    isBlizzardMode,
  });

  useEffect(() => {
    loopStateRef.current = {
      weather,
      components,
      storage,
      dispatch,
      forecast,
      satellite,
      isAiEnabled,
      isHydrogenEnabled,
      isBlizzardMode,
    };
  });

  // Main Microgrid Simulation Tick (Runs every 1 second)
  useEffect(() => {
    const interval = setInterval(() => {
      const s = loopStateRef.current;
      const dtHours = 1 / 3600; // 1 second real-time tick

      // 1. Advance Solar Time
      const newSolarHour = (s.weather.stationSolarHour + dtHours * 2.5) % 24;

      // 2. Weather & Astronomical Sun Position
      const sunElevation = calculateSunElevation(newSolarHour, s.weather.seasonMode);
      const windSpeed = s.weather.manualOverrides.windSpeed
        ? s.weather.manualValues.windSpeed
        : s.isBlizzardMode
        ? 24.5
        : 7.2 + Math.sin(newSolarHour * 1.5) * 2.0;

      const airTemp = s.weather.manualOverrides.airTemp
        ? s.weather.manualValues.airTemp
        : s.isBlizzardMode
        ? -34.0
        : -9.5 + Math.cos(((newSolarHour - 14) / 24) * Math.PI * 2) * 3.5;

      const cloudCover = s.weather.manualOverrides.cloudCover
        ? s.weather.manualValues.cloudCover
        : s.isBlizzardMode
        ? 95
        : 25;

      const baseLoad = s.weather.manualOverrides.stationLoad
        ? s.weather.manualValues.stationLoad
        : 110;

      // Blizzard mode sheds non-critical load (reduces load to 82 kW)
      const stationLoadKw = s.isBlizzardMode ? baseLoad * 0.75 : baseLoad;

      // 3. Renewables Generation
      const pvMultiplier = s.components.find((c) => c.id === 'pv')?.efficiencyMultiplier ?? 1.0;
      const pvPowerKw = calculateSolarPvOutput(sunElevation, cloudCover, airTemp, pvMultiplier);

      const wtComps = [
        s.components.find((c) => c.id === 'wt0'),
        s.components.find((c) => c.id === 'wt1'),
        s.components.find((c) => c.id === 'wt2'),
      ];
      const windUnitsKw: [number, number, number] = [
        calculateSingleWindTurbineKw(windSpeed, airTemp, wtComps[0]?.efficiencyMultiplier ?? 1.0),
        calculateSingleWindTurbineKw(windSpeed, airTemp, wtComps[1]?.efficiencyMultiplier ?? 1.0),
        calculateSingleWindTurbineKw(windSpeed, airTemp, wtComps[2]?.efficiencyMultiplier ?? 1.0),
      ];
      const totalWindKw = windUnitsKw[0] + windUnitsKw[1] + windUnitsKw[2];

      // 4. Dispatch Source Selection
      const batMultiplier = s.components.find((c) => c.id === 'bat')?.efficiencyMultiplier ?? 1.0;
      const dgMultiplier =
        ((s.components.find((c) => c.id === 'dg0')?.efficiencyMultiplier ?? 1.0) +
          (s.components.find((c) => c.id === 'dg1')?.efficiencyMultiplier ?? 1.0)) /
        2;
      const elyMultiplier = s.components.find((c) => c.id === 'ely')?.efficiencyMultiplier ?? 1.0;
      const fcMultiplier = s.components.find((c) => c.id === 'fc')?.efficiencyMultiplier ?? 1.0;

      const dispatchResult = executeDispatch({
        pvPowerKw,
        windPowerKw: totalWindKw,
        windUnitsKw,
        stationLoadKw,
        dtHours,
        currentSoc: s.storage.batterySoc,
        currentH2Kg: s.storage.hydrogenStoredKg,
        isAiEnabled: s.isAiEnabled,
        isHydrogenSystemEnabled: s.isHydrogenEnabled,
        forecastDeficit3hKwh: s.forecast.forecastDeficitNext3hKwh,
        forecastRenewableNext3hKw: s.forecast.forecastRenewableNext3hKw,
        forecastLoadNext3hKw: s.forecast.forecastLoadNext3hKw,
        availableDieselCapacityKw: 200 * dgMultiplier,
        availableBatteryPowerKw: 220 * batMultiplier,
        availableElectrolyzerKw: 100 * elyMultiplier,
        availableFuelCellKw: 80 * fcMultiplier,
      });

      // 5. Update Component Health and Anomaly Z-scores
      const updatedComponents = s.components.map((comp) => {
        let isOp = false;
        if (comp.category === 'WIND') isOp = totalWindKw > 5;
        if (comp.category === 'SOLAR') isOp = pvPowerKw > 2;
        if (comp.category === 'BATTERY') isOp = Math.abs(dispatchResult.dispatch.batteryPowerKw) > 1;
        if (comp.category === 'DIESEL') isOp = dispatchResult.dispatch.dieselPowerKw > 1;
        if (comp.id === 'ely') isOp = dispatchResult.dispatch.electrolyzerPowerKw > 1;
        if (comp.id === 'fc') isOp = dispatchResult.dispatch.fuelCellPowerKw > 1;
        return updateComponentHealth(comp, dtHours, isOp);
      });

      // 6. Update Storage & Fuel Stats
      const isZeroCarbon = dispatchResult.dispatch.dieselPowerKw < 0.5;
      const updatedZeroCarbonHours = isZeroCarbon
        ? s.storage.continuousZeroCarbonHours + dtHours
        : 0;
      const updatedPeakZeroCarbon = Math.max(s.storage.peakZeroCarbonStreakHours, updatedZeroCarbonHours);

      const renewableFraction =
        ((dispatchResult.dispatch.pvPowerKw +
          dispatchResult.dispatch.windPowerKw +
          dispatchResult.dispatch.fuelCellPowerKw +
          Math.max(0, dispatchResult.dispatch.batteryPowerKw)) /
          Math.max(1, stationLoadKw)) *
        100;

      // 7. Satellite Telemetry Link Update
      const satQuality = calculateSatelliteTelemetryQuality(
        s.satellite.elevationDeg,
        cloudCover,
        s.isBlizzardMode ? 'SEVERE_WHITEOUT' : 'NONE',
        s.weather.geomagneticKpIndex
      );

      // State batch updates
      setWeather((prev) => ({
        ...prev,
        stationSolarHour: newSolarHour,
        sunElevationDeg: sunElevation,
        windSpeed,
        airTemp,
        cloudCoverPercent: cloudCover,
      }));

      setDispatch(dispatchResult.dispatch);

      setStorage((prev) => ({
        ...prev,
        batterySoc: dispatchResult.newSoc,
        hydrogenStoredKg: dispatchResult.newH2Kg,
        hydrogenPressureBar: (dispatchResult.newH2Kg / 400) * 700,
        hydrogenAutonomyDays: (dispatchResult.newH2Kg * 16.7) / (stationLoadKw * 24),
        cumulativeFuelLiters: prev.cumulativeFuelLiters + dispatchResult.fuelConsumedLiters,
        cumulativeCurtailedKwh: prev.cumulativeCurtailedKwh + dispatchResult.curtailedKwh,
        thermalHeatRecoveredKw: dispatchResult.heatRecoveredKw,
        continuousZeroCarbonHours: updatedZeroCarbonHours,
        peakZeroCarbonStreakHours: updatedPeakZeroCarbon,
        renewableSharePercent: Math.min(100, Math.max(0, renewableFraction)),
      }));

      setComponents(updatedComponents);

      setSatellite((prev) => ({
        ...prev,
        carrierToNoiseDb: satQuality.carrierToNoiseDb,
        downlinkSpeedMbps: satQuality.downlinkMbps,
        uplinkSpeedMbps: satQuality.uplinkMbps,
        latencyMs: satQuality.latencyMs,
        packetLossPercent: satQuality.packetLoss,
        status: satQuality.status,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Fault Injection Handler
  const handleInjectFault = useCallback((componentId: string) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === componentId ? { ...c, isFaultInjected: true, anomalyZScore: 4.8 } : c))
    );

    const comp = components.find((c) => c.id === componentId);
    if (comp) {
      setWorkOrders((prev) => [
        {
          id: `WO-${Math.floor(Math.random() * 9000 + 1000)}`,
          timestamp: new Date().toLocaleTimeString(),
          subsystemId: componentId,
          subsystemName: comp.name,
          severity: 'HIGH',
          status: 'DISPATCHED',
          diagnosticAnomaly: `Rapid vibration acceleration anomaly (Z-score 4.8σ) on ${comp.name}. Automatic Edge AI protective derating engaged.`,
          recommendedAction: 'Immediate station maintenance crew dispatched for bearing/injector inspection.',
          estimatedDowntimeHours: 2.0,
        },
        ...prev,
      ]);
    }
  }, [components]);

  // Dispatch Repair Crew (Resets all faults)
  const handleDispatchRepairCrew = useCallback(() => {
    setComponents((prev) =>
      prev.map((c) => ({
        ...c,
        healthScore: 100,
        anomalyZScore: 0.2,
        isFaultInjected: false,
        isDerated: false,
        isTripped: false,
        efficiencyMultiplier: 1.0,
        repairTimeRemainingSec: 0,
      }))
    );
    setWorkOrders((prev) =>
      prev.map((wo) => ({ ...wo, status: 'SERVICED' }))
    );
  }, []);

  // Repair single component
  const handleRepairComponent = useCallback((id: string) => {
    setComponents((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              healthScore: 100,
              anomalyZScore: 0.2,
              isFaultInjected: false,
              isDerated: false,
              isTripped: false,
              efficiencyMultiplier: 1.0,
            }
          : c
      )
    );
  }, []);

  // Blockchain P2P Energy Trade Execution
  const handleExecuteTrade = useCallback((trade: {
    buyerStation: string;
    energyKwh: number;
    pricePerKwh: number;
    carrierType: 'H2_CRYOGENIC_TRANSFER' | 'MICROWAVE_BEAM_PILOT' | 'VIRTUAL_P2P_CREDIT';
  }) => {
    const prevBlock = blockchainBlocks[0];
    const newIndex = prevBlock ? prevBlock.blockIndex + 1 : 1;
    const timestampUtc = new Date().toISOString();
    const merkleRoot = `0x${Math.floor(Math.random() * 0xffffff).toString(16)}`;
    const blockHash = generateBlockHash(
      newIndex,
      prevBlock ? prevBlock.blockHash : '0x000genesis',
      timestampUtc,
      merkleRoot,
      trade.energyKwh
    );

    const newBlock: BlockchainEnergyBlock = {
      blockIndex: newIndex,
      timestampUtc,
      previousHash: prevBlock ? prevBlock.blockHash : '0x000genesis',
      blockHash,
      merkleRoot,
      validatorStation: 'Maitri 2 Station (Genesis Node #1)',
      greenEnergyMintedKwh: trade.energyKwh,
      carbonOffsetKg: trade.energyKwh * 0.68,
      transactionsCount: 1,
      transactions: [
        {
          txId: `tx-${Math.floor(Math.random() * 90000 + 10000)}`,
          sellerStation: 'Maitri 2 Station',
          buyerStation: trade.buyerStation,
          energyAmountKwh: trade.energyKwh,
          tokenAmountREC: trade.energyKwh,
          pricePerKwhUsd: trade.pricePerKwh,
          carrierType: trade.carrierType,
          status: 'CONFIRMED',
        },
      ],
    };

    setBlockchainBlocks((prev) => [newBlock, ...prev]);
  }, [blockchainBlocks]);

  // Satellite Remote Command Authorization
  const handleAuthorizeRemoteCommand = useCallback((key: string) => {
    if (key === 'POLAR-SCADA-2026' || key.toLowerCase() === 'admin' || key.length > 4) {
      setSatellite((prev) => ({
        ...prev,
        isRemoteCommandAuthorized: true,
        commandAuthNonce: `NONCE-${Math.floor(Math.random() * 90000 + 10000)}-VERIFIED`,
      }));
      return true;
    }
    return false;
  }, []);

  // Remote Microgrid Blackstart / Continuity Sync
  const handleTriggerRemoteBlackstart = useCallback(() => {
    setIsBlizzardMode(true);
    setIsAiEnabled(true);
    setIsHydrogenEnabled(true);
    // Instant frequency and voltage stabilization
    setDispatch((prev) => ({
      ...prev,
      unservedLoadKw: 0,
      dispatchDecisionSummary: 'REMOTE COMMAND: Uninterruptible Continuity & Synthetic Inertia Synchronized (<8ms)',
    }));
  }, []);

  const selectedComp = components.find((c) => c.id === selectedSubsystemId);
  const activeFaultCount = components.filter((c) => c.isFaultInjected || c.isDerated || c.isTripped).length;

  return (
    <div className="w-screen h-screen flex flex-col bg-[#070e17] text-slate-100 overflow-hidden font-mono select-none">
      {/* Top SCADA Header */}
      <TopHeader
        weather={weather}
        satellite={satellite}
        isAiEnabled={isAiEnabled}
        onToggleAi={() => setIsAiEnabled((v) => !v)}
        isHydrogenEnabled={isHydrogenEnabled}
        onToggleHydrogen={() => setIsHydrogenEnabled((v) => !v)}
        isBlizzardMode={isBlizzardMode}
        onToggleBlizzardMode={() => setIsBlizzardMode((v) => !v)}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels((v) => !v)}
        onOpenSatelliteModal={() => setIsSatelliteModalOpen(true)}
        onOpenBlockchainModal={() => setIsBlockchainModalOpen(true)}
        onOpenWeatherModal={() => setIsWeatherModalOpen(true)}
        onOpenRankingsModal={() => setIsRankingsModalOpen(true)}
        onResetAllFaults={handleDispatchRepairCrew}
        activeFaultCount={activeFaultCount}
        renewableSharePercent={storage.renewableSharePercent}
      />

      {/* Main Digital Twin & Telemetry Split Screen */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row relative">
        {/* Left / Center 3D Digital Twin Viewport */}
        <div className="flex-1 h-[50vh] lg:h-full relative overflow-hidden">
          <MicrogridScene3D
            dispatch={dispatch}
            components={components}
            sunElevationDeg={weather.sunElevationDeg}
            solarHour={weather.stationSolarHour}
            windSpeedMs={weather.windSpeed}
            selectedSubsystemId={selectedSubsystemId}
            onSelectSubsystem={(id) => setSelectedSubsystemId(id)}
            showLabels={showLabels}
            h2StoredKg={storage.hydrogenStoredKg}
            maxH2Kg={400}
            batterySoc={storage.batterySoc}
          />
        </div>

        {/* Right Telemetry SCADA Sidebar */}
        <div className="w-full lg:w-[460px] xl:w-[500px] h-[50vh] lg:h-full bg-[#070e17]/95 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col z-20 shadow-2xl backdrop-blur-xl">
          {/* SCADA Tab Selector */}
          <div className="flex items-center border-b border-slate-800 p-2 gap-1.5 shrink-0 bg-[#0b1624]">
            <button
              onClick={() => setActiveTab('dispatch')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'dispatch'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Edge AI Merit</span>
            </button>

            <button
              onClick={() => setActiveTab('storage')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'storage'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BatteryCharging className="w-3.5 h-3.5" />
              <span>DERMS & H₂ Hub</span>
            </button>

            <button
              onClick={() => setActiveTab('maintenance')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'maintenance'
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>AI Health ({activeFaultCount})</span>
            </button>
          </div>

          {/* Tab Content Panes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'dispatch' && (
              <EdgeAIDispatchPanel
                dispatch={dispatch}
                forecast={forecast}
                isAiEnabled={isAiEnabled}
                cumulativeFuelLiters={storage.cumulativeFuelLiters}
                cumulativeCurtailedKwh={storage.cumulativeCurtailedKwh}
                dieselStartsCount={storage.dieselStartsCount}
                continuousZeroCarbonHours={storage.continuousZeroCarbonHours}
                peakZeroCarbonStreakHours={storage.peakZeroCarbonStreakHours}
              />
            )}

            {activeTab === 'storage' && (
              <DistributedGridDERMSPanel
                storage={storage}
                isHydrogenEnabled={isHydrogenEnabled}
                electrolyzerKw={dispatch.electrolyzerPowerKw}
                fuelCellKw={dispatch.fuelCellPowerKw}
                batteryPowerKw={dispatch.batteryPowerKw}
                ambientTempC={weather.airTemp}
              />
            )}

            {activeTab === 'maintenance' && (
              <PredictiveMaintenancePanel
                components={components}
                workOrders={workOrders}
                isAiEnabled={isAiEnabled}
                onInjectFault={handleInjectFault}
                onDispatchRepairCrew={handleDispatchRepairCrew}
                onSelectComponent={(id) => setSelectedSubsystemId(id)}
                selectedComponentId={selectedSubsystemId}
              />
            )}
          </div>
        </div>
      </div>

      {/* Floating Subsystem 3D Inspector Dock */}
      <SubsystemInspectorModal
        componentId={selectedSubsystemId}
        onClose={() => setSelectedSubsystemId('overview')}
        component={selectedComp}
        livePowerKw={
          selectedSubsystemId === 'pv'
            ? dispatch.pvPowerKw
            : selectedSubsystemId.startsWith('wt')
            ? dispatch.windUnitsKw[Number(selectedSubsystemId.slice(2))] || dispatch.windPowerKw
            : selectedSubsystemId === 'bat'
            ? dispatch.batteryPowerKw
            : selectedSubsystemId === 'ely'
            ? dispatch.electrolyzerPowerKw
            : selectedSubsystemId === 'fc'
            ? dispatch.fuelCellPowerKw
            : selectedSubsystemId === 'dg'
            ? dispatch.dieselPowerKw
            : selectedSubsystemId === 'load'
            ? dispatch.stationLoadKw
            : undefined
        }
        onInjectFault={handleInjectFault}
        onRepairComponent={handleRepairComponent}
      />

      {/* LEO Satellite Telemetry & Remote SCADA Modal */}
      <SatelliteTelemetryModal
        isOpen={isSatelliteModalOpen}
        onClose={() => setIsSatelliteModalOpen(false)}
        satellite={satellite}
        onAuthorizeRemoteCommand={handleAuthorizeRemoteCommand}
        onTriggerRemoteBlackstart={handleTriggerRemoteBlackstart}
        onSwitchConstellation={(c) => setSatellite((prev) => ({ ...prev, constellation: c }))}
      />

      {/* Blockchain Energy Trading & Proof-of-Green-Power Modal */}
      <BlockchainTradingPanel
        isOpen={isBlockchainModalOpen}
        onClose={() => setIsBlockchainModalOpen(false)}
        blocks={blockchainBlocks}
        onExecuteTrade={handleExecuteTrade}
        currentStationRenewableShare={storage.renewableSharePercent}
      />

      {/* Antarctic Meteorological Telemetry & Manual Override Modal */}
      <MeteorologicalPanel
        isOpen={isWeatherModalOpen}
        onClose={() => setIsWeatherModalOpen(false)}
        weather={weather}
        onUpdateManualOverride={(key, val) =>
          setWeather((prev) => ({
            ...prev,
            manualOverrides: { ...prev.manualOverrides, [key]: val },
          }))
        }
        onUpdateManualValue={(key, val) =>
          setWeather((prev) => ({
            ...prev,
            manualValues: { ...prev.manualValues, [key]: val },
          }))
        }
        onResetAllOverrides={() =>
          setWeather((prev) => ({
            ...prev,
            manualOverrides: {
              windSpeed: false,
              cloudCover: false,
              airTemp: false,
              stationLoad: false,
              simSpeed: false,
            },
          }))
        }
        onSetSeasonMode={(mode) => setWeather((prev) => ({ ...prev, seasonMode: mode }))}
      />

      {/* Global Polar Research Station #1 Benchmark & Rankings Modal */}
      <RankingsModal
        isOpen={isRankingsModalOpen}
        onClose={() => setIsRankingsModalOpen(false)}
        currentRenewableShare={storage.renewableSharePercent}
      />
    </div>
  );
}
