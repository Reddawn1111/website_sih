const PRESSURE_LEVELS = [
  [85, "critical"],
  [70, "high"],
  [45, "moderate"],
  [0, "low"]
];

function pressureLevel(value) {
  return PRESSURE_LEVELS.find(([threshold]) => value >= threshold)[1];
}

export function deriveMobilityMetrics(mobilityInsights) {
  return mobilityInsights.map((item) => {
    const delayPercent = item.baselineTravelMinutes
      ? Math.round(((item.averageTravelMinutes - item.baselineTravelMinutes) / item.baselineTravelMinutes) * 100)
      : null;
    const roadPressurePercent = Math.round((item.pressurePercent + item.corridorConcentrationPercent + (delayPercent || 0)) / 3);
    const transitPressurePercent = item.transitConcentrationPercent
      ? Math.round((item.transitConcentrationPercent + (item.averageStopDwellMinutes || 0) * 2) / 2)
      : null;

    return {
      ...item,
      delayPercent,
      roadPressurePercent,
      roadPressureLevel: pressureLevel(roadPressurePercent),
      transitPressurePercent,
      transitPressureLevel: transitPressurePercent === null ? null : pressureLevel(transitPressurePercent),
      inferredSignals: [
        delayPercent !== null && delayPercent >= 18 ? "Potential road bottleneck" : null,
        item.tripCount >= 5000 && item.averageTravelMinutes >= 35 ? "Potential slow corridor" : null,
        transitPressurePercent !== null && transitPressurePercent >= 55 ? "Potential transit pressure" : null,
        item.averageStopDwellMinutes >= 20 ? "Observed long dwell at transition zone" : null
      ].filter(Boolean)
    };
  });
}

export function mobilityPressureSummary(mobilityInsights) {
  if (!mobilityInsights.length) return null;
  const topCorridor = [...mobilityInsights].sort((a, b) => b.roadPressurePercent - a.roadPressurePercent)[0];
  const transit = [...mobilityInsights].filter((item) => item.transitPressurePercent !== null)
    .sort((a, b) => b.transitPressurePercent - a.transitPressurePercent)[0];
  const delays = mobilityInsights.filter((item) => item.delayPercent !== null);
  const averageDelay = delays.length
    ? Math.round(delays.reduce((total, item) => total + item.delayPercent, 0) / delays.length)
    : 0;
  const visitorConcentration = topCorridor.corridorConcentrationPercent >= 75
    ? "HIGH"
    : topCorridor.corridorConcentrationPercent >= 50
      ? "MODERATE"
      : "LOW";

  return {
    roadPressure: topCorridor.roadPressureLevel,
    transitPressure: transit?.transitPressureLevel || "Insufficient sample size",
    visitorConcentration,
    peakWindow: topCorridor.peakWindow,
    averageDelay,
    topCorridor: `${topCorridor.originZone} → ${topCorridor.destinationZone}`,
    topCorridorId: topCorridor.id
  };
}

export function mobilityForDestination(placeId, mobilityInsights) {
  return mobilityInsights
    .filter((item) => item.connectedPlaceIds.includes(placeId))
    .sort((a, b) => b.roadPressurePercent - a.roadPressurePercent)[0];
}

export function whyThisMatters(place, mobilityInsights) {
  const movement = mobilityForDestination(place.id, mobilityInsights);
  if (!movement) {
    return `${place.stat.visitCount.toLocaleString("en-IN")} aggregated visits peak during ${place.stat.peakHour}; continue monitoring visitor demand and dwell time.`;
  }
  const delay = movement.delayPercent === null ? "" : ` Travel delay is ${movement.delayPercent > 0 ? "+" : ""}${movement.delayPercent}% against baseline.`;
  return `${place.stat.visitCount.toLocaleString("en-IN")} aggregated visits peak during ${place.stat.peakHour} with ${place.stat.averageDwellMinutes} minutes average dwell. Movement concentrates on ${movement.corridorName} in the same window, indicating a potential crowd and mobility pressure period.${delay}`;
}
