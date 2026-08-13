export const MIN_AGGREGATION_THRESHOLD = 5;
export const DATA_SOURCE = "DEMO DATA";

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
  ["central-heritage", 12420, 54, "5-8 PM", "high", 18, 21, 4.4, 216],
  ["church-street", 10980, 88, "7-10 PM", "critical", 14, 34, 4.2, 180],
  ["cubbon-park", 7680, 62, "8-11 AM", "moderate", 8, 29, 4.6, 132],
  ["kr-market", 6410, 42, "10 AM-1 PM", "moderate", -4, 18, 4.1, 109],
  ["lalbagh", 7210, 71, "7-10 AM", "moderate", 5, 25, 4.6, 122],
  ["indiranagar-food", 8370, 79, "8-11 PM", "high", 11, 31, 4.3, 140],
  ["panambur-beach", 13140, 73, "5-8 PM", "critical", 22, 19, 4.0, 210],
  ["tannirbhavi-beach", 4980, 67, "4-7 PM", "moderate", 9, 15, 4.5, 87],
  ["lake-viewpoint", 1480, 59, "4-6 PM", "low", 17, 9, 4.7, 34],
  ["coastal-fort", 2860, 52, "11 AM-2 PM", "low", 12, 13, 4.6, 44],
  ["western-ghat-view", 6920, 61, "3-6 PM", "high", 16, 17, 4.5, 112],
  ["coffee-estate-trail", 1720, 93, "9 AM-12 PM", "low", 19, 10, 4.8, 38]
].map(([placeId, visitCount, averageDwellMinutes, peakHour, crowdLevel, trendPercent, repeatVisitPercent, satisfactionProxy, contributorCount]) => ({
  placeId, date: "2026-08-13", visitCount, averageDwellMinutes, peakHour, crowdLevel, trendPercent, repeatVisitPercent, satisfactionProxy, contributorCount
}));

export const visitsOverTime = [
  ["Mon", 31200], ["Tue", 33800], ["Wed", 36100], ["Thu", 38900], ["Fri", 45100], ["Sat", 58500], ["Sun", 54200]
];

export const hourlyCurve = [
  9, 12, 18, 26, 35, 42, 51, 67, 82, 91, 88, 73, 56, 43, 31, 22, 15, 11, 8, 6, 5, 4, 4, 5
];

export const riskSignals = [
  { id: "risk-1", placeId: "panambur-beach", level: "high", reason: "Heavy rainfall forecast plus high visitor concentration", affectedActivity: "Evening beach visits", suggestedResponse: "Redirect visitors toward inland attractions and show advisory notices." },
  { id: "risk-2", placeId: "western-ghat-view", level: "moderate", reason: "Demo landslide-prone corridor near viewpoint access road", affectedActivity: "Hill viewpoint travel", suggestedResponse: "Promote earlier return windows and publish route caution." },
  { id: "risk-3", placeId: "church-street", level: "high", reason: "Critical late-evening crowd pressure in entertainment cluster", affectedActivity: "Dining and nightlife", suggestedResponse: "Increase crowd marshals and promote nearby distributed food streets." }
];

export const mobilityInsights = [
  { id: "mob-1", corridorName: "Bengaluru CBD -> Church Street", connectedPlaceIds: ["central-heritage", "church-street"], pressurePercent: 82, peakWindow: "6-10 PM", recommendation: "Potential infrastructure priority: improve wayfinding, pedestrian holding areas and last-mile transit messaging." },
  { id: "mob-2", corridorName: "Coastal Highway -> Panambur Beach Zone", connectedPlaceIds: ["panambur-beach", "tannirbhavi-beach"], pressurePercent: 88, peakWindow: "4-8 PM", recommendation: "Consider staggered parking guidance, signage and pedestrian safety infrastructure." },
  { id: "mob-3", corridorName: "Hill Access Road -> Western Ghat Viewpoint", connectedPlaceIds: ["western-ghat-view", "coffee-estate-trail"], pressurePercent: 73, peakWindow: "3-6 PM", recommendation: "Potential infrastructure priority: promote alternative return windows and improve pull-off/parking management." }
];

export const recommendations = [
  { id: "rec-1", priority: "high", placeId: "panambur-beach", problem: "Beach Zone has evening crowd concentration.", evidence: "68% of demo daily visits occur between 5-8 PM and crowd pressure is critical.", action: "Promote Tannirbhavi Beach and Lake Viewpoint during the peak window.", objective: "Distribute tourism demand." },
  { id: "rec-2", priority: "high", placeId: "church-street", problem: "Entertainment cluster reaches critical late-evening pressure.", evidence: "Peak period is 7-10 PM with rising visits and high repeat visitation.", action: "Coordinate pedestrian management and promote Indiranagar overflow options.", objective: "Reduce crowding while preserving visitor experience." },
  { id: "rec-3", priority: "medium", placeId: "lake-viewpoint", problem: "High-rated viewpoint is under-visited.", evidence: "Rating 4.7, low crowd pressure, and +17% trend from a small base.", action: "Promote as a hidden gem alternative to the overcrowded beach viewpoint circuit.", objective: "Grow sustainable tourism in high-potential areas." },
  { id: "rec-4", priority: "medium", placeId: "western-ghat-view", problem: "Hill viewpoint corridor shows recurring mobility pressure.", evidence: "Movement corridor pressure is 73% during 3-6 PM.", action: "Publish return-window nudges and improve parking management.", objective: "Lower corridor stress and improve safety." }
];
