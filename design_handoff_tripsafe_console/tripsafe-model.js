// TripSafe intelligence model — ported from website_sih/src (demoData + services)
const MIN_AGG = 5;

export const places = [
  { id: "central-heritage", name: "Central Heritage District", region: "Bengaluru", category: "Heritage", lat: 12.9716, lng: 77.5946, rating: 4.6, capacity: 14000, alternatives: ["cubbon-park", "kr-market"] },
  { id: "church-street", name: "Church Street Entertainment Mile", region: "Bengaluru", category: "Entertainment", lat: 12.975, lng: 77.604, rating: 4.5, capacity: 9000, alternatives: ["indiranagar-food", "cubbon-park"] },
  { id: "cubbon-park", name: "Cubbon Park", region: "Bengaluru", category: "Park", lat: 12.9763, lng: 77.5929, rating: 4.7, capacity: 18000, alternatives: ["lalbagh"] },
  { id: "kr-market", name: "KR Market Heritage Market", region: "Bengaluru", category: "Market", lat: 12.9636, lng: 77.5769, rating: 4.3, capacity: 11000, alternatives: ["central-heritage"] },
  { id: "lalbagh", name: "Lalbagh Botanical Garden", region: "Bengaluru", category: "Park", lat: 12.9507, lng: 77.5848, rating: 4.7, capacity: 17000, alternatives: ["cubbon-park"] },
  { id: "indiranagar-food", name: "Indiranagar Food & Cafe Cluster", region: "Bengaluru", category: "Restaurant", lat: 12.9784, lng: 77.6408, rating: 4.5, capacity: 8000, alternatives: ["church-street"] },
  { id: "panambur-beach", name: "Panambur Beach Zone", region: "Coastal Karnataka", category: "Beach", lat: 12.9373, lng: 74.8024, rating: 4.4, capacity: 12000, alternatives: ["tannirbhavi-beach", "lake-viewpoint"] },
  { id: "tannirbhavi-beach", name: "Tannirbhavi Beach", region: "Coastal Karnataka", category: "Beach", lat: 12.9001, lng: 74.818, rating: 4.5, capacity: 8500, alternatives: ["panambur-beach"] },
  { id: "lake-viewpoint", name: "Lake Viewpoint", region: "Coastal Karnataka", category: "Viewpoint", lat: 13.008, lng: 74.793, rating: 4.7, capacity: 5200, alternatives: ["panambur-beach"] },
  { id: "coastal-fort", name: "Coastal Fort Heritage Site", region: "Coastal Karnataka", category: "Heritage", lat: 13.0827, lng: 74.743, rating: 4.6, capacity: 6200, alternatives: ["lake-viewpoint"] },
  { id: "western-ghat-view", name: "Western Ghat Viewpoint", region: "Hill Corridor", category: "Viewpoint", lat: 13.301, lng: 75.254, rating: 4.8, capacity: 6800, alternatives: ["coffee-estate-trail"] },
  { id: "coffee-estate-trail", name: "Coffee Estate Trail", region: "Hill Corridor", category: "Nature", lat: 13.317, lng: 75.773, rating: 4.7, capacity: 5000, alternatives: ["western-ghat-view"] }
];

