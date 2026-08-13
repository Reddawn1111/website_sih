export type DataSource = "demo" | "firebase" | "supabase" | "api";
export type CrowdLevel = "low" | "moderate" | "high" | "critical";
export type RiskLevel = "low" | "moderate" | "high" | "critical";

export interface CoarseLocation {
  lat: number;
  lng: number;
  precisionMeters: number;
  geohashPrefix?: string;
}

export interface TravellerSignal {
  anonymousSessionId: string;
  timestamp: string;
  coarseLocation: CoarseLocation;
  consentScope: string[];
  source: DataSource;
}

export interface VisitEvent {
  placeId: string;
  timestamp: string;
  durationMinutes: number;
  activityCategory: string;
  confidence: number;
}

export interface Place {
  id: string;
  name: string;
  region: string;
  category: string;
  lat: number;
  lng: number;
  rating: number;
  capacity: number;
  nearbyAlternativeIds: string[];
}

export interface AggregatedPlaceStats {
  placeId: string;
  date: string;
  contributorCount: number;
  visitCount: number;
  averageDwellMinutes: number;
  peakHour: string;
  crowdLevel: CrowdLevel;
  trendPercent: number;
  repeatVisitPercent: number;
  satisfactionProxy: number;
  dominantActivity: string;
}

export interface CrowdSnapshot {
  placeId: string;
  timestamp: string;
  contributorCount: number;
  crowdLevel: CrowdLevel;
  pressurePercent: number;
  peakWindow: string;
}

export interface RiskSignal {
  id: string;
  placeId: string;
  level: RiskLevel;
  reason: string;
  affectedActivity: string;
  suggestedResponse: string;
}

export interface MobilityInsight {
  id: string;
  corridorId: string;
  corridorName: string;
  originZone: string;
  destinationZone: string;
  connectedPlaceIds: string[];
  tripCount: number;
  averageTravelMinutes: number;
  baselineTravelMinutes?: number;
  averageStopDwellMinutes?: number;
  corridorConcentrationPercent: number;
  transitConcentrationPercent?: number;
  privateVehiclePercent?: number;
  publicTransportPercent?: number;
  pressurePercent: number;
  peakWindow: string;
  transportMode: string;
  confidence: "Low" | "Medium" | "High";
  recommendation: string;
}

export interface TourismRecommendation {
  id: string;
  priority: "low" | "medium" | "high";
  placeId?: string;
  problem: string;
  evidence: string;
  action: string;
  objective: string;
}

export interface TourismAction {
  id: string;
  title: string;
  location: string;
  category: "Crowd Management" | "Tourism Promotion" | "Infrastructure" | "Facility Improvement" | "Safety & Risk" | "Road/Traffic Pressure" | "Public Transit Pressure" | "Parking & Access" | "Visitor Redistribution";
  priority: "urgent" | "high" | "opportunity" | "monitor";
  priorityScore: number;
  evidence: string[];
  recommendedAction: string;
  expectedImpact: string;
  dataConfidence: "Low" | "Medium" | "High";
  fieldValidationStatus: "Requires field validation" | "Validated" | "Not applicable";
  scoreExplanation: string;
}

export interface DestinationHealthScore {
  score: number;
  good: string[];
  warning: string[];
  opportunity: string[];
}

export interface DataRepository {
  getPlaces(): Promise<Place[]>;
  getAggregatedPlaceStats(): Promise<AggregatedPlaceStats[]>;
  getCrowdSnapshots(): Promise<CrowdSnapshot[]>;
  getRiskSignals(): Promise<RiskSignal[]>;
  getMobilityInsights(): Promise<MobilityInsight[]>;
  getRecommendations(): Promise<TourismRecommendation[]>;
}
