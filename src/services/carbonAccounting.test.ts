import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCarbonEquivalencies,
  generateHistoricalOffsetSeries,
} from './carbonAccounting';

test('calculateCarbonEquivalencies computes accurate tree and fuel conversion metrics', () => {
  // Test 10,000 kg (10 metric tons) CO2 avoided
  const res = calculateCarbonEquivalencies(10000);

  assert.equal(res.co2AvoidedKg, 10000);
  assert.equal(res.co2AvoidedTons, 10);

  // Trees: 10000 / 21.8 ≈ 459 trees
  assert.ok(res.treesPlantedEquivalent >= 450 && res.treesPlantedEquivalent <= 470, 'Tree equivalent should be ~459 trees');

  // Diesel liters avoided: 10000 / 2.68 ≈ 3731 liters
  assert.ok(res.dieselLitersAvoided >= 3700 && res.dieselLitersAvoided <= 3750, 'Diesel avoided should be ~3731 L');

  // Sea ice preserved: 10 tons * 3.0 m²/ton = 30 m²
  assert.equal(res.seaIcePreservedSqM, 30.0);

  // Carbon credit valuation: 10 tons * $45 = $450
  assert.equal(res.monetaryCreditValueUsd, 450.0);
});

test('calculateCarbonEquivalencies handles zero gracefully without crashing', () => {
  const zeroRes = calculateCarbonEquivalencies(0);
  assert.equal(zeroRes.co2AvoidedKg, 0);
  assert.equal(zeroRes.co2AvoidedTons, 0);
  assert.equal(zeroRes.treesPlantedEquivalent, 0);
  assert.equal(zeroRes.dieselLitersAvoided, 0);
});

test('generateHistoricalOffsetSeries produces valid points across 7D, 30D, and 12M', () => {
  const series7D = generateHistoricalOffsetSeries('7D');
  assert.equal(series7D.length, 7, '7D should have 7 points');
  assert.ok(series7D[6].cumulativeTons > series7D[0].cumulativeTons, 'Cumulative tons should accumulate');

  const series30D = generateHistoricalOffsetSeries('30D');
  assert.equal(series30D.length, 15, '30D should have 15 points (sampled bi-daily)');

  const series12M = generateHistoricalOffsetSeries('12M');
  assert.equal(series12M.length, 12, '12M should model all 12 polar calendar months');

  // In polar night (mid-year, e.g. indices 4-7), solar should be 0 and H2 fuel cell should bridge
  const midNightMonth = series12M[5]; // May (Night)
  assert.equal(midNightMonth.solarOffsetKg, 0, 'Solar offset must be 0 during polar night');
  assert.ok(midNightMonth.h2OffsetKg > 0, 'Hydrogen fuel cell must produce offset during polar night');
});