export const stats = [
  ["central-heritage", 12420, 54, "5-8 PM", "high", 18, 21, 4.4, 216, "Heritage walks"],
  ["church-street", 10980, 88, "7-10 PM", "critical", 14, 34, 4.2, 180, "Dining and nightlife"],
  ["cubbon-park", 7680, 62, "8-11 AM", "moderate", 8, 29, 4.6, 132, "Recreation"],
  ["kr-market", 6410, 42, "10 AM-1 PM", "moderate", -4, 18, 4.1, 109, "Market visits"],
  ["lalbagh", 7210, 71, "7-10 AM", "moderate", 5, 25, 4.6, 122, "Garden visits"],
  ["indiranagar-food", 8370, 79, "8-11 PM", "high", 11, 31, 4.3, 140, "Dining and cafes"],
  ["panambur-beach", 13140, 73, "5-8 PM", "critical", 22, 19, 4.0, 210, "Beach recreation"],
  ["tannirbhavi-beach", 4980, 67, "4-7 PM", "moderate", 9, 15, 4.5, 87, "Beach recreation"],
  ["lake-viewpoint", 1480, 59, "4-6 PM", "low", 17, 9, 4.7, 34, "Scenic viewing"],
  ["coastal-fort", 2860, 52, "11 AM-2 PM", "low", 12, 13, 4.6, 44, "Heritage visits"],
  ["western-ghat-view", 6920, 61, "3-6 PM", "high", 16, 17, 4.5, 112, "Scenic viewing"],
  ["coffee-estate-trail", 1720, 93, "9 AM-12 PM", "low", 19, 10, 4.8, 38, "Nature trail visits"]
].map(([placeId, visitCount, averageDwellMinutes, peakHour, crowdLevel, trendPercent, repeatVisitPercent, satisfactionProxy, contributorCount, dominantActivity]) => ({
  placeId, date: "2026-08-13", visitCount, averageDwellMinutes, peakHour, crowdLevel, trendPercent, repeatVisitPercent, satisfactionProxy, contributorCount, dominantActivity
}));

export const visitsOverTime = [["Mon", 31200], ["Tue", 33800], ["Wed", 36100], ["Thu", 38900], ["Fri", 45100], ["Sat", 58500], ["Sun", 54200]];
export const hourlyCurve = [9, 12, 18, 26, 35, 42, 51, 67, 82, 91, 88, 73, 56, 43, 31, 22, 15, 11, 8, 6, 5, 4, 4, 5];

export const riskSignals = [
  { id: "risk-1", placeId: "panambur-beach", level: "high", reason: "Heavy rainfall forecast plus high visitor concentration", affectedActivity: "Evening beach visits", suggestedResponse: "Redirect visitors toward inland attractions and show advisory notices." },
  { id: "risk-2", placeId: "western-ghat-view", level: "moderate", reason: "Landslide-prone corridor near viewpoint access road", affectedActivity: "Hill viewpoint travel", suggestedResponse: "Promote earlier return windows and publish route caution." },
  { id: "risk-3", placeId: "church-street", level: "high", reason: "Critical late-evening crowd pressure in entertainment cluster", affectedActivity: "Dining and nightlife", suggestedResponse: "Increase crowd marshals and promote nearby distributed food streets." }
];

export const mobilityInsights = [
  { id: "mob-1", corridorName: "Bengaluru CBD → Church Street", originZone: "Central Heritage District", destinationZone: "Church Street Entertainment Mile", connectedPlaceIds: ["central-heritage", "church-street"], tripCount: 8420, averageTravelMinutes: 32, baselineTravelMinutes: 24, averageStopDwellMinutes: 22, corridorConcentrationPercent: 76, transitConcentrationPercent: 68, privateVehiclePercent: 54, publicTransportPercent: 35, pressurePercent: 82, peakWindow: "6-10 PM", transportMode: "Mixed road and transit", confidence: "Medium", recommendation: "Observed demand relative to movement indicators suggests corridor pressure; evaluate pedestrian holding areas, wayfinding and last-mile transit support." },
  { id: "mob-2", corridorName: "Coastal Highway → Panambur Beach Zone", originZone: "Coastal Highway", destinationZone: "Panambur Beach Zone", connectedPlaceIds: ["panambur-beach", "tannirbhavi-beach"], tripCount: 9180, averageTravelMinutes: 39, baselineTravelMinutes: 29, averageStopDwellMinutes: 16, corridorConcentrationPercent: 82, transitConcentrationPercent: 38, privateVehiclePercent: 63, publicTransportPercent: 26, pressurePercent: 88, peakWindow: "4-8 PM", transportMode: "Road access", confidence: "Medium", recommendation: "Observed peak road demand and travel delay suggest an access constraint; evaluate parking guidance, park-and-ride and pedestrian safety measures." },
  { id: "mob-3", corridorName: "Hill Access Road → Western Ghat Viewpoint", originZone: "Hill Access Road", destinationZone: "Western Ghat Viewpoint", connectedPlaceIds: ["western-ghat-view", "coffee-estate-trail"], tripCount: 5160, averageTravelMinutes: 43, baselineTravelMinutes: 35, averageStopDwellMinutes: 14, corridorConcentrationPercent: 71, transitConcentrationPercent: 24, privateVehiclePercent: 71, publicTransportPercent: 18, pressurePercent: 73, peakWindow: "3-6 PM", transportMode: "Private vehicle dominant", confidence: "Low", recommendation: "Observed movement concentration suggests a road and parking pressure window; validate capacity, signal timing and alternate return routing in the field." }
];

