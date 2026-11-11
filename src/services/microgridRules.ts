/**
 * Pure Algorithmic Core for Polar Microgrid Smart Grid
 * Supports unit testing with node:test and decoupled UI execution
 */

import {
  DispatchSourceState,
  GridComponentHealth,
  DistributedStorageState,
  AIEdgeForecast,
  BlockchainEnergyBlock,
  SatelliteTelemetry,
} from '../types/microgrid';

// Station Specifications (Maitri 2 Station, Schirmacher Oasis, Queen Maud Land)
export const NOMINAL_BATTERY_CAPACITY_KWH = 600;
export const MAX_BATTERY_CHARGE_DISCHARGE_KW = 220;
export const DIESEL_UNIT_CAPACITY_KW = 100;
export const DIESEL_TOTAL_UNITS = 2;
export const ELECTROLYZER_CAPACITY_KW = 100;
export const FUEL_CELL_CAPACITY_KW = 80;
export const MAX_HYDROGEN_STORAGE_KG = 400; // ~6.7 MWh electric equivalent
export const H2_KWH_PER_KG_PRODUCED = 55; // Electrolyzer efficiency
export const H2_KWH_PER_KG_GENERATED = 16.7; // Fuel cell efficiency
export const STATION_LATITUDE = -70.76; // South (Schirmacher Oasis)
export const STATION_LONGITUDE = 11.73; // East

/**
 * Solar Elevation Calculation for Polar Coordinates
 */
export function calculateSunElevation(
  hour: number,
  seasonMode: 'AUTO' | 'SUMMER_POLAR_DAY' | 'WINTER_POLAR_NIGHT' | 'EQUINOX',
  dayOfYear: number = 315 // Mid-November polar summer start
): number {
  if (seasonMode === 'SUMMER_POLAR_DAY') {
    // Midnight sun: elevation stays positive 24/7 (between 6° and 38°)
    const wave = Math.sin(((hour - 6) / 24) * 2 * Math.PI);
    return 22 + 16 * wave;
  }
  if (seasonMode === 'WINTER_POLAR_NIGHT') {
    // Polar night: elevation stays below horizon (-3° to -22°)
    const wave = Math.sin(((hour - 6) / 24) * 2 * Math.PI);
    return -12 + 9 * wave;
  }
  if (seasonMode === 'EQUINOX') {
    const wave = Math.sin(((hour - 6) / 24) * 2 * Math.PI);
    return 15 * wave;
  }

  // Astronomical equation for real date
  const declinationDeg = -23.44 * Math.cos((2 * Math.PI * (dayOfYear + 10)) / 365);
  const phiRad = (STATION_LATITUDE * Math.PI) / 180;
  const decRad = (declinationDeg * Math.PI) / 180;
  const hourAngleRad = ((hour - 12) * Math.PI) / 12;

  const sinElevation =
    Math.sin(phiRad) * Math.sin(decRad) +
    Math.cos(phiRad) * Math.cos(decRad) * Math.cos(hourAngleRad);
  return (Math.asin(Math.max(-1, Math.min(1, sinElevation))) * 180) / Math.PI;
}

/**
 * Solar PV Output with polar albedo reflection & sub-zero temperature coefficient
 */
export function calculateSolarPvOutput(
  sunElevationDeg: number,
  cloudCoverPercent: number,
  ambientTempC: number,
  inverterHealthMultiplier: number = 1.0
): number {
  if (sunElevationDeg <= 0) return 0;

  // Polar snow albedo reflects up to 35% additional diffuse light to bifacial panels
  const albedoBoost = 1.25;
  // Cold temperature coefficient (silicon PV is ~0.4% more efficient per degree below 25°C)
  const tempBoost = 1 + Math.min(0.2, 0.004 * Math.max(0, 25 - ambientTempC));
  const cloudAttenuation = 1 - 0.72 * (cloudCoverPercent / 100);
  const solarAngleFactor = Math.sin((sunElevationDeg * Math.PI) / 180);

  const rawKw = 150 * 0.94 * solarAngleFactor * cloudAttenuation * albedoBoost * tempBoost;
  return Math.max(0, rawKw) * inverterHealthMultiplier;
}

