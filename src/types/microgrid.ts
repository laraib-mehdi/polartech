/**
 * Polar Microgrid Types & Interfaces
 * Maitri 2 Station, Schirmacher Oasis, Queen Maud Land, Antarctica (70.76°S, 11.73°E)
 * World's #1 Polar Research Smart Microgrid
 */

export interface MeteorologicalData {
  timestamp: number;
  stationSolarHour: number; // 0 to 24
  airTemp: number; // °C (-40 to +5)
  windSpeed: number; // m/s
  windGust: number; // m/s
  windDirectionDeg: number; // 0 to 360 (predominantly 240° katabatic)
  cloudCoverPercent: number; // 0 to 100
  sunElevationDeg: number; // -35° (polar night) to +38° (polar day)
  solarIrradianceWpm2: number; // W/m²
  blizzardRiskLevel: 'NONE' | 'LOW' | 'ELEVATED' | 'SEVERE_WHITEOUT';
  geomagneticKpIndex: number; // 0 to 9 (space weather impact on LEO satellite)
  atmosphericPressureHpa: number;
  seasonMode: 'AUTO' | 'SUMMER_POLAR_DAY' | 'WINTER_POLAR_NIGHT' | 'EQUINOX';
  manualOverrides: {
    windSpeed: boolean;
    cloudCover: boolean;
    airTemp: boolean;
    stationLoad: boolean;
    simSpeed: boolean;
  };
  manualValues: {
    windSpeed: number;
    cloudCover: number;
    airTemp: number;
    stationLoad: number;
    simSpeed: number;
  };
}

export interface GridComponentHealth {
  id: string;
  name: string;
  category: 'WIND' | 'SOLAR' | 'BATTERY' | 'HYDROGEN' | 'DIESEL' | 'BUS';
  healthScore: number; // 0 to 100%
  vibrationMmS: number;
  temperatureC: number;
  anomalyZScore: number;
  isFaultInjected: boolean;
  isDerated: boolean;
  isTripped: boolean;
  rulHours: number; // Remaining Useful Life
  repairTimeRemainingSec: number;
  efficiencyMultiplier: number; // 0.0 to 1.0
  activeFaultDescription?: string;
}

export interface DispatchSourceState {
  pvPowerKw: number;
  windPowerKw: number;
  windUnitsKw: [number, number, number];
  batteryPowerKw: number; // positive = discharge to bus, negative = charge
  fuelCellPowerKw: number;
  electrolyzerPowerKw: number;
  dieselPowerKw: number;
  curtailedPowerKw: number;
  stationLoadKw: number;
  unservedLoadKw: number;
  dispatchDecisionSummary: string;
  meritOrderAllocations: Array<{
    name: string;
    powerKw: number;
    percentage: number;
    lcoeUsdKwh: number;
    color: string;
    rank: number;
  }>;
}

export interface DistributedStorageState {
  batterySoc: number; // 0.0 to 1.0 (600 kWh nominal)
  batteryCapacityKwh: number; // derated by cold temperature
  batteryTempC: number; // thermal preconditioning +15 to +25°C
  batteryStateOfHealth: number; // 0 to 100%
  hydrogenStoredKg: number; // 0 to 400 kg (~6.7 MWh equivalent)
  hydrogenPressureBar: number; // 0 to 700 bar
  hydrogenAutonomyDays: number; // full station autonomous days on H2 alone
  thermalHeatRecoveredKw: number; // CHP combined heat & power from FC/Electrolyzer
  cumulativeFuelLiters: number;
  cumulativeCurtailedKwh: number;
  dieselStartsCount: number;
  dieselRunHours: number;
  continuousZeroCarbonHours: number;
  peakZeroCarbonStreakHours: number;
  renewableSharePercent: number; // 0 to 100%
}

export interface AIEdgeForecast {
  currentLoadKw: number;
  forecastLoadNext1hKw: number;
  forecastLoadNext3hKw: number;
  forecastRenewableNext3hKw: number;
  forecastDeficitNext3hKwh: number;
  dynamicBatteryReserveThreshold: number; // dynamic SoC floor calculated by Edge AI
  forecastMapePercent: number; // Mean Absolute Percentage Error
  historyPoints: Array<{
    timestamp: number;
    actualLoadKw: number;
    forecastLoadKw: number;
    renewableGenKw: number;
  }>;
}

export interface SatelliteTelemetry {
  satelliteName: string;
  constellation: 'ISRO_POLAR_LINK' | 'STARLINK_POLAR' | 'IRIDIUM_NEXT';
  status: 'OPTIMAL_LOCK' | 'HANDOVER' | 'SEARCHING' | 'WEATHER_ATTENUATED';
  elevationDeg: number;
  azimuthDeg: number;
  carrierToNoiseDb: number;
  uplinkSpeedMbps: number;
  downlinkSpeedMbps: number;
  latencyMs: number;
  packetLossPercent: number;
  lastTelemetrySyncUtc: string;
  isRemoteCommandAuthorized: boolean;
  commandAuthNonce: string;
}

export interface BlockchainEnergyBlock {
  blockIndex: number;
  timestampUtc: string;
  previousHash: string;
  blockHash: string;
  merkleRoot: string;
  validatorStation: string;
  greenEnergyMintedKwh: number;
  carbonOffsetKg: number;
  transactionsCount: number;
  transactions: Array<{
    txId: string;
    sellerStation: string;
    buyerStation: string;
    energyAmountKwh: number;
    tokenAmountREC: number; // Renewable Energy Certificate token
    pricePerKwhUsd: number;
    carrierType: 'H2_CRYOGENIC_TRANSFER' | 'MICROWAVE_BEAM_PILOT' | 'VIRTUAL_P2P_CREDIT';
    status: 'CONFIRMED' | 'SETTLING';
  }>;
}

export interface WorkOrder {
  id: string;
  timestamp: string;
  subsystemId: string;
  subsystemName: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'DETECTED' | 'DISPATCHED' | 'SERVICED';
  diagnosticAnomaly: string;
  recommendedAction: string;
  estimatedDowntimeHours: number;
}