export const recommendations = [
  { id: "rec-1", priority: "high", placeId: "panambur-beach", problem: "Beach Zone has evening crowd concentration.", evidence: "68% of daily visits occur between 5-8 PM and crowd pressure is critical.", action: "Promote Tannirbhavi Beach and Lake Viewpoint during the peak window.", objective: "Distribute tourism demand." },
  { id: "rec-2", priority: "high", placeId: "church-street", problem: "Entertainment cluster reaches critical late-evening pressure.", evidence: "Peak period is 7-10 PM with rising visits and high repeat visitation.", action: "Coordinate pedestrian management and promote Indiranagar overflow options.", objective: "Reduce crowding while preserving visitor experience." },
  { id: "rec-3", priority: "medium", placeId: "lake-viewpoint", problem: "High-rated viewpoint is under-visited.", evidence: "Rating 4.7, low crowd pressure, and +17% trend from a small base.", action: "Promote as a hidden gem alternative to the overcrowded beach viewpoint circuit.", objective: "Grow sustainable tourism in high-potential areas." },
  { id: "rec-4", priority: "medium", placeId: "western-ghat-view", problem: "Hill viewpoint corridor shows recurring mobility pressure.", evidence: "Movement corridor pressure is 73% during 3-6 PM.", action: "Publish return-window nudges and improve parking management.", objective: "Lower corridor stress and improve safety." }
];

const crowdRank = { low: 1, moderate: 2, high: 3, critical: 4 };
const crowdScore = { low: 12, moderate: 34, high: 68, critical: 92 };
const riskScore = { low: 10, moderate: 42, high: 72, critical: 95 };
const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(v)));
const n = (v) => Number(v).toLocaleString("en-IN");
const pressureLevel = (v) => (v >= 85 ? "critical" : v >= 70 ? "high" : v >= 45 ? "moderate" : "low");
const priorityFromScore = (s) => (s >= 86 ? "urgent" : s >= 70 ? "high" : s >= 48 ? "opportunity" : "monitor");
const priorityLabel = { urgent: "Urgent", high: "High priority", opportunity: "Opportunity", monitor: "Monitor" };

export function joinPlaces() {
  return places.map((p) => ({ ...p, stat: stats.find((s) => s.placeId === p.id) })).filter((p) => p.stat);
}

export function deriveMobility() {
  return mobilityInsights.map((item) => {
    const delayPercent = Math.round(((item.averageTravelMinutes - item.baselineTravelMinutes) / item.baselineTravelMinutes) * 100);
    const roadPressurePercent = Math.round((item.pressurePercent + item.corridorConcentrationPercent + delayPercent) / 3);
    const transitPressurePercent = item.transitConcentrationPercent ? Math.round((item.transitConcentrationPercent + item.averageStopDwellMinutes * 2) / 2) : null;
    return {
      ...item, delayPercent, roadPressurePercent, roadPressureLevel: pressureLevel(roadPressurePercent),
      transitPressurePercent, transitPressureLevel: transitPressurePercent === null ? null : pressureLevel(transitPressurePercent),
      inferredSignals: [
        delayPercent >= 18 ? "Road bottleneck" : null,
        item.tripCount >= 5000 && item.averageTravelMinutes >= 35 ? "Slow corridor" : null,
        transitPressurePercent !== null && transitPressurePercent >= 55 ? "Transit pressure" : null,
        item.averageStopDwellMinutes >= 20 ? "Long dwell at transition zone" : null
      ].filter(Boolean)
    };
  });
}

