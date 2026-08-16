import { MIN_AGGREGATION_THRESHOLD } from "../data/demoData.js";

export function canDisplayAggregate(record) {
  return Number(record.contributorCount || 0) >= MIN_AGGREGATION_THRESHOLD;
}

export function displayValue(record, value) {
  return canDisplayAggregate(record) ? value : "Insufficient aggregated data";
}

export function privacyRules() {
  return [
    { title: "Consent-based aggregation", body: "Authority views are built only from consented, aggregated travel signals." },
    { title: "No identity in the console", body: "Names, phone numbers, session identifiers, exact trails and identifiable histories are never exposed to authority users." },
    { title: `Minimum ${MIN_AGGREGATION_THRESHOLD} contributors`, body: `Location-level statistics require at least ${MIN_AGGREGATION_THRESHOLD} contributors or events before they are displayed.` },
    { title: "Source indicator on every feed", body: "Each ingested feed carries an explicit source and freshness indicator at the point of display." }
  ];
}
