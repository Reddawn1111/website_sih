# MyPravasa Future Data Contract

This prototype uses synthetic demo records only. Future Firebase, Supabase or API ingestion should preserve the same domain shape so the dashboard UI and business logic do not need to be rewritten.

## Privacy Rules

- Data must be consent-based.
- Do not expose names, phone numbers, exact trails or identifiable histories.
- Do not expose `anonymousSessionId` in the government UI.
- Location-level insights require a minimum aggregation threshold of 5 contributors/events.
- If a statistic does not meet the threshold, display `Insufficient aggregated data`.
- Every record batch must carry an explicit data source: `demo`, `firebase`, `supabase` or `api`.

## Entities

### TravellerSignal

- `anonymousSessionId`: rotating anonymous app session identifier for ingestion only.
- `timestamp`: ISO timestamp.
- `coarseLocation`: coarse lat/lng with precision metadata.
- `consentScope`: permitted contribution scopes.
- `source`: data source.

### VisitEvent

- `placeId`
- `timestamp`
- `durationMinutes`
- `activityCategory`
- `confidence`

### Place

- `id`
- `name`
- `region`
- `category`
- `lat`
- `lng`
- `rating`
- `capacity`
- `nearbyAlternativeIds`

### AggregatedPlaceStats

- `placeId`
- `date`
- `contributorCount`
- `visitCount`
- `averageDwellMinutes`
- `peakHour`
- `crowdLevel`
- `trendPercent`
- `repeatVisitPercent`
- `satisfactionProxy`

### CrowdSnapshot

- `placeId`
- `timestamp`
- `contributorCount`
- `crowdLevel`
- `pressurePercent`
- `peakWindow`

### RiskSignal

- `id`
- `placeId`
- `level`
- `reason`
- `affectedActivity`
- `suggestedResponse`

### MobilityInsight

- `id`
- `corridorName`
- `connectedPlaceIds`
- `pressurePercent`
- `peakWindow`
- `recommendation`

### TourismRecommendation

- `id`
- `priority`
- `placeId`
- `problem`
- `evidence`
- `action`
- `objective`

### TourismAction

- `id`
- `title`
- `location`
- `category`
- `priority`
- `priorityScore`
- `evidence`
- `recommendedAction`
- `expectedImpact`
- `dataConfidence`
- `fieldValidationStatus`
- `scoreExplanation`

These records can be generated client-side for the prototype or server-side later. They must remain explainable and should not be opaque AI output.

### DestinationHealthScore

- `score`
- `good`
- `warning`
- `opportunity`

The score should be transparent and derived from visitation, trend, dwell time, rating, crowd pressure, accessibility, risk and infrastructure signals.

## Aggregation Expectations

Mobile events should be uploaded as consented coarse signals or visit events. Server-side aggregation should perform visit detection, POI matching, dwell-time estimation, privacy filtering and threshold enforcement before authority dashboards read the data.

Pipeline:

```text
MyPravasa mobile users
-> consented location/activity signals
-> visit detection
-> POI matching
-> dwell-time estimation
-> anonymised aggregation
-> tourism intelligence
-> authority dashboard
-> actionable recommendations
```

## Firebase Mapping

- `places/{placeId}` stores `Place`.
- `aggregatedPlaceStats/{date_placeId}` stores `AggregatedPlaceStats`.
- `crowdSnapshots/{timestamp_placeId}` stores `CrowdSnapshot`.
- `riskSignals/{riskId}` stores `RiskSignal`.
- `mobilityInsights/{insightId}` stores `MobilityInsight`.
- `recommendations/{recommendationId}` stores `TourismRecommendation`.

Use Cloud Functions or scheduled jobs for aggregation. The dashboard should read only aggregated collections.

## Supabase Mapping

- `places`
- `aggregated_place_stats`
- `crowd_snapshots`
- `risk_signals`
- `mobility_insights`
- `tourism_recommendations`

Use row-level security to prevent access to raw signal tables from authority dashboards. Create read-only views for dashboard aggregates.
