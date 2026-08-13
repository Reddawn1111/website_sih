import { canDisplayAggregate } from "./privacyService.js";

const crowdRank = { low: 1, moderate: 2, high: 3, critical: 4 };

export function joinPlacesWithStats(places, stats) {
  return places.map((place) => {
    const stat = stats.find((item) => item.placeId === place.id);
    return { ...place, stat };
  }).filter((place) => place.stat);
}

export function kpis(placesWithStats, riskSignals) {
  const visible = placesWithStats.filter((place) => canDisplayAggregate(place.stat));
  const totalVisits = visible.reduce((sum, place) => sum + place.stat.visitCount, 0);
  const travellers = visible.reduce((sum, place) => sum + place.stat.contributorCount, 0);
  const top = [...visible].sort((a, b) => b.stat.visitCount - a.stat.visitCount)[0];
  const dwell = Math.round(visible.reduce((sum, place) => sum + place.stat.averageDwellMinutes, 0) / visible.length);
  const pressure = [...visible].sort((a, b) => crowdRank[b.stat.crowdLevel] - crowdRank[a.stat.crowdLevel])[0];
  return [
    { label: "Active consenting travellers", value: travellers.toLocaleString("en-IN"), delta: "Aggregated sample, demo" },
    { label: "Total visits", value: totalVisits.toLocaleString("en-IN"), delta: "+14% week over week" },
    { label: "Most visited destination", value: top.name, delta: `${top.stat.visitCount.toLocaleString("en-IN")} visits` },
    { label: "Average dwell time", value: `${dwell} min`, delta: "Across displayed aggregates" },
    { label: "Crowd pressure", value: pressure.stat.crowdLevel.toUpperCase(), delta: pressure.name, tone: pressure.stat.crowdLevel },
    { label: "Safety/risk alerts", value: riskSignals.length, delta: "Advisory demo insights", tone: "high" }
  ];
}

export function keyInsights(placesWithStats, risks, mobility) {
  const fastGrowing = [...placesWithStats].sort((a, b) => b.stat.trendPercent - a.stat.trendPercent)[0];
  const hiddenGem = tourismOpportunities(placesWithStats)[0];
  const critical = placesWithStats.find((place) => place.stat.crowdLevel === "critical");
  const corridor = [...mobility].sort((a, b) => b.pressurePercent - a.pressurePercent)[0];
  const risk = risks.find((item) => item.level === "high");
  return [
    `${critical.name} is experiencing critical crowd pressure during ${critical.stat.peakHour}.`,
    `${fastGrowing.name} visits increased ${fastGrowing.stat.trendPercent}% this week.`,
    `${hiddenGem.name} has high ratings but low visitation: strong promotion opportunity.`,
    `${corridor.corridorName} shows recurring ${corridor.peakWindow} mobility pressure.`,
    `${placesWithStats.find((place) => place.id === risk.placeId).name} has elevated advisory risk: ${risk.reason}.`
  ];
}

export function destinationRecommendation(place) {
  if (place.stat.crowdLevel === "critical" || place.stat.crowdLevel === "high") {
    return `Promote nearby alternatives during ${place.stat.peakHour} and prepare crowd management support.`;
  }
  if (place.stat.visitCount < 3000 && place.rating >= 4.6) {
    return "Promote as a hidden gem and package with nearby high-pressure destinations.";
  }
  if (place.stat.trendPercent < 0) {
    return "Investigate access, awareness and visitor experience barriers.";
  }
  return "Maintain monitoring and tune tourism messaging by peak period.";
}

export function tourismOpportunities(placesWithStats) {
  return placesWithStats
    .map((place) => {
      const ratingScore = place.rating * 18;
      const underVisitScore = Math.max(0, 100 - place.stat.visitCount / 140);
      const dwellScore = Math.min(100, place.stat.averageDwellMinutes);
      const pressureScore = place.stat.crowdLevel === "low" ? 18 : place.stat.crowdLevel === "moderate" ? 10 : -12;
      const trendScore = Math.max(0, place.stat.trendPercent);
      const opportunityScore = Math.round((ratingScore + underVisitScore + dwellScore + pressureScore + trendScore) / 3);
      return { ...place, opportunityScore };
    })
    .sort((a, b) => b.opportunityScore - a.opportunityScore);
}

export function categoryDistribution(placesWithStats) {
  const totals = {};
  placesWithStats.forEach((place) => {
    totals[place.category] = (totals[place.category] || 0) + place.stat.visitCount;
  });
  return Object.entries(totals).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}
