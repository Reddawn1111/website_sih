import {
  places,
  stats,
  riskSignals,
  mobilityInsights,
  recommendations,
  visitsOverTime,
  hourlyCurve
} from "./demoData.js";

export class DataRepository {
  async getPlaces() { throw new Error("Not implemented"); }
  async getAggregatedPlaceStats() { throw new Error("Not implemented"); }
  async getCrowdSnapshots() { throw new Error("Not implemented"); }
  async getRiskSignals() { throw new Error("Not implemented"); }
  async getMobilityInsights() { throw new Error("Not implemented"); }
  async getRecommendations() { throw new Error("Not implemented"); }
  async getVisitsOverTime() { throw new Error("Not implemented"); }
  async getHourlyCurve() { throw new Error("Not implemented"); }
}

export class DemoDataRepository extends DataRepository {
  async getPlaces() { return places; }
  async getAggregatedPlaceStats() { return stats; }
  async getCrowdSnapshots() {
    return stats.map((item) => ({
      placeId: item.placeId,
      timestamp: "2026-08-13T18:30:00+05:30",
      contributorCount: item.contributorCount,
      crowdLevel: item.crowdLevel,
      pressurePercent: Math.min(98, Math.round((item.visitCount / (places.find((place) => place.id === item.placeId)?.capacity || 1)) * 100)),
      peakWindow: item.peakHour
    }));
  }
  async getRiskSignals() { return riskSignals; }
  async getMobilityInsights() { return mobilityInsights; }
  async getRecommendations() { return recommendations; }
  async getVisitsOverTime() { return visitsOverTime; }
  async getHourlyCurve() { return hourlyCurve; }
}

export class FutureFirebaseRepository extends DataRepository {
  constructor(firebaseClient) {
    super();
    this.firebaseClient = firebaseClient;
  }
}

export class FutureSupabaseRepository extends DataRepository {
  constructor(supabaseClient) {
    super();
    this.supabaseClient = supabaseClient;
  }
}

export const activeRepository = new DemoDataRepository();
