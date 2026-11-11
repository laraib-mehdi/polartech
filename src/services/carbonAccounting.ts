/**
 * Carbon Accounting & Environmental Equivalencies Engine
 * Scientific conversions for 100% renewable polar microgrid emissions avoidance
 */

export interface CarbonEquivalencies {
  co2AvoidedKg: number;
  co2AvoidedTons: number;
  treesPlantedEquivalent: number; // 1 tree absorbs ~21.77 kg CO2/year
  dieselLitersAvoided: number; // 1 liter arctic diesel = 2.68 kg CO2
  seaIcePreservedSqM: number; // ~3.0 m² Arctic/Antarctic sea ice preserved per metric ton CO2 (Notz & Stroeve, Science 2016)
  cleanEnergyGeneratedKwh: number; // standard 0.68 kg CO2/kWh displaced
  monetaryCreditValueUsd: number; // $45.00/metric ton voluntary carbon market high-integrity polar removal credit
  passengerFlightsAvoided: number; // ~1,200 kg CO2 per long-haul economy seat
}

export interface HistoricalCarbonPoint {
  dateLabel: string;
  timestamp: number;
  solarOffsetKg: number;
  windOffsetKg: number;
  h2OffsetKg: number;
  dailyTotalKg: number;
  cumulativeTons: number;
  equivalentTrees: number;
  renewableSharePercent: number;
  auditBlockIndex: number;
}

/**
 * Computes scientifically grounded ecological equivalencies for avoided CO2 emissions
 */
export function calculateCarbonEquivalencies(co2AvoidedKg: number): CarbonEquivalencies {
  const safeKg = Math.max(0, co2AvoidedKg);
  const tons = safeKg / 1000;

  return {
    co2AvoidedKg: safeKg,
    co2AvoidedTons: tons,
    treesPlantedEquivalent: Math.round(safeKg / 21.8), // ~21.8 kg CO2/tree/year
    dieselLitersAvoided: Math.round(safeKg / 2.68), // 2.68 kg CO2 per liter
    seaIcePreservedSqM: Number((tons * 3.0).toFixed(2)), // 3 m² sea ice per metric ton
    cleanEnergyGeneratedKwh: Math.round(safeKg / 0.68),
    monetaryCreditValueUsd: Number((tons * 45.0).toFixed(2)), // $45/t
    passengerFlightsAvoided: Number((safeKg / 1200).toFixed(1)),
  };
}

/**
 * Generates historical offset timeseries tailored to Antarctic seasonal regimes
 */
export function generateHistoricalOffsetSeries(
  timeframe: '7D' | '30D' | '12M',
  baseMultiplier: number = 1.0
): HistoricalCarbonPoint[] {
  const now = Date.now();
  const dayMs = 24 * 3600 * 1000;

  if (timeframe === '7D') {
    // 7-day high resolution series
    const points: HistoricalCarbonPoint[] = [];
    let runningCumulativeKg = 18500 * baseMultiplier;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * dayMs);
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      const solar = Math.round((140 + Math.sin(i * 1.2) * 35) * baseMultiplier);
      const wind = Math.round((110 + Math.cos(i * 0.9) * 45) * baseMultiplier);
      const h2 = Math.round((35 + Math.sin(i * 0.5) * 15) * baseMultiplier);
      const dayTotal = solar + wind + h2;
      runningCumulativeKg += dayTotal;

      points.push({
        dateLabel: label,
        timestamp: d.getTime(),
        solarOffsetKg: solar,
        windOffsetKg: wind,
        h2OffsetKg: h2,
        dailyTotalKg: dayTotal,
        cumulativeTons: Number((runningCumulativeKg / 1000).toFixed(2)),
        equivalentTrees: Math.round(runningCumulativeKg / 21.8),
        renewableSharePercent: Math.min(100, Number((96.5 + Math.sin(i) * 3.5).toFixed(1))),
        auditBlockIndex: 14200 + (6 - i),
      });
    }
    return points;
  }

  if (timeframe === '30D') {
    // 30-day series sampled every 2 days
    const points: HistoricalCarbonPoint[] = [];
    let runningCumulativeKg = 12400 * baseMultiplier;

    for (let i = 14; i >= 0; i--) {
      const d = new Date(now - i * 2 * dayMs);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const solar = Math.round((280 + Math.sin(i * 0.8) * 60) * baseMultiplier);
      const wind = Math.round((220 + Math.cos(i * 0.7) * 70) * baseMultiplier);
      const h2 = Math.round((70 + Math.sin(i * 0.4) * 25) * baseMultiplier);
      const dayTotal = solar + wind + h2;
      runningCumulativeKg += dayTotal;

      points.push({
        dateLabel: label,
        timestamp: d.getTime(),
        solarOffsetKg: solar,
        windOffsetKg: wind,
        h2OffsetKg: h2,
        dailyTotalKg: dayTotal,
        cumulativeTons: Number((runningCumulativeKg / 1000).toFixed(2)),
        equivalentTrees: Math.round(runningCumulativeKg / 21.8),
        renewableSharePercent: Math.min(100, Number((97.2 + Math.cos(i) * 2.8).toFixed(1))),
        auditBlockIndex: 14100 + (14 - i) * 7,
      });
    }
    return points;
  }

  // 12M: 12-Month seasonal polar trajectory showcasing summer solar surplus and winter hydrogen autonomy
  const monthNames = [
    'Dec (Summer)', 'Jan (Summer)', 'Feb (Autumn)', 'Mar (Autumn)',
    'Apr (Night)', 'May (Night)', 'Jun (Mid-Night)', 'Jul (Mid-Night)',
    'Aug (Sunrise)', 'Sep (Spring)', 'Oct (Spring)', 'Nov (Summer)'
  ];

  let runningCumulativeKg = 0;
  return monthNames.map((label, idx) => {
    // Polar summer (indices 0, 1, 11) have massive solar; winter (indices 4, 5, 6, 7) rely on Wind + H2 fuel cell
    const isPolarDay = idx === 0 || idx === 1 || idx === 10 || idx === 11;
    const isPolarNight = idx >= 4 && idx <= 7;

    const solar = isPolarDay
      ? Math.round(7200 * baseMultiplier)
      : isPolarNight
      ? 0
      : Math.round(2800 * baseMultiplier);

    const wind = isPolarNight
      ? Math.round(6800 * baseMultiplier) // strong winter katabatic winds
      : Math.round(4400 * baseMultiplier);

    const h2 = isPolarNight
      ? Math.round(4900 * baseMultiplier) // winter fuel cell discharge
      : Math.round(900 * baseMultiplier); // summer small dispatch

    const monthlyTotal = solar + wind + h2;
    runningCumulativeKg += monthlyTotal;

    return {
      dateLabel: label,
      timestamp: now - (11 - idx) * 30 * dayMs,
      solarOffsetKg: solar,
      windOffsetKg: wind,
      h2OffsetKg: h2,
      dailyTotalKg: monthlyTotal,
      cumulativeTons: Number((runningCumulativeKg / 1000).toFixed(2)),
      equivalentTrees: Math.round(runningCumulativeKg / 21.8),
      renewableSharePercent: isPolarNight ? 96.8 : 99.8,
      auditBlockIndex: 13000 + idx * 100,
    };
  });
}