/**
 * Polar Wind Turbine output: 3x 60 kW with air density enhancement
 */
export function calculateSingleWindTurbineKw(
  windSpeedMs: number,
  ambientTempC: number,
  healthMultiplier: number = 1.0
): number {
  if (windSpeedMs < 3.0 || windSpeedMs > 25.0) {
    // Cut-in 3 m/s, cut-out 25 m/s storm feathering
    return 0;
  }

  // Polar air density correction: P / (R * T). At -25°C air is ~18% denser than at standard +15°C
  const kelvin = 273.15 + ambientTempC;
  const airDensityRatio = Math.max(0.9, Math.min(1.3, 288.15 / Math.max(220, kelvin)));

  let baseKw = 0;
  if (windSpeedMs >= 12.0) {
    baseKw = 60.0;
  } else {
    // Cubic power curve between cut-in and rated
    baseKw = 60.0 * Math.pow((windSpeedMs - 3.0) / 9.0, 3);
  }

  return Math.min(65.0, baseKw * airDensityRatio * healthMultiplier);
}

/**
 * Edge AI Multi-Objective Dispatch vs Classic Rule-based Dispatch
 */
export function executeDispatch(params: {
  pvPowerKw: number;
  windPowerKw: number;
  windUnitsKw: [number, number, number];
  stationLoadKw: number;
  dtHours: number;
  currentSoc: number;
  currentH2Kg: number;
  isAiEnabled: boolean;
  isHydrogenSystemEnabled: boolean;
  forecastDeficit3hKwh: number;
  forecastRenewableNext3hKw: number;
  forecastLoadNext3hKw: number;
  availableDieselCapacityKw: number;
  availableBatteryPowerKw: number;
  availableElectrolyzerKw: number;
  availableFuelCellKw: number;
}): {
  dispatch: DispatchSourceState;
  newSoc: number;
  newH2Kg: number;
  fuelConsumedLiters: number;
  curtailedKwh: number;
  heatRecoveredKw: number;
  dieselStarted: boolean;
  unservedKwh: number;
} {
  const {
    pvPowerKw,
    windPowerKw,
    windUnitsKw,
    stationLoadKw,
    dtHours,
    currentSoc,
    currentH2Kg,
    isAiEnabled,
    isHydrogenSystemEnabled,
    forecastDeficit3hKwh,
    forecastRenewableNext3hKw,
    forecastLoadNext3hKw,
    availableDieselCapacityKw,
    availableBatteryPowerKw,
    availableElectrolyzerKw,
    availableFuelCellKw,
  } = params;

  const netRenewableKw = pvPowerKw + windPowerKw - stationLoadKw;
  const effectiveBatteryCapacityKwh = NOMINAL_BATTERY_CAPACITY_KWH;
  const maxBatteryAcceptanceKw = Math.min(
    availableBatteryPowerKw,
    ((1 - currentSoc) * effectiveBatteryCapacityKwh) / Math.max(0.005, dtHours)
  );
  const maxBatteryDeliverableKw = Math.min(
    availableBatteryPowerKw,
    (Math.max(0, currentSoc - 0.12) * effectiveBatteryCapacityKwh) / Math.max(0.005, dtHours)
  );

  let batteryKw = 0; // positive = discharging to load, negative = charging
  let electrolyzerKw = 0;
  let fuelCellKw = 0;
  let dieselKw = 0;
  let curtailedKw = 0;
  let decisionSummary = '';

  if (!isAiEnabled) {
    // RULE-BASED DISPATCH (Standard legacy hysteresis)
    if (netRenewableKw >= 0) {
      // Surplus
      batteryKw = -Math.min(netRenewableKw, maxBatteryAcceptanceKw);
      curtailedKw = Math.max(0, netRenewableKw + batteryKw);
      decisionSummary = 'Rule-based: Surplus charging battery, excess curtailed';
    } else {
      // Deficit
      const deficit = -netRenewableKw;
      if (currentSoc < 0.3) {
        // Battery depleted -> run diesel
        dieselKw = Math.min(availableDieselCapacityKw, deficit + 40);
        batteryKw = deficit - dieselKw;
        decisionSummary = 'Rule-based: SOC < 30%, diesel running to replenish';
      } else {
        batteryKw = Math.min(deficit, maxBatteryDeliverableKw);
        const remainder = deficit - batteryKw;
        if (remainder > 0) {
          dieselKw = Math.min(availableDieselCapacityKw, remainder);
          decisionSummary = 'Rule-based: Battery + Diesel split deficit';
        } else {
          decisionSummary = 'Rule-based: Battery covering entire deficit';
        }
      }
    }
  } else {
    // EDGE AI DISPATCH (Neural Lookahead & Green Hydrogen Seasonal Co-optimization)
    // Calculate dynamic battery reserve based on 3-hour forecast deficit
    const dynamicReserveSoc = Math.min(
      0.65,
      0.15 + (forecastDeficit3hKwh / effectiveBatteryCapacityKwh) * 1.1
    );
    const dynamicDischargeFloor = Math.max(
      0.12,
      dynamicReserveSoc - (forecastRenewableNext3hKw > forecastLoadNext3hKw ? 0.08 : 0.0)
    );

    if (netRenewableKw >= 0) {
      // Renewable Surplus
      const targetSoc = isHydrogenSystemEnabled ? 0.88 : 0.98;
      const batteryHeadroomKw = Math.max(
        0,
        ((targetSoc - currentSoc) * effectiveBatteryCapacityKwh) / Math.max(0.005, dtHours)
      );
      batteryKw = -Math.min(netRenewableKw, availableBatteryPowerKw, batteryHeadroomKw);
      let surplusAfterBattery = netRenewableKw + batteryKw; // positive remaining

      if (isHydrogenSystemEnabled && surplusAfterBattery > 1.0 && currentH2Kg < MAX_HYDROGEN_STORAGE_KG) {
        const h2RoomKg = MAX_HYDROGEN_STORAGE_KG - currentH2Kg;
        const maxH2AbsorbKw = (h2RoomKg * H2_KWH_PER_KG_PRODUCED) / Math.max(0.005, dtHours);
        electrolyzerKw = Math.min(surplusAfterBattery, availableElectrolyzerKw, maxH2AbsorbKw);
        surplusAfterBattery -= electrolyzerKw;
        decisionSummary = 'Edge AI: Surplus channeled into Battery + Green H₂ Electrolyzer (Zero Carbon)';
      } else {
        decisionSummary = 'Edge AI: Surplus renewables stored in BESS at 0 emissions';
      }
      curtailedKw = Math.max(0, surplusAfterBattery);
    } else {
      // Renewable Deficit
      const deficit = -netRenewableKw;
      // Allow battery discharge down to dynamic floor
      const safeBatteryKw = Math.min(
        availableBatteryPowerKw,
        (Math.max(0, currentSoc - dynamicDischargeFloor) * effectiveBatteryCapacityKwh) /
          Math.max(0.005, dtHours)
      );
      batteryKw = Math.min(deficit, safeBatteryKw);
      let remainingDeficit = deficit - batteryKw;

      // Fuel cell dispatch using green H2
      if (isHydrogenSystemEnabled && remainingDeficit > 0.5 && currentH2Kg > 15) {
        const h2AvailableKw =
          ((currentH2Kg - 15) * H2_KWH_PER_KG_GENERATED) / Math.max(0.005, dtHours);
        fuelCellKw = Math.min(remainingDeficit, availableFuelCellKw, h2AvailableKw);
        remainingDeficit -= fuelCellKw;
      }

      if (remainingDeficit > 0.5) {
        // Diesel Genset required as final safety layer
        const unitsNeeded = Math.max(1, Math.ceil(remainingDeficit / DIESEL_UNIT_CAPACITY_KW));
        // Run genset near sweet spot (75 kW per 100 kW unit) to maximize brake efficiency
        const sweetSpotKw = unitsNeeded * 75.0;
        dieselKw = Math.min(
          availableDieselCapacityKw,
          Math.max(remainingDeficit, currentSoc < 0.85 ? sweetSpotKw : remainingDeficit)
        );
        // Excess from sweet spot charges battery
        batteryKw = deficit - fuelCellKw - dieselKw;
        decisionSummary = `Edge AI: Diesel genset modulated at optimal BSFC (${(dieselKw / unitsNeeded).toFixed(0)} kW/unit)`;
      } else {
        if (fuelCellKw > 1.0) {
          decisionSummary = 'Edge AI: Green H₂ Fuel Cell + BESS bridged deficit (100% Fossil-Free)';
        } else {
          decisionSummary = 'Edge AI: BESS dynamic reserve bridged deficit (100% Fossil-Free)';
        }
      }
    }
  }

  // Constrain power limits
  batteryKw = Math.max(-availableBatteryPowerKw, Math.min(availableBatteryPowerKw, batteryKw));
  dieselKw = Math.max(0, Math.min(availableDieselCapacityKw, dieselKw));

  // State updates
  const newSoc = Math.max(
    0.05,
    Math.min(1.0, currentSoc - (batteryKw * dtHours) / effectiveBatteryCapacityKwh)
  );

  const h2ProducedKg = (electrolyzerKw * dtHours) / H2_KWH_PER_KG_PRODUCED;
  const h2ConsumedKg = (fuelCellKw * dtHours) / H2_KWH_PER_KG_GENERATED;
  const newH2Kg = Math.max(0, Math.min(MAX_HYDROGEN_STORAGE_KG, currentH2Kg + h2ProducedKg - h2ConsumedKg));

  // Fuel consumption: ~0.25 L/kWh at nominal load with quadratic penalty when idling/off-peak
  let fuelConsumedLiters = 0;
  if (dieselKw > 0) {
    const activeUnits = Math.max(1, Math.ceil(dieselKw / DIESEL_UNIT_CAPACITY_KW));
    const loadingRatio = dieselKw / (activeUnits * DIESEL_UNIT_CAPACITY_KW);
    fuelConsumedLiters = dieselKw * dtHours * (0.24 + 0.45 * Math.pow(loadingRatio - 0.75, 2));
  }

  // Combined Heat & Power (CHP) recovered from Fuel Cell (80% thermal) and Electrolyzer (12%)
  const heatRecoveredKw = fuelCellKw * 0.82 + electrolyzerKw * 0.15;

  const servedLoadKw =
    pvPowerKw + windPowerKw - curtailedKw - electrolyzerKw + dieselKw + batteryKw + fuelCellKw;
  const unservedKw = Math.max(0, stationLoadKw - servedLoadKw);

  // Merit order allocation list for dashboard visualization
  const totalLoad = Math.max(1, stationLoadKw);
  const meritOrderAllocations = [
    {
      name: 'Solar PV',
      powerKw: pvPowerKw,
      percentage: Math.min(100, (pvPowerKw / totalLoad) * 100),
      lcoeUsdKwh: 0.0,
      color: '#fbbf24',
      rank: 1,
    },
    {
      name: 'Wind Turbines (x3)',
      powerKw: windPowerKw,
      percentage: Math.min(100, (windPowerKw / totalLoad) * 100),
      lcoeUsdKwh: 0.0,
      color: '#38bdf8',
      rank: 2,
    },
    {
      name: 'BESS Battery',
      powerKw: Math.max(0, batteryKw),
      percentage: Math.min(100, (Math.max(0, batteryKw) / totalLoad) * 100),
      lcoeUsdKwh: 0.08,
      color: '#c084fc',
      rank: 3,
    },
    {
      name: 'Green H₂ Fuel Cell',
      powerKw: fuelCellKw,
      percentage: Math.min(100, (fuelCellKw / totalLoad) * 100),
      lcoeUsdKwh: 0.18,
      color: '#4ade80',
      rank: 4,
    },
    {
      name: 'Diesel Genset',
      powerKw: dieselKw,
      percentage: Math.min(100, (dieselKw / totalLoad) * 100),
      lcoeUsdKwh: 0.85,
      color: '#f87171',
      rank: 5,
    },
  ];

  const dispatch: DispatchSourceState = {
    pvPowerKw,
    windPowerKw,
    windUnitsKw,
    batteryPowerKw: batteryKw,
    fuelCellPowerKw: fuelCellKw,
    electrolyzerPowerKw: electrolyzerKw,
    dieselPowerKw: dieselKw,
    curtailedPowerKw: curtailedKw,
    stationLoadKw,
    unservedLoadKw: unservedKw,
    dispatchDecisionSummary: decisionSummary,
    meritOrderAllocations,
  };

  return {
    dispatch,
    newSoc,
    newH2Kg,
    fuelConsumedLiters,
    curtailedKwh: curtailedKw * dtHours,
    heatRecoveredKw,
    dieselStarted: dieselKw > 0.5,
    unservedKwh: unservedKw * dtHours,
  };
}

