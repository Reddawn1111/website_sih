import { MIN_AGGREGATION_THRESHOLD } from "../data/demoData.js";

export function canDisplayAggregate(record) {
  return Number(record.contributorCount || 0) >= MIN_AGGREGATION_THRESHOLD;
}

export function displayValue(record, value) {
  return canDisplayAggregate(record) ? value : "Insufficient aggregated data";
}

export function privacySummary() {
  return [
    "TripSafe authority views use consent-based aggregated signals.",
    "The government UI never exposes names, phone numbers, anonymous session IDs, exact trails or identifiable histories.",
    `Location-level statistics require at least ${MIN_AGGREGATION_THRESHOLD} contributors/events.`,
    "Demo data is explicitly labeled and must not be mixed with future live data without a source indicator."
  ];
}
