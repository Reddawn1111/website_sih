const crowdScore = { low: 12, moderate: 34, high: 68, critical: 92 };
const riskScore = { low: 10, moderate: 42, high: 72, critical: 95 };

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function priorityFromScore(score) {
  if (score >= 86) return "urgent";
  if (score >= 70) return "high";
  if (score >= 48) return "opportunity";
  return "monitor";
}

function priorityLabel(priority) {
  return {
    urgent: "Urgent",
    high: "High Priority",
    opportunity: "Opportunity",
    monitor: "Monitor"
  }[priority];
}

function relatedRisk(place, risks) {
  return risks.find((risk) => risk.placeId === place.id);
}

function relatedMobility(place, mobility) {
  return mobility.find((item) => item.connectedPlaceIds.includes(place.id));
}

function alternatives(place, placesWithStats) {
  return place.alternatives
    .map((id) => placesWithStats.find((candidate) => candidate.id === id))
    .filter(Boolean);
}

export function destinationHealth(place, risks, mobility) {
  const risk = relatedRisk(place, risks);
  const move = relatedMobility(place, mobility);
  const visitation = clamp(place.stat.visitCount / 160);
  const rating = clamp(place.rating * 18);
  const dwell = clamp(place.stat.averageDwellMinutes);
  const trend = clamp(50 + place.stat.trendPercent);
  const crowdPenalty = crowdScore[place.stat.crowdLevel] * 0.32;
  const riskPenalty = risk ? riskScore[risk.level] * 0.24 : 4;
  const mobilityPenalty = move ? move.pressurePercent * 0.16 : 4;
  const score = clamp((visitation + rating + dwell + trend) / 4 + 22 - crowdPenalty - riskPenalty - mobilityPenalty);
  const good = [];
  const warning = [];
  const opportunity = [];

  if (place.rating >= 4.5) good.push("High visitor satisfaction proxy");
  if (place.stat.trendPercent > 8) good.push("Growing visits");
  if (place.stat.crowdLevel === "low" || place.stat.crowdLevel === "moderate") good.push("Manageable crowd pressure");
  if (place.stat.crowdLevel === "high" || place.stat.crowdLevel === "critical") warning.push(`Peak-hour ${place.stat.crowdLevel} crowd pressure`);
  if (move && move.pressurePercent >= 70) warning.push("Tourism corridor pressure requires evaluation");
  if (risk) warning.push(`${risk.level} advisory risk intersects with tourism activity`);
  if (place.stat.visitCount < 3000 && place.rating >= 4.6) opportunity.push("High-potential under-visited destination");
  if (place.stat.averageDwellMinutes > 70) opportunity.push("Long dwell time supports facility and amenity review");
  if (!opportunity.length) opportunity.push("Continue monitoring demand and visitor mix");

  return { score, good, warning, opportunity };
}