/**
 * Predictive Maintenance Anomaly & Remaining Useful Life (RUL) Evaluator
 */
export function updateComponentHealth(
  comp: GridComponentHealth,
  dtHours: number,
  isOperating: boolean
): GridComponentHealth {
  const updated = { ...comp };

  // Base degradation per operating hour
  let degradationRate = 0.004;
  if (comp.id.startsWith('wt')) degradationRate = 0.008;
  if (comp.id.startsWith('dg')) degradationRate = isOperating ? 0.015 : 0.001;
  if (comp.id === 'bat') degradationRate = 0.003;
  if (comp.id === 'ely' || comp.id === 'fc') degradationRate = isOperating ? 0.01 : 0.002;

  if (updated.isFaultInjected) {
    degradationRate *= updated.isDerated ? 3.0 : 8.0;
  }

  // Update health score
  if (!updated.isTripped) {
    updated.healthScore = Math.max(0, updated.healthScore - degradationRate * dtHours * 100);
  }

  // Anomaly Z-Score synthetic vibration & temperature model
  const wear = (100 - updated.healthScore) / 10;
  const faultSpike = updated.isFaultInjected ? 4.2 : 0.0;
  const rawZ = wear * 0.4 + faultSpike + (Math.sin(Date.now() / 1000) * 0.2);
  updated.anomalyZScore = Math.max(0, rawZ);

  // Remaining Useful Life in operating hours
  if (degradationRate > 0.001) {
    updated.rulHours = Math.max(0, Math.round((updated.healthScore - 15) / (degradationRate * 10)));
  } else {
    updated.rulHours = 9999;
  }

  // Automated Edge AI Protective Derating when Z > 3.0
  if (!updated.isDerated && !updated.isTripped && updated.anomalyZScore > 3.0) {
    updated.isDerated = true;
    updated.repairTimeRemainingSec = 30; // 30 sec auto-repair or crew dispatch
  }

  // Trip threshold: if health drops below 15% and not fixed
  if (!updated.isTripped && updated.healthScore <= 15) {
    updated.isTripped = true;
    updated.isDerated = false;
  }

  // Multiplier calculation
  if (updated.isTripped) {
    updated.efficiencyMultiplier = 0.0;
  } else if (updated.isDerated) {
    updated.efficiencyMultiplier = comp.category === 'WIND' ? 0.6 : 0.7;
  } else {
    updated.efficiencyMultiplier = 1.0;
  }

  return updated;
}