export function mobilitySummary(mob) {
  const top = [...mob].sort((a, b) => b.roadPressurePercent - a.roadPressurePercent)[0];
  const transit = [...mob].filter((m) => m.transitPressurePercent !== null).sort((a, b) => b.transitPressurePercent - a.transitPressurePercent)[0];
  const delays = mob.filter((m) => m.delayPercent !== null);
  return {
    roadPressure: top.roadPressureLevel,
    transitPressure: transit ? transit.transitPressureLevel : "insufficient",
    visitorConcentration: top.corridorConcentrationPercent >= 75 ? "HIGH" : top.corridorConcentrationPercent >= 50 ? "MODERATE" : "LOW",
    peakWindow: top.peakWindow,
    averageDelay: Math.round(delays.reduce((t, m) => t + m.delayPercent, 0) / delays.length),
    topCorridor: `${top.originZone} → ${top.destinationZone}`
  };
}

export function kpis(pws, risks) {
  const visible = pws.filter((p) => p.stat.contributorCount >= MIN_AGG);
  const totalVisits = visible.reduce((s, p) => s + p.stat.visitCount, 0);
  const travellers = visible.reduce((s, p) => s + p.stat.contributorCount, 0);
  const top = [...visible].sort((a, b) => b.stat.visitCount - a.stat.visitCount)[0];
  const dwell = Math.round(visible.reduce((s, p) => s + p.stat.averageDwellMinutes, 0) / visible.length);
  const pressure = [...visible].sort((a, b) => crowdRank[b.stat.crowdLevel] - crowdRank[a.stat.crowdLevel])[0];
  return [
    { label: "Consenting travellers", value: n(travellers), delta: "Aggregated sample", tone: "" },
    { label: "Total visits", value: n(totalVisits), delta: "+14% week over week", tone: "" },
    { label: "Average dwell", value: `${dwell} min`, delta: "Across displayed aggregates", tone: "" },
    { label: "Peak crowd pressure", value: pressure.stat.crowdLevel.toUpperCase(), delta: pressure.name, tone: pressure.stat.crowdLevel },
    { label: "Most visited", value: top.name, delta: `${n(top.stat.visitCount)} visits`, tone: "", small: true },
    { label: "Active advisories", value: String(risks.length), delta: "Two high, one moderate", tone: "high" }
  ];
}

export function keyInsights(pws, risks, mob) {
  const fast = [...pws].sort((a, b) => b.stat.trendPercent - a.stat.trendPercent)[0];
  const gem = opportunities(pws)[0];
  const critical = pws.find((p) => p.stat.crowdLevel === "critical") || pws[0];
  const corridor = [...mob].sort((a, b) => b.pressurePercent - a.pressurePercent)[0];
  const risk = risks.find((r) => r.level === "high");
  const out = [
    { tag: "CROWD", text: `${critical.name} is at critical crowd pressure during ${critical.stat.peakHour}.` },
    { tag: "GROWTH", text: `${fast.name} visits increased ${fast.stat.trendPercent}% this week.` },
    { tag: "OPPORTUNITY", text: `${gem.name} holds high ratings with low visitation — promotion candidate.` },
    { tag: "MOBILITY", text: `${corridor.corridorName} shows recurring ${corridor.peakWindow} pressure.` }
  ];
  if (risk) out.push({ tag: "ADVISORY", text: `${pws.find((p) => p.id === risk.placeId).name}: ${risk.reason}.` });
  return out;
}

export function opportunities(pws) {
  return pws.map((p) => {
    const score = Math.round((p.rating * 18 + Math.max(0, 100 - p.stat.visitCount / 140) + Math.min(100, p.stat.averageDwellMinutes) +
      (p.stat.crowdLevel === "low" ? 18 : p.stat.crowdLevel === "moderate" ? 10 : -12) + Math.max(0, p.stat.trendPercent)) / 3);
    return { ...p, opportunityScore: score };
  }).sort((a, b) => b.opportunityScore - a.opportunityScore);
}