export function buildActionCenter(placesWithStats, risks, mobility) {
  const actions = [];

  placesWithStats.forEach((place) => {
    const risk = relatedRisk(place, risks);
    const move = relatedMobility(place, mobility);
    const alt = alternatives(place, placesWithStats);
    const highestAlt = alt.sort((a, b) => b.rating - a.rating)[0];
    const volumeScore = clamp(place.stat.visitCount / 150);
    const trendScore = clamp(50 + place.stat.trendPercent);
    const confidence = place.stat.contributorCount > 150 ? "High" : place.stat.contributorCount > 60 ? "Medium" : "Low";

    if (place.stat.crowdLevel === "critical" || place.stat.crowdLevel === "high") {
      const score = clamp((crowdScore[place.stat.crowdLevel] + volumeScore + trendScore + (risk ? riskScore[risk.level] : 20)) / 4 + 12);
      actions.push({
        id: `crowd-${place.id}`,
        title: `Review peak-hour crowd management at ${place.name}`,
        location: place.name,
        category: "Crowd Management",
        priority: priorityFromScore(score),
        priorityScore: score,
        evidence: [
          `${place.stat.visitCount.toLocaleString("en-IN")} aggregated demo visits`,
          `Peak concentration: ${place.stat.peakHour}`,
          `Crowd level: ${place.stat.crowdLevel}`,
          `Visit trend: ${place.stat.trendPercent > 0 ? "+" : ""}${place.stat.trendPercent}%`
        ],
        recommendedAction: highestAlt
          ? `Promote ${highestAlt.name}, review timed-entry/crowd-routing measures and deploy temporary signage during ${place.stat.peakHour}.`
          : `Review timed-entry, crowd routing, temporary signage and visitor-capacity management during ${place.stat.peakHour}.`,
        expectedImpact: "Reduce peak crowd pressure and distribute demand across nearby destinations.",
        dataConfidence: confidence,
        fieldValidationStatus: "Requires field validation",
        scoreExplanation: `Impact ${volumeScore}/100 + crowd ${crowdScore[place.stat.crowdLevel]}/100 + trend ${trendScore}/100.`
      });
    }

    if (place.stat.visitCount < 3000 && place.rating >= 4.6) {
      const crowdedAlternative = alt.find((candidate) => candidate.stat.crowdLevel === "high" || candidate.stat.crowdLevel === "critical");
      const score = clamp(54 + place.rating * 7 + place.stat.trendPercent + (crowdedAlternative ? 12 : 0));
      actions.push({
        id: `promo-${place.id}`,
        title: `Promote ${place.name} as a hidden-gem alternative`,
        location: place.name,
        category: "Tourism Promotion",
        priority: priorityFromScore(score),
        priorityScore: score,
        evidence: [
          `Rating ${place.rating}`,
          `${place.stat.visitCount.toLocaleString("en-IN")} visits, below major destination demand`,
          `Trend ${place.stat.trendPercent > 0 ? "+" : ""}${place.stat.trendPercent}%`,
          crowdedAlternative ? `Nearby pressure: ${crowdedAlternative.name} is ${crowdedAlternative.stat.crowdLevel}` : "Nearby alternatives configured"
        ],
        recommendedAction: `Promote during ${place.stat.peakHour} and improve wayfinding/signage from nearby tourism hubs.`,
        expectedImpact: "Increase sustainable visitation and relieve pressure from overcrowded attractions.",
        dataConfidence: confidence,
        fieldValidationStatus: "Requires field validation",
        scoreExplanation: `Rating strength + under-visited status + trend + nearby pressure.`
      });
    }

    if (move && move.pressurePercent >= 70) {
      const score = clamp((move.pressurePercent + volumeScore + crowdScore[place.stat.crowdLevel]) / 3 + 8);
      actions.push({
        id: `infra-${place.id}`,
        title: `Evaluate tourism infrastructure around ${place.name}`,
        location: place.name,
        category: "Infrastructure",
        priority: priorityFromScore(score),
        priorityScore: score,
        evidence: [
          `${move.corridorName} pressure: ${move.pressurePercent}%`,
          `Peak movement window: ${move.peakWindow}`,
          `Destination crowd level: ${place.stat.crowdLevel}`,
          `${place.stat.visitCount.toLocaleString("en-IN")} aggregated demo visits`
        ],
        recommendedAction: "Consider evaluating road-capacity management, pedestrian crossings, lighting, signage, parking controls or shuttle/public-transport connectivity.",
        expectedImpact: "Improve visitor flow, reduce peak-hour friction and support safer tourism access.",
        dataConfidence: confidence,
        fieldValidationStatus: "Requires field validation",
        scoreExplanation: `Movement pressure ${move.pressurePercent}/100 + visitor volume ${volumeScore}/100 + crowd pressure.`
      });
    }

    if (place.stat.visitCount > 7000 && place.stat.averageDwellMinutes > 60) {
      const score = clamp(50 + volumeScore * 0.25 + place.stat.averageDwellMinutes * 0.25 + crowdScore[place.stat.crowdLevel] * 0.2);
      actions.push({
        id: `facility-${place.id}`,
        title: `Review visitor facilities at ${place.name}`,
        location: place.name,
        category: "Facility Improvement",
        priority: priorityFromScore(score),
        priorityScore: score,
        evidence: [
          `${place.stat.visitCount.toLocaleString("en-IN")} aggregated demo visits`,
          `Average dwell: ${place.stat.averageDwellMinutes} minutes`,
          `Crowd level: ${place.stat.crowdLevel}`
        ],
        recommendedAction: "Evaluate toilets, drinking water, shade, seating, accessibility, waste-management and visitor amenity capacity.",
        expectedImpact: "Improve visitor comfort and reduce operational stress at popular destinations.",
        dataConfidence: confidence,
        fieldValidationStatus: "Requires field validation",
        scoreExplanation: "Visitor volume + long dwell time + crowd pressure suggest an amenity review."
      });
    }

    if (risk && (place.stat.crowdLevel === "high" || place.stat.crowdLevel === "critical" || risk.level === "high")) {
      const score = clamp((riskScore[risk.level] + crowdScore[place.stat.crowdLevel] + volumeScore) / 3 + 10);
      actions.push({
        id: `risk-${place.id}`,
        title: `Coordinate tourism safety advisory for ${place.name}`,
        location: place.name,
        category: "Safety & Risk",
        priority: priorityFromScore(score),
        priorityScore: score,
        evidence: [
          `Risk level: ${risk.level}`,
          risk.reason,
          `Affected activity: ${risk.affectedActivity}`,
          `Crowd level: ${place.stat.crowdLevel}`
        ],
        recommendedAction: risk.suggestedResponse,
        expectedImpact: "Reduce visitor exposure to advisory risk and improve response coordination.",
        dataConfidence: confidence,
        fieldValidationStatus: "Requires field validation",
        scoreExplanation: `Risk ${riskScore[risk.level]}/100 + crowd ${crowdScore[place.stat.crowdLevel]}/100 + visitor volume.`
      });
    }
  });

  return actions.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function groupedActions(actions) {
  return ["urgent", "high", "opportunity", "monitor"].map((priority) => ({
    priority,
    label: priorityLabel(priority),
    actions: actions.filter((action) => action.priority === priority)
  }));
}

export function simulateImpact(scenario, placesWithStats) {
  if (!placesWithStats.length) {
    return {
      scenarioLabel: "No matching aggregate",
      impactType: "Adjust filters",
      currentPrimary: 0,
      projectedPrimary: 0,
      currentAlternative: 0,
      projectedAlternative: 0,
      primaryName: "No destination",
      alternativeName: "No alternative",
      shiftedVisits: 0
    };
  }
  const overloaded = [...placesWithStats].sort((a, b) => crowdScore[b.stat.crowdLevel] - crowdScore[a.stat.crowdLevel] || b.stat.visitCount - a.stat.visitCount)[0];
  const alternative = placesWithStats.find((place) => overloaded.alternatives.includes(place.id)) ||
    [...placesWithStats].sort((a, b) => a.stat.visitCount - b.stat.visitCount)[0];

  const factors = {
    promote: { label: "Promote alternative destination", shift: 0.14, impact: "Demand distribution" },
    parking: { label: "Increase parking", shift: 0.07, impact: "Lower parking pressure" },
    shuttle: { label: "Add shuttle", shift: 0.1, impact: "Improved access and corridor relief" },
    signage: { label: "Improve signage", shift: 0.06, impact: "Better visitor routing" },
    redirect: { label: "Redirect visitors", shift: 0.16, impact: "Short-term crowd pressure reduction" },
    pedestrian: { label: "Improve pedestrian infrastructure", shift: 0.08, impact: "Safer walking flow" }
  };

  const selected = factors[scenario] || factors.promote;
  const shiftedVisits = Math.round(overloaded.stat.visitCount * selected.shift);

  return {
    scenarioLabel: selected.label,
    impactType: selected.impact,
    currentPrimary: overloaded.stat.visitCount,
    projectedPrimary: overloaded.stat.visitCount - shiftedVisits,
    currentAlternative: alternative.stat.visitCount,
    projectedAlternative: alternative.stat.visitCount + shiftedVisits,
    primaryName: overloaded.name,
    alternativeName: alternative.name,
    shiftedVisits
  };
}
