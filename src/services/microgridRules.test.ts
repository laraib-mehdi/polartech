import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSunElevation,
  calculateSolarPvOutput,
  calculateSingleWindTurbineKw,
  executeDispatch,
  updateComponentHealth,
  generateBlockHash,
  calculateSatelliteTelemetryQuality,
} from './microgridRules';
import { GridComponentHealth } from '../types/microgrid';

test('calculateSunElevation respects polar summer and polar night regimes', () => {
  // Polar summer: sun remains above horizon 24/7
  const summerNoon = calculateSunElevation(12, 'SUMMER_POLAR_DAY');
  const summerMidnight = calculateSunElevation(0, 'SUMMER_POLAR_DAY');
  assert.ok(summerNoon > 20, 'Summer noon should have high sun elevation');
  assert.ok(summerMidnight > 0, 'Summer midnight sun should stay above horizon');

  // Polar night: sun stays below horizon 24/7
  const winterNoon = calculateSunElevation(12, 'WINTER_POLAR_NIGHT');
  const winterMidnight = calculateSunElevation(0, 'WINTER_POLAR_NIGHT');
  assert.ok(winterNoon < 0, 'Winter noon should be below horizon');
  assert.ok(winterMidnight < 0, 'Winter midnight should be deeply below horizon');
});

test('calculateSolarPvOutput applies cold temperature and snow albedo boost', () => {
  // With positive sun elevation, PV should generate power
  const pvOutput = calculateSolarPvOutput(25, 20, -15, 1.0);
  assert.ok(pvOutput > 50, 'PV output at 25 deg elevation should exceed 50 kW');

  // With sun below horizon, output must be zero
  const zeroOutput = calculateSolarPvOutput(-5, 0, -10, 1.0);
  assert.equal(zeroOutput, 0, 'PV output must be 0 when sun is below horizon');
});

test('calculateSingleWindTurbineKw models cut-in, rated, and cut-out speeds', () => {
  // Below cut-in (3 m/s)
  assert.equal(calculateSingleWindTurbineKw(2.0, -10), 0);

  // Normal operating range (8 m/s)
  const kwMid = calculateSingleWindTurbineKw(8.0, -10);
  assert.ok(kwMid > 5 && kwMid < 60, 'Wind turbine output should be within operating range');

  // Rated wind speed (14 m/s)
  const kwRated = calculateSingleWindTurbineKw(14.0, -10);
  assert.ok(kwRated >= 58, 'Turbine should produce near rated capacity at 14 m/s');

  // Storm cut-out (> 25 m/s)
  assert.equal(calculateSingleWindTurbineKw(27.0, -10), 0, 'Turbine must cut out above 25 m/s');
});

test('executeDispatch favors green hydrogen and battery over diesel under surplus and deficit', () => {
  // Test 1: High renewable surplus -> charges battery, routes to electrolyzer, zero diesel
  const surplusResult = executeDispatch({
    pvPowerKw: 120,
    windPowerKw: 140,
    windUnitsKw: [45, 45, 50],
    stationLoadKw: 110,
    dtHours: 0.1,
    currentSoc: 0.7,
    currentH2Kg: 150,
    isAiEnabled: true,
    isHydrogenSystemEnabled: true,
    forecastDeficit3hKwh: 0,
    forecastRenewableNext3hKw: 180,
    forecastLoadNext3hKw: 110,
    availableDieselCapacityKw: 200,
    availableBatteryPowerKw: 200,
    availableElectrolyzerKw: 100,
    availableFuelCellKw: 80,
  });

  assert.equal(surplusResult.dispatch.dieselPowerKw, 0, 'Diesel must be 0 under surplus');
  assert.ok(surplusResult.dispatch.batteryPowerKw < 0, 'Battery should be charging (negative kW)');
  assert.ok(surplusResult.newH2Kg >= 150, 'Hydrogen storage should increase or stay level');

  // Test 2: Deficit bridged by H2 Fuel Cell + Battery without diesel
  const greenBridgeResult = executeDispatch({
    pvPowerKw: 10,
    windPowerKw: 20,
    windUnitsKw: [10, 5, 5],
    stationLoadKw: 90,
    dtHours: 0.1,
    currentSoc: 0.65,
    currentH2Kg: 200,
    isAiEnabled: true,
    isHydrogenSystemEnabled: true,
    forecastDeficit3hKwh: 20,
    forecastRenewableNext3hKw: 40,
    forecastLoadNext3hKw: 90,
    availableDieselCapacityKw: 200,
    availableBatteryPowerKw: 200,
    availableElectrolyzerKw: 100,
    availableFuelCellKw: 80,
  });

  assert.equal(greenBridgeResult.dispatch.dieselPowerKw, 0, 'AI should avoid diesel when battery & H2 are available');
  assert.ok(greenBridgeResult.dispatch.batteryPowerKw > 0, 'Battery should discharge to cover load');
});

test('updateComponentHealth detects anomaly and auto-derates', () => {
  const initialComp: GridComponentHealth = {
    id: 'wt1',
    name: 'Wind Turbine 2',
    category: 'WIND',
    healthScore: 95,
    vibrationMmS: 1.2,
    temperatureC: -8,
    anomalyZScore: 0.5,
    isFaultInjected: true, // inject fault
    isDerated: false,
    isTripped: false,
    rulHours: 1200,
    repairTimeRemainingSec: 0,
    efficiencyMultiplier: 1.0,
  };

  const deratedComp = updateComponentHealth(initialComp, 0.5, true);
  assert.ok(deratedComp.anomalyZScore > 3.0, 'Injected fault should trigger anomaly Z-score > 3');
  assert.equal(deratedComp.isDerated, true, 'Component should be auto-derated by AI protection');
  assert.ok(deratedComp.efficiencyMultiplier < 1.0, 'Derated component should reduce efficiency');
});

test('generateBlockHash generates deterministic hash format', () => {
  const hash = generateBlockHash(1, '0x000abc', '2026-11-10T19:00:00Z', '0xmerkle123', 420.5);
  assert.ok(hash.startsWith('0x000'), 'Hash should start with valid prefix');
  assert.equal(hash.length, 42, 'Hash should have standard length');
});

test('calculateSatelliteTelemetryQuality calculates link budget and attenuation', () => {
  const clearSky = calculateSatelliteTelemetryQuality(60, 10, 'NONE', 1);
  assert.equal(clearSky.status, 'OPTIMAL_LOCK');
  assert.ok(clearSky.downlinkMbps > 100);

  const blizzard = calculateSatelliteTelemetryQuality(20, 95, 'SEVERE_WHITEOUT', 6);
  assert.ok(blizzard.carrierToNoiseDb < clearSky.carrierToNoiseDb, 'Blizzard must attenuate signal');
});