/**
 * Deterministic cryptographic hash function for Blockchain Energy Blocks
 */
export function generateBlockHash(
  index: number,
  previousHash: string,
  timestampUtc: string,
  merkleRoot: string,
  greenKwh: number
): string {
  const payload = `${index}|${previousHash}|${timestampUtc}|${merkleRoot}|${greenKwh.toFixed(2)}`;
  let h1 = 0x811c9dc5, h2 = 0x5a827999, h3 = 0x6ed9eba1, h4 = 0x8f1bbcdc, h5 = 0xca62c1d6;
  for (let i = 0; i < payload.length; i++) {
    const code = payload.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ code, 0x01000193) >>> 0;
    h3 = Math.imul(h3 ^ code, 0x01000193) >>> 0;
    h4 = Math.imul(h4 ^ code, 0x01000193) >>> 0;
    h5 = Math.imul(h5 ^ code, 0x01000193) >>> 0;
  }
  const part1 = h1.toString(16).padStart(8, '0');
  const part2 = h2.toString(16).padStart(8, '0');
  const part3 = h3.toString(16).padStart(8, '0');
  const part4 = h4.toString(16).padStart(8, '0');
  const part5 = h5.toString(16).padStart(8, '0');
  const combined = `${part1}${part2}${part3}${part4}${part5}`;
  // 5 chars '0x000' + 37 chars = 42 chars total
  return `0x000${combined.slice(0, 37)}`;
}