export function categoryDistribution(pws) {
  const t = {};
  pws.forEach((p) => { t[p.category] = (t[p.category] || 0) + p.stat.visitCount; });
  return Object.entries(t).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

export function destinationRecommendation(p) {
  if (p.stat.crowdLevel === "critical" || p.stat.crowdLevel === "high") return `Promote nearby alternatives during ${p.stat.peakHour} and prepare crowd management support.`;
  if (p.stat.visitCount < 3000 && p.rating >= 4.6) return "Promote as a hidden gem and package with nearby high-pressure destinations.";
  if (p.stat.trendPercent < 0) return "Investigate access, awareness and visitor experience barriers.";
  return "Maintain monitoring and tune tourism messaging by peak period.";
}

export function destinationHealth(place, risks, mob) {
  const risk = risks.find((r) => r.placeId === place.id);
  const move = mob.filter((m) => m.connectedPlaceIds.includes(place.id)).sort((a, b) => b.roadPressurePercent - a.roadPressurePercent)[0];
  const score = clamp((clamp(place.stat.visitCount / 160) + clamp(place.rating * 18) + clamp(place.stat.averageDwellMinutes) + clamp(50 + place.stat.trendPercent)) / 4 + 22
    - crowdScore[place.stat.crowdLevel] * 0.32 - (risk ? riskScore[risk.level] * 0.24 : 4) - (move ? move.roadPressurePercent * 0.16 : 4));
  const good = [], warning = [], opportunity = [];
  if (place.rating >= 4.5) good.push("High visitor satisfaction proxy");
  if (place.stat.trendPercent > 8) good.push("Growing visits");
  if (place.stat.crowdLevel === "low" || place.stat.crowdLevel === "moderate") good.push("Manageable crowd pressure");
  if (place.stat.crowdLevel === "high" || place.stat.crowdLevel === "critical") warning.push(`Peak-hour ${place.stat.crowdLevel} crowd pressure`);
  if (move && move.roadPressurePercent >= 70) warning.push("Corridor pressure requires evaluation");
  if (risk) warning.push(`${risk.level} advisory risk intersects tourism activity`);
  if (place.stat.visitCount < 3000 && place.rating >= 4.6) opportunity.push("High-potential under-visited destination");
  if (place.stat.averageDwellMinutes > 70) opportunity.push("Long dwell supports amenity review");
  if (!opportunity.length) opportunity.push("Continue monitoring demand and visitor mix");
  return { score, good, warning, opportunity };
}

export function whyThisMatters(place, mob) {
  const m = mob.filter((x) => x.connectedPlaceIds.includes(place.id)).sort((a, b) => b.roadPressurePercent - a.roadPressurePercent)[0];
  if (!m) return `${n(place.stat.visitCount)} aggregated visits peak during ${place.stat.peakHour}; continue monitoring demand and dwell time.`;
  return `${n(place.stat.visitCount)} aggregated visits peak during ${place.stat.peakHour} with ${place.stat.averageDwellMinutes} minutes average dwell. Movement concentrates on ${m.corridorName} in the same window, indicating a combined crowd and mobility pressure period. Travel delay is ${m.delayPercent > 0 ? "+" : ""}${m.delayPercent}% against baseline.`;
}

export function buildActions(pws, risks, mob) {
  const actions = [];
  pws.forEach((place) => {
    const risk = risks.find((r) => r.placeId === place.id);
    const move = mob.filter((m) => m.connectedPlaceIds.includes(place.id)).sort((a, b) => b.roadPressurePercent - a.roadPressurePercent)[0];
    const alt = place.alternatives.map((id) => pws.find((c) => c.id === id)).filter(Boolean);
    const highestAlt = [...alt].sort((a, b) => b.rating - a.rating)[0];
    const volumeScore = clamp(place.stat.visitCount / 150);
    const trendScore = clamp(50 + place.stat.trendPercent);
    const confidence = place.stat.contributorCount > 150 ? "High" : place.stat.contributorCount > 60 ? "Medium" : "Low";
    const movementScore = move ? Math.round(move.roadPressurePercent * 0.6 + Math.max(0, move.delayPercent) * 1.2) : 0;
    const mobEvidence = move ? [`${n(move.tripCount)} aggregated trips`, `${move.averageTravelMinutes} min average travel during ${move.peakWindow}`] : [];

    if (place.stat.crowdLevel === "critical" || place.stat.crowdLevel === "high") {
      const score = clamp((crowdScore[place.stat.crowdLevel] + volumeScore + trendScore + (risk ? riskScore[risk.level] : 20) + movementScore) / 5 + 12);
      actions.push({
        id: `crowd-${place.id}`, title: `Review peak-hour crowd management at ${place.name}`, location: place.name, category: "Crowd management",
        priority: priorityFromScore(score), priorityScore: score,
        evidence: [`${n(place.stat.visitCount)} aggregated visits`, `Peak concentration ${place.stat.peakHour}`, `Crowd level ${place.stat.crowdLevel}`, `Visit trend ${place.stat.trendPercent > 0 ? "+" : ""}${place.stat.trendPercent}%`, ...mobEvidence],
        recommendedAction: highestAlt ? `Promote ${highestAlt.name}, review timed-entry and crowd-routing measures, and deploy temporary signage during ${place.stat.peakHour}.` : `Review timed-entry, crowd routing and visitor-capacity management during ${place.stat.peakHour}.`,
        expectedImpact: "Reduce peak crowd pressure and distribute demand across nearby destinations.",
        dataConfidence: confidence, status: "Requires field validation",
        scoreExplanation: `Visitor volume ${volumeScore}/100 + crowd ${crowdScore[place.stat.crowdLevel]}/100 + trend ${trendScore}/100${move ? ` + mobility ${movementScore}/100` : ""}.`
      });
      const under = alt.find((c) => c.stat.visitCount < 3500 && c.stat.crowdLevel === "low");
      if (under) {
        const rs = clamp(score * 0.92 + 6);
        actions.push({
          id: `redistribute-${place.id}`, title: `Redistribute visitors from ${place.name} to ${under.name}`, location: place.name, category: "Visitor redistribution",
          priority: priorityFromScore(rs), priorityScore: rs,
          evidence: [`${place.stat.crowdLevel} crowd at ${place.name} during ${place.stat.peakHour}`, `${n(place.stat.visitCount)} aggregated visits`, `${under.name}: ${n(under.stat.visitCount)} visits, ${under.stat.crowdLevel} crowd`, "Visitor concentration imbalance"],
          recommendedAction: `Promote ${under.name} during ${place.stat.peakHour} via timed messaging, signage and partner promotions; validate capacity before redirecting flows.`,
          expectedImpact: "Reduce peak pressure at the primary destination while growing sustainable visitation nearby.",
          dataConfidence: confidence, status: "Requires field validation",
          scoreExplanation: "High crowd pressure + underused nearby destination + peak concentration."
        });
      }
    }
    if (place.stat.visitCount < 3000 && place.rating >= 4.6) {
      const crowdedAlt = alt.find((c) => c.stat.crowdLevel === "high" || c.stat.crowdLevel === "critical");
      const score = clamp(54 + place.rating * 7 + place.stat.trendPercent + (crowdedAlt ? 12 : 0));
      actions.push({
        id: `promo-${place.id}`, title: `Promote ${place.name} as a hidden-gem alternative`, location: place.name, category: "Tourism promotion",
        priority: priorityFromScore(score), priorityScore: score,
        evidence: [`Rating ${place.rating}`, `${n(place.stat.visitCount)} visits, below major destination demand`, `Trend ${place.stat.trendPercent > 0 ? "+" : ""}${place.stat.trendPercent}%`, crowdedAlt ? `Nearby pressure: ${crowdedAlt.name} is ${crowdedAlt.stat.crowdLevel}` : "Nearby alternatives configured"],
        recommendedAction: `Promote during ${place.stat.peakHour} and improve wayfinding and signage from nearby tourism hubs.`,
        expectedImpact: "Increase sustainable visitation and relieve pressure from overcrowded attractions.",
        dataConfidence: confidence, status: "Requires field validation",
        scoreExplanation: "Rating strength + under-visited status + trend + nearby pressure."
      });
    }
    if (move && move.roadPressurePercent >= 70) {
      const score = clamp((move.roadPressurePercent + volumeScore + crowdScore[place.stat.crowdLevel] + Math.max(0, move.delayPercent)) / 4 + 8);
      actions.push({
        id: `infra-${place.id}`, title: `Evaluate road and access pressure near ${place.name}`, location: place.name, category: "Road & traffic pressure",
        priority: priorityFromScore(score), priorityScore: score,
        evidence: [...mobEvidence, `${move.delayPercent > 0 ? "+" : ""}${move.delayPercent}% travel delay against baseline`, `Corridor concentration ${move.corridorConcentrationPercent}%`, `Destination crowd level ${place.stat.crowdLevel}`],
        recommendedAction: "Evaluate alternate routing, signal timing, pedestrian crossings, parking guidance and additional shuttle capacity. Field validation required before capacity decisions.",
        expectedImpact: "Reduce peak travel delay and improve visitor access.",
        dataConfidence: confidence, status: "Requires field validation",
        scoreExplanation: `Road pressure ${move.roadPressurePercent}/100 + travel delay ${move.delayPercent}% + visitor volume ${volumeScore}/100 + crowd pressure.`
      });
    }
    if (move && move.transitPressurePercent >= 55) {
      const score = clamp((move.transitPressurePercent + volumeScore + move.averageStopDwellMinutes) / 3 + 6);
      actions.push({
        id: `transit-${place.id}`, title: `Review transit pressure serving ${place.name}`, location: place.name, category: "Public transit pressure",
        priority: priorityFromScore(score), priorityScore: score,
        evidence: [`${n(move.tripCount)} aggregated trips on ${move.corridorName}`, `${move.transitConcentrationPercent}% transit-area concentration during ${move.peakWindow}`, `${move.averageStopDwellMinutes} min average dwell at the transition zone`, "Transit pressure signal"],
        recommendedAction: "Evaluate service frequency, passenger holding space, last-mile wayfinding and staggered visitor messaging; validate service capacity with field operations.",
        expectedImpact: "Improve peak transfer flow and reduce waiting pressure.",
        dataConfidence: move.confidence, status: "Requires field validation",
        scoreExplanation: `Transit concentration ${move.transitConcentrationPercent}/100 + stop dwell ${move.averageStopDwellMinutes} min + visitor volume ${volumeScore}/100.`
      });
    }
    if (place.stat.visitCount > 7000 && place.stat.averageDwellMinutes > 60) {
      const score = clamp(50 + volumeScore * 0.25 + place.stat.averageDwellMinutes * 0.25 + crowdScore[place.stat.crowdLevel] * 0.2);
      actions.push({
        id: `facility-${place.id}`, title: `Review visitor facilities at ${place.name}`, location: place.name, category: "Facility improvement",
        priority: priorityFromScore(score), priorityScore: score,
        evidence: [`${n(place.stat.visitCount)} aggregated visits`, `Average dwell ${place.stat.averageDwellMinutes} minutes`, `Crowd level ${place.stat.crowdLevel}`, ...(move && move.privateVehiclePercent >= 55 ? [`${move.privateVehiclePercent}% private-vehicle share on the connected corridor`] : [])],
        recommendedAction: `Facility capacity review: toilets, drinking water, shade, seating, accessibility and waste management.${move && move.privateVehiclePercent >= 55 ? " Also review parking or park-and-ride access." : ""}`,
        expectedImpact: "Improve visitor comfort and reduce operational stress at popular destinations.",
        dataConfidence: confidence, status: "Requires field validation",
        scoreExplanation: "Visitor volume + long dwell time + crowd pressure suggest an amenity review."
      });
    }
    if (move && move.privateVehiclePercent >= 55 && place.stat.visitCount > 7000) {
      const score = clamp((move.privateVehiclePercent + volumeScore + move.roadPressurePercent) / 3 + 4);
      actions.push({
        id: `parking-${place.id}`, title: `Review parking and visitor access at ${place.name}`, location: place.name, category: "Parking & access",
        priority: priorityFromScore(score), priorityScore: score,
        evidence: [`${move.privateVehiclePercent}% private-vehicle share on ${move.corridorName}`, `${n(place.stat.visitCount)} aggregated visits`, `Road pressure ${move.roadPressurePercent}% during ${move.peakWindow}`, "Parking and access pressure signal"],
        recommendedAction: "Review parking guidance, pickup and drop-off operations and park-and-ride or shuttle options; validate available parking supply before changes.",
        expectedImpact: "Reduce vehicle circulation and improve arrival flow.",
        dataConfidence: move.confidence, status: "Requires field validation",
        scoreExplanation: `Private-vehicle share ${move.privateVehiclePercent}% + road pressure ${move.roadPressurePercent}/100 + visitor volume ${volumeScore}/100.`
      });
    }
    if (risk && (place.stat.crowdLevel === "high" || place.stat.crowdLevel === "critical" || risk.level === "high")) {
      const score = clamp((riskScore[risk.level] + crowdScore[place.stat.crowdLevel] + volumeScore + movementScore) / 4 + 10);
      actions.push({
        id: `risk-${place.id}`, title: `Coordinate tourism safety advisory for ${place.name}`, location: place.name, category: "Safety & risk",
        priority: priorityFromScore(score), priorityScore: score,
        evidence: [`Risk level ${risk.level}`, risk.reason, `Affected activity ${risk.affectedActivity}`, `Crowd level ${place.stat.crowdLevel}`, ...(move ? [`Mobility pressure ${move.roadPressureLevel}`] : [])],
        recommendedAction: risk.suggestedResponse,
        expectedImpact: "Reduce visitor exposure to advisory risk and improve response coordination.",
        dataConfidence: confidence, status: "Requires field validation",
        scoreExplanation: `Risk ${riskScore[risk.level]}/100 + crowd ${crowdScore[place.stat.crowdLevel]}/100 + visitor volume ${volumeScore}/100${move ? ` + mobility ${movementScore}/100` : ""}.`
      });
    }
  });
  return actions.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function groupedActions(actions) {
  return ["urgent", "high", "opportunity", "monitor"].map((priority) => ({
    priority, label: priorityLabel[priority], count: actions.filter((a) => a.priority === priority).length,
    actions: actions.filter((a) => a.priority === priority)
  }));
}

export function simulateImpact(scenario, pws) {
  const overloaded = [...pws].sort((a, b) => crowdScore[b.stat.crowdLevel] - crowdScore[a.stat.crowdLevel] || b.stat.visitCount - a.stat.visitCount)[0];
  const alternative = pws.find((p) => overloaded.alternatives.includes(p.id)) || [...pws].sort((a, b) => a.stat.visitCount - b.stat.visitCount)[0];
  const factors = {
    promote: { label: "Promote alternative destination", shift: 0.14, impact: "Demand distribution" },
    parking: { label: "Increase parking", shift: 0.07, impact: "Lower parking pressure" },
    shuttle: { label: "Add shuttle", shift: 0.1, impact: "Improved access and corridor relief" },
    signage: { label: "Improve signage", shift: 0.06, impact: "Better visitor routing" },
    redirect: { label: "Redirect visitors", shift: 0.16, impact: "Short-term crowd pressure reduction" },
    pedestrian: { label: "Improve pedestrian infrastructure", shift: 0.08, impact: "Safer walking flow" }
  };
  const s = factors[scenario] || factors.promote;
  const shifted = Math.round(overloaded.stat.visitCount * s.shift);
  return {
    scenarioLabel: s.label, impactType: s.impact, shifted: n(shifted), shiftedRaw: shifted,
    primaryName: overloaded.name, alternativeName: alternative.name,
    currentPrimary: n(overloaded.stat.visitCount), projectedPrimary: n(overloaded.stat.visitCount - shifted),
    currentAlternative: n(alternative.stat.visitCount), projectedAlternative: n(alternative.stat.visitCount + shifted),
    primaryDrop: Math.round((shifted / overloaded.stat.visitCount) * 100),
    altGain: Math.round((shifted / alternative.stat.visitCount) * 100)
  };
}

export const privacyRules = [
  { title: "Consent-based aggregation", body: "Authority views are built only from consented, aggregated travel signals." },
  { title: "No identity in the console", body: "Names, phone numbers, session identifiers, exact trails and identifiable histories are never exposed to authority users." },
  { title: `Minimum ${MIN_AGG} contributors`, body: `Location-level statistics require at least ${MIN_AGG} contributors or events before they are displayed.` },
  { title: "Source indicator on every feed", body: "Each ingested feed carries an explicit source and freshness indicator at the point of display." }
];

export const fmt = n;
export const MIN_AGGREGATION_THRESHOLD = MIN_AGG;