/**
 * Satellite Link Telemetry Quality Budget
 */
export function calculateSatelliteTelemetryQuality(
  elevationDeg: number,
  cloudPercent: number,
  blizzardLevel: 'NONE' | 'LOW' | 'ELEVATED' | 'SEVERE_WHITEOUT',
  kpIndex: number
): {
  carrierToNoiseDb: number;
  uplinkMbps: number;
  downlinkMbps: number;
  latencyMs: number;
  packetLoss: number;
  status: SatelliteTelemetry['status'];
} {
  // Elevation factor (best when satellite is overhead > 45°)
  const elevFactor = Math.max(0.1, Math.sin((elevationDeg * Math.PI) / 180));
  // Blizzard snow attenuation
  let blizzardLossDb = 0;
  if (blizzardLevel === 'LOW') blizzardLossDb = 1.2;
  if (blizzardLevel === 'ELEVATED') blizzardLossDb = 3.5;
  if (blizzardLevel === 'SEVERE_WHITEOUT') blizzardLossDb = 7.0;

  // Ionospheric scintillation from aurora / geomagnetic storm
  const auroraLossDb = (kpIndex / 9) * 2.5;

  const baseCn0 = 24.0; // dB-Hz
  const actualCn0 = Math.max(9.0, baseCn0 * elevFactor - blizzardLossDb - auroraLossDb);

  const downlinkMbps = Math.max(2.0, 180.0 * (actualCn0 / baseCn0));
  const uplinkMbps = Math.max(0.8, 35.0 * (actualCn0 / baseCn0));
  const latencyMs = Math.round(24 + (1 - elevFactor) * 20 + (blizzardLevel === 'SEVERE_WHITEOUT' ? 18 : 0));
  const packetLoss = Math.min(2.5, Math.max(0.01, (baseCn0 - actualCn0) * 0.15));

  let status: SatelliteTelemetry['status'] = 'OPTIMAL_LOCK';
  if (actualCn0 < 12.0) status = 'WEATHER_ATTENUATED';
  else if (elevationDeg < 15.0) status = 'HANDOVER';

  return {
    carrierToNoiseDb: actualCn0,
    uplinkMbps,
    downlinkMbps,
    latencyMs,
    packetLoss,
    status,
  };
}
