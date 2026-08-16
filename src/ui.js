import {
  categoryDistribution,
  destinationRecommendation,
  joinPlacesWithStats,
  keyInsights,
  kpis,
  tourismOpportunities
} from "./services/intelligenceService.js";
import { buildActionCenter, destinationHealth, groupedActions, simulateImpact } from "./services/actionEngine.js";
import { deriveMobilityMetrics, mobilityForDestination, mobilityPressureSummary, whyThisMatters } from "./services/mobilityService.js";
import { MIN_AGGREGATION_THRESHOLD } from "./data/demoData.js";
import { displayValue, privacyRules } from "./services/privacyService.js";

let activeMaps = [];

const routeTabs = [
  ["dashboard", "Overview"],
  ["actionCenter", "Action centre"],
  ["tourism", "Tourism"],
  ["crowd", "Crowd"],
  ["opportunities", "Opportunities"],
  ["mobility", "Mobility"],
  ["safety", "Safety"],
  ["recommendations", "Recommendations"],
  ["destinations", "Destinations"],
  ["privacy", "Data & privacy"]
];

const routeMeta = {
  dashboard: ["Operations overview", "Aggregated visitation, crowd pressure, mobility and advisory signals for the selected region and window."],
  actionCenter: ["Action centre", "Ranked interventions with the evidence, score composition and expected impact behind each one."],
  tourism: ["Tourism intelligence", "Demand patterns across time, activity category and destination ranking."],
  crowd: ["Crowd management", "Where visitors are concentrating now and which measures relieve the peak window."],
  opportunities: ["Tourism opportunities", "High-rated, under-visited destinations ranked by promotion potential."],
  mobility: ["Mobility & roads", "Corridor pressure between origin zones and destinations, separated into observed, calculated and inferred signals."],
  safety: ["Safety & risk", "Advisory conditions intersecting tourism activity, with the coordinated response for each."],
  recommendations: ["Recommendations", "Rule-based recommendations with a transparent evidence trail."],
  destinations: ["Destinations", "Destination health, pressure and the reasoning behind each recommendation."],
  privacy: ["Data & privacy", "Aggregation thresholds, feed provenance and what the authority console never receives."]
};

const regionOptions = ["All Regions", "Bengaluru", "Coastal Karnataka", "Hill Corridor"];
const categoryOptions = ["All Categories", "Heritage", "Entertainment", "Park", "Market", "Restaurant", "Beach", "Viewpoint", "Nature"];
const dateOptions = ["Today", "Last 7 days", "Festival week"];
const scenarioOptions = [
  ["promote", "Promote alternative destination"],
  ["redirect", "Redirect visitors"],
  ["shuttle", "Add shuttle service"],
  ["parking", "Increase parking"],
  ["signage", "Improve signage"],
  ["pedestrian", "Improve pedestrian infrastructure"]
];

const CROWD_HEX = { critical: "#E4572E", high: "#F2C230", moderate: "#3FBF74", low: "#7f8d85" };

function nf(value) {
  return Number(value).toLocaleString("en-IN");
}

function crowdVar(level) {
  return `var(--${level === "critical" ? "crit" : level === "high" ? "high" : level === "moderate" ? "mod" : "low"})`;
}

function crowdHex(level) {
  return CROWD_HEX[level] || CROWD_HEX.low;
}

function priorityVar(priority) {
  return `var(--${priority === "urgent" ? "crit" : priority === "high" ? "high" : priority === "opportunity" ? "mod" : "low"})`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[character]);
}

export function formatClock() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function tagInsights(list) {
  const tags = ["CROWD", "GROWTH", "OPPORTUNITY", "MOBILITY", "ADVISORY"];
  return list.map((text, index) => {
    const tag = tags[index] || "SIGNAL";
    const tagColor = tag === "CROWD" || tag === "ADVISORY" ? "var(--crit)" : tag === "OPPORTUNITY" ? "var(--mod)" : "var(--muted)";
    return { tag, text, sub: "", tagColor };
  });
}

export function renderShell(state, rawData) {
  const data = filteredData(state, rawData);
  return `
    <div class="shell ${state.presentation ? "presentation" : ""}">
      ${renderTopBar(state)}
      <main class="main">
        ${renderPageHead(state, data)}
        ${data.placesWithStats.length ? renderRouteBody(state, data) : renderEmptyState()}
      </main>
    </div>
  `;
}

function renderTopBar(state) {
  const tabs = routeTabs.map(([route, label]) => `
    <button type="button" class="tab ${state.route === route ? "active" : ""}" data-route="${route}">${label}</button>
  `).join("");
  return `
    <header class="topbar">
      <div class="topbar-row1">
        <div class="brand">
          <div class="brand-mark"><div class="brand-dot"></div></div>
          <div class="brand-text">
            <span class="brand-name">MyPravasa</span>
            <span class="brand-sub">Tourism Intelligence</span>
          </div>
        </div>
        <div class="filters">
          <select class="pill-select" data-filter="region">
            ${regionOptions.map((opt) => `<option ${state.region === opt ? "selected" : ""}>${opt}</option>`).join("")}
          </select>
          <select class="pill-select" data-filter="category">
            ${categoryOptions.map((opt) => `<option ${state.category === opt ? "selected" : ""}>${opt}</option>`).join("")}
          </select>
          <select class="pill-select" data-filter="dateRange">
            ${dateOptions.map((opt) => `<option ${state.dateRange === opt ? "selected" : ""}>${opt}</option>`).join("")}
          </select>
        </div>
        <div class="spacer"></div>
        <div class="feed-status"><span class="feed-dot"></span><span>Live feed · 12 min ago</span></div>
        <span class="clock" data-clock>${formatClock()}</span>
        <button type="button" class="presentation-toggle" data-toggle-presentation>${state.presentation ? "Exit presentation" : "Presentation"}</button>
        <div class="operator">
          <div class="avatar">KR</div>
          <div class="operator-text">
            <span class="operator-name">K. Ramesh</span>
            <span class="operator-role">Tourism Authority</span>
          </div>
        </div>
      </div>
      <nav class="tabs">${tabs}</nav>
    </header>
  `;
}

function renderPageHead(state, data) {
  const [title, blurb] = routeMeta[state.route] || routeMeta.dashboard;
  const chips = [
    `${data.placesWithStats.length} destinations in view`,
    `${state.region} · ${state.dateRange}`,
    `${data.actions.length} open interventions`
  ];
  return `
    <div class="page-head">
      <div class="page-head-text">
        <h1>${title}</h1>
        <p>${blurb}</p>
      </div>
      <div class="context-chips">${chips.map((chip) => `<span class="chip">${chip}</span>`).join("")}</div>
    </div>
  `;
}

function filteredData(state, data) {
  const placesWithStats = joinPlacesWithStats(data.places, data.stats)
    .filter((place) => state.region === "All Regions" || place.region === state.region)
    .filter((place) => state.category === "All Categories" || place.category === state.category)
    .filter((place) => state.crowd === "All Crowd Levels" || place.stat.crowdLevel === state.crowd);

  const mobility = deriveMobilityMetrics(data.mobility)
    .filter((item) => item.connectedPlaceIds.some((id) => placesWithStats.some((place) => place.id === id)));
  const risks = data.risks.filter((risk) => placesWithStats.some((place) => place.id === risk.placeId));
  const actions = buildActionCenter(placesWithStats, risks, mobility);
  const selected = placesWithStats.find((place) => place.id === state.selectedDestination) || placesWithStats[0];

  return {
    ...data,
    placesWithStats,
    risks,
    mobility,
    actions,
    selected,
    mobilitySummary: mobilityPressureSummary(mobility),
    recommendations: data.recommendations.filter((item) => !item.placeId || placesWithStats.some((place) => place.id === item.placeId))
  };
}

function renderEmptyState() {
  return `
    <section class="empty-state">
      <div class="panel-title">Insufficient aggregated data</div>
      <p class="panel-note" style="margin-top:8px">No destination-level aggregate meets the current filter combination. Adjust region, category or date range.</p>
    </section>
  `;
}

function renderRouteBody(state, data) {
  const routes = {
    dashboard: renderDashboard,
    actionCenter: renderActionCenterRoute,
    tourism: renderTourism,
    crowd: renderCrowd,
    opportunities: renderOpportunities,
    mobility: renderMobility,
    safety: renderSafety,
    recommendations: renderRecommendations,
    destinations: renderDestinations,
    privacy: renderPrivacyRoute
  };
  const renderer = routes[state.route] || renderDashboard;
  return renderer(state, data);
}

/* ---------- Block: KPI strip ---------- */

function renderKpiStrip(placesWithStats, risks) {
  const raw = kpis(placesWithStats, risks);
  const [travellers, totalVisits, mostVisited, avgDwell, crowdPressure, advisories] = raw;
  const items = [
    { ...travellers, label: "Consenting travellers" },
    { ...totalVisits, label: "Total visits" },
    { ...avgDwell, label: "Average dwell" },
    { ...crowdPressure, label: "Peak crowd pressure" },
    { ...mostVisited, label: "Most visited" },
    { ...advisories, label: "Active advisories" }
  ];
  return `
    <section class="kpi-strip">
      ${items.map((item, index) => {
        const isNumeric = /^[\d,+.%\s-]+$|min$/i.test(String(item.value));
        const sizeClass = isNumeric ? "" : (index === 4 ? " smaller" : " small");
        const toneStyle = item.tone ? ` style="color:${crowdVar(item.tone)}"` : "";
        return `
          <article class="kpi-card${index === 0 ? " hi" : ""}">
            <span class="kpi-label">${item.label}</span>
            <div class="kpi-value-row"><span class="kpi-value${sizeClass}"${toneStyle}>${item.value}</span></div>
            <span class="kpi-delta">${item.delta}</span>
          </article>
        `;
      }).join("")}
    </section>
  `;
}

/* ---------- Block: Map hero + signals rail ---------- */

function renderMapHero(sideTitle, sideItems) {
  const showSide = Array.isArray(sideItems);
  return `
    <section class="map-hero${showSide ? "" : " full"}">
      <div class="map-panel">
        <div class="panel-head">
          <div>
            <div class="panel-title">Live destination pressure</div>
            <div class="panel-note">Circle area scales with aggregated visits · colour shows crowd level</div>
          </div>
          <div class="map-legend">
            ${["critical", "high", "moderate", "low"].map((level) => `<span class="legend-item"><span class="legend-dot" style="background:${crowdVar(level)}"></span>${level}</span>`).join("")}
          </div>
        </div>
        <div class="map-body" data-leaflet-map role="application" aria-label="Interactive aggregated tourism crowd map"></div>
      </div>
      ${showSide ? `
        <div class="rail">
          <span class="rail-title">${sideTitle}</span>
          <div class="rail-list">
            ${sideItems.map((item) => `
              <div class="rail-row">
                <span class="rail-tag" style="color:${item.tagColor}">${item.tag}</span>
                <span class="rail-text">${item.text}</span>
                ${item.sub ? `<span class="rail-sub">${item.sub}</span>` : ""}
              </div>
            `).join("")}
          </div>
        </div>
      ` : ""}
    </section>
  `;
}

/* ---------- Block: Mobility strip ---------- */

function renderMobilityStrip(summary) {
  if (!summary) {
    return `
      <section class="mobility-strip">
        <div class="mobility-head"><span class="panel-title">Mobility pressure</span></div>
        <div class="panel-note">Insufficient sample size for aggregated mobility indicators in the current filters.</div>
      </section>
    `;
  }
  const transitIsCrowdLevel = ["low", "moderate", "high", "critical"].includes(summary.transitPressure);
  const cells = [
    { label: "Road pressure", value: summary.roadPressure.toUpperCase(), tone: crowdVar(summary.roadPressure) },
    { label: "Transit pressure", value: String(summary.transitPressure).toUpperCase(), tone: transitIsCrowdLevel ? crowdVar(summary.transitPressure) : "var(--text)" },
    { label: "Visitor concentration", value: summary.visitorConcentration, tone: "var(--text)" },
    { label: "Peak window", value: summary.peakWindow, tone: "var(--text)" },
    { label: "Average delay", value: `+${summary.averageDelay}%`, tone: "var(--crit)" },
    { label: "Top corridor", value: summary.topCorridor, tone: "var(--text)", small: true }
  ];
  return `
    <section class="mobility-strip">
      <div class="mobility-head">
        <span class="panel-title">Mobility pressure</span>
        <span class="panel-note">Observed · calculated · inferred, shown separately</span>
      </div>
      <div class="mobility-grid">
        ${cells.map((cell) => `
          <div class="mobility-cell">
            <span class="mobility-label">${cell.label}</span>
            <span class="mobility-value${cell.small ? " small" : ""}" style="color:${cell.tone}">${cell.value}</span>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

/* ---------- Block: Charts ---------- */

function renderCharts(visitsOverTime, hourlyCurve) {
  const maxVisit = Math.max(...visitsOverTime.map(([, value]) => value));
  const peakDay = visitsOverTime.reduce((a, b) => (b[1] > a[1] ? b : a));
  const totalVisits = visitsOverTime.reduce((sum, [, value]) => sum + value, 0);
  const maxHour = Math.max(...hourlyCurve);
  const peakHourIndex = hourlyCurve.indexOf(maxHour);
  return `
    <section class="charts-grid">
      <div class="chart-card">
        <div class="chart-head">
          <span class="panel-title">Visits / week</span>
          <span class="panel-note">${nf(totalVisits)} visits · peak ${peakDay[0]}</span>
        </div>
        <div class="visit-bars">
          ${visitsOverTime.map(([label, value]) => {
            const isPeak = value === maxVisit;
            const height = Math.round((value / maxVisit) * 100);
            return `
              <div class="visit-bar">
                <span class="visit-bar-value" style="color:${isPeak ? "var(--text)" : "var(--muted)"}">${nf(value)}</span>
                <div class="visit-bar-fill${isPeak ? " peak" : ""}" style="height:${height}%"></div>
                <span class="visit-bar-label">${label}</span>
              </div>
            `;
          }).join("")}
        </div>
      </div>
      <div class="chart-card">
        <div class="chart-head">
          <span class="panel-title">Intraday concentration</span>
          <span class="panel-note">Peak ${peakHourIndex}:00</span>
        </div>
        <div class="hour-bars">
          ${hourlyCurve.map((value) => {
            const height = Math.max(3, Math.round((value / maxHour) * 100));
            const isPeak = value >= maxHour * 0.85;
            return `<div class="hour-bar${isPeak ? " peak" : ""}" style="height:${height}%"></div>`;
          }).join("")}
        </div>
        <div class="hour-axis"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>
      </div>
    </section>
  `;
}

/* ---------- Block: Category bars ---------- */

function renderCategoryBars(placesWithStats) {
  const categories = categoryDistribution(placesWithStats);
  const max = Math.max(...categories.map((item) => item.value));
  return `
    <section class="category-bars">
      <span class="panel-title">Demand by activity category</span>
      <div class="category-list">
        ${categories.map((item) => `
          <div class="category-row">
            <span class="category-label">${item.label}</span>
            <div class="category-track"><div class="category-fill" style="width:${Math.round((item.value / max) * 100)}%"></div></div>
            <span class="category-value">${nf(item.value)}</span>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

/* ---------- Block: Destination table ---------- */

function renderDestinationTable(rows, selectedId, { title, note, extraLabel, extra }) {
  return `
    <section class="dest-table">
      <div class="panel-head"><span class="panel-title">${title}</span><span class="panel-note">${note}</span></div>
      <div class="dest-table-scroll">
        <div class="dest-table-head">
          <span>Destination</span><span style="text-align:right">Visits</span><span style="text-align:right">Avg dwell</span><span>Peak window</span><span>Crowd</span><span style="text-align:right">${extraLabel}</span>
        </div>
        ${rows.map((place) => {
          const selected = place.id === selectedId ? " selected" : "";
          const { value: extraValue, color: extraColor } = extra(place);
          return `
            <button type="button" class="dest-row${selected}" data-destination="${place.id}">
              <span class="dest-name">
                <span class="dest-name-primary">${place.name}</span>
                <span class="dest-name-sub">${place.category} · ${place.stat.dominantActivity}</span>
              </span>
              <span class="dest-visits">${displayValue(place.stat, nf(place.stat.visitCount))}</span>
              <span class="dest-dwell">${place.stat.averageDwellMinutes}m</span>
              <span class="dest-peak">${place.stat.peakHour}</span>
              <span class="dest-crowd" style="color:${crowdVar(place.stat.crowdLevel)}">${place.stat.crowdLevel.toUpperCase()}</span>
              <span class="dest-extra" style="color:${extraColor}">${extraValue}</span>
            </button>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

/* ---------- Block: Destination detail ---------- */

function renderDestinationDetail(state, data) {
  const place = data.selected;
  const health = destinationHealth(place, data.risks, data.mobility);
  const risk = data.risks.find((item) => item.placeId === place.id);
  const mobility = mobilityForDestination(place.id, data.mobility);
  const alternatives = place.alternatives
    .map((id) => data.placesWithStats.find((candidate) => candidate.id === id)?.name)
    .filter(Boolean)
    .join(", ");
  return `
    <section class="detail-grid">
      <div class="detail-health">
        <span class="detail-health-label">Destination health</span>
        <span class="detail-name">${place.name}</span>
        <div class="detail-score-row">
          <span class="detail-score">${health.score}</span>
          <span class="detail-score-max">/ 100</span>
        </div>
        <div class="detail-score-track"><div class="detail-score-fill" style="width:${health.score}%;background:${health.score >= 60 ? "var(--onhi)" : "var(--crit)"}"></div></div>
        <div class="detail-factors">
          <div class="detail-factor"><span class="detail-health-label">Working</span><span class="detail-factor-text">${health.good.join(" · ") || "—"}</span></div>
          <div class="detail-factor"><span class="detail-health-label">Warning</span><span class="detail-factor-text">${health.warning.join(" · ") || "None in the current window"}</span></div>
          <div class="detail-factor"><span class="detail-health-label">Opportunity</span><span class="detail-factor-text">${health.opportunity.join(" · ")}</span></div>
        </div>
      </div>
      <div class="detail-side">
        <div class="why-card">
          <span class="uc-label">Why this matters</span>
          <p class="why-text">${whyThisMatters(place, data.mobility)}</p>
        </div>
        <div class="detail-notes">
          <div class="detail-note"><span class="uc-label">Crowd management</span><span class="detail-note-text">${destinationRecommendation(place)}</span></div>
          <div class="detail-note"><span class="uc-label">Mobility</span><span class="detail-note-text">${mobility ? mobility.recommendation : "No elevated corridor pressure connected to this destination."}</span></div>
          <div class="detail-note"><span class="uc-label">Safety</span><span class="detail-note-text">${risk ? risk.suggestedResponse : "No advisory risk active for this destination."}</span></div>
          <div class="detail-note"><span class="uc-label">Nearby alternatives</span><span class="detail-note-text">${alternatives || "No alternatives configured."}</span></div>
        </div>
      </div>
    </section>
  `;
}

/* ---------- Block: Corridor card ---------- */

function renderCorridorCard(item) {
  const tone = crowdVar(item.roadPressureLevel);
  return `
    <article class="corridor-card">
      <div class="corridor-left">
        <span class="corridor-level" style="color:${tone}">${item.roadPressureLevel.toUpperCase()} road pressure</span>
        <span class="corridor-name">${item.corridorName}</span>
        <span class="corridor-mode">${item.transportMode} · confidence ${item.confidence}</span>
        <div class="corridor-signals">${item.inferredSignals.map((signal) => `<span class="signal-chip">${signal}</span>`).join("")}</div>
      </div>
      <div class="corridor-metric">
        <span class="metric-label">Aggregated trips</span>
        <span class="metric-value">${nf(item.tripCount)}</span>
        <span class="metric-sub">peak ${item.peakWindow}</span>
      </div>
      <div class="corridor-metric">
        <span class="metric-label">Average travel</span>
        <span class="metric-value">${item.averageTravelMinutes}m</span>
        <span class="metric-sub">baseline ${item.baselineTravelMinutes}m</span>
      </div>
      <div class="corridor-metric">
        <span class="metric-label">Travel delay</span>
        <span class="metric-value" style="color:var(--crit)">${item.delayPercent > 0 ? "+" : ""}${item.delayPercent}%</span>
        <span class="metric-sub">against baseline</span>
      </div>
      <div class="corridor-metric">
        <span class="metric-label">Road pressure</span>
        <span class="metric-value" style="color:${tone}">${item.roadPressurePercent}%</span>
        <span class="metric-sub">${item.corridorConcentrationPercent}% concentration</span>
      </div>
      <p class="corridor-recommendation">${item.recommendation}</p>
    </article>
  `;
}

/* ---------- Block: Risk card ---------- */

function renderRiskCard(risk, place) {
  const isHigh = risk.level === "high";
  return `
    <article class="risk-card${isHigh ? " high-level" : ""}">
      <div class="risk-top">
        <span class="risk-pill${isHigh ? " high-level" : ""}">${risk.level.toUpperCase()}</span>
        <span class="risk-window">${place?.stat.peakHour || ""}</span>
      </div>
      <span class="risk-place">${place?.name || risk.placeId}</span>
      <p class="risk-reason">${risk.reason}</p>
      <div class="risk-block"><span class="uc-label">Affected activity</span><span class="risk-block-value">${risk.affectedActivity}</span></div>
      <div class="risk-block"><span class="uc-label">Response</span><span class="risk-block-value">${risk.suggestedResponse}</span></div>
    </article>
  `;
}

/* ---------- Block: Recommendation card ---------- */

function renderRecommendationCard(item, index, placesWithStats) {
  const place = placesWithStats.find((candidate) => candidate.id === item.placeId);
  const isHi = index === 0;
  const pillStyle = isHi
    ? "border-color:rgba(0,0,0,.25);color:var(--onhi)"
    : `color:${item.priority === "high" ? "var(--high)" : "var(--muted)"}`;
  return `
    <article class="rec-card${isHi ? " hi" : ""}">
      <div class="rec-top">
        <span class="rec-pill" style="${pillStyle}">${item.priority.toUpperCase()}</span>
        <span class="rec-place">${place?.name || ""}</span>
      </div>
      <span class="rec-problem">${item.problem}</span>
      <div class="rec-rows">
        <div class="rec-row"><span class="rec-row-label">Evidence</span><span class="rec-row-value">${item.evidence}</span></div>
        <div class="rec-row"><span class="rec-row-label">Action</span><span class="rec-row-value">${item.action}</span></div>
        <div class="rec-row"><span class="rec-row-label">Objective</span><span class="rec-row-value">${item.objective}</span></div>
      </div>
    </article>
  `;
}

/* ---------- Block: Priority counters ---------- */

function renderPriorityCounters(actions) {
  const groups = groupedActions(actions);
  return `
    <section class="priority-grid">
      ${groups.map((group) => `
        <div class="priority-card">
          <div class="priority-left">
            <span class="priority-dot" style="background:${priorityVar(group.priority)}"></span>
            <span class="priority-label">${group.label}</span>
          </div>
          <span class="priority-count" style="color:${priorityVar(group.priority)}">${group.actions.length}</span>
        </div>
      `).join("")}
    </section>
  `;
}

/* ---------- Block: Intervention simulator ---------- */

function renderSimulator(state, data) {
  const result = simulateImpact(state.scenario, data.placesWithStats);
  const primaryDrop = result.currentPrimary ? Math.round((result.shiftedVisits / result.currentPrimary) * 100) : 0;
  const altGain = result.currentAlternative ? Math.round((result.shiftedVisits / result.currentAlternative) * 100) : 0;
  const primaryBar = Math.max(0, 100 - primaryDrop);
  const altBar = Math.min(100, 60 + altGain / 3);
  return `
    <section class="simulator">
      <div class="sim-left">
        <span class="sim-title">Intervention simulator</span>
        <p class="sim-desc">Projected redistribution if the selected measure is deployed in the peak window.</p>
        <select class="sim-select" data-filter="scenario">
          ${scenarioOptions.map(([value, label]) => `<option value="${value}" ${state.scenario === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
        <div class="sim-impact"><span class="uc-label">Impact type</span><span class="body-copy">${result.impactType}</span></div>
      </div>
      <div class="sim-right">
        <div class="sim-col">
          <span class="uc-label">Relieved · ${result.primaryName}</span>
          <div class="sim-values">
            <span class="sim-value">${nf(result.projectedPrimary)}</span>
            <span class="sim-current">${nf(result.currentPrimary)}</span>
            <span class="sim-delta" style="color:var(--crit)">−${primaryDrop}%</span>
          </div>
          <div class="sim-bar-track"><div class="sim-bar-fill" style="width:${primaryBar}%;background:var(--crit)"></div></div>
        </div>
        <div class="sim-col">
          <span class="uc-label">Absorbed · ${result.alternativeName}</span>
          <div class="sim-values">
            <span class="sim-value">${nf(result.projectedAlternative)}</span>
            <span class="sim-current">${nf(result.currentAlternative)}</span>
            <span class="sim-delta" style="color:var(--mod)">+${altGain}%</span>
          </div>
          <div class="sim-bar-track"><div class="sim-bar-fill" style="width:${altBar}%;background:var(--mod)"></div></div>
        </div>
        <div class="sim-footer">${nf(result.shiftedVisits)} visits shifted per week · ${result.scenarioLabel} · requires field validation before deployment</div>
      </div>
    </section>
  `;
}

/* ---------- Block: Action card / list ---------- */

function renderActionCard(item) {
  const tone = priorityVar(item.priority);
  return `
    <article class="action-card" style="border-left-color:${tone}">
      <div class="action-col1">
        <span class="action-priority" style="color:${tone}">${item.priority.toUpperCase()}</span>
        <span class="action-score">${item.priorityScore}</span>
        <span class="action-score-label">priority score</span>
        <span class="action-confidence">Confidence ${item.dataConfidence}</span>
      </div>
      <div class="action-col2">
        <span class="action-title">${item.title}</span>
        <div class="action-chips">
          <span class="action-chip">${item.category}</span>
          <span class="action-chip">${item.location}</span>
          <span class="action-chip">${item.fieldValidationStatus}</span>
        </div>
        <div class="action-evidence">
          <span class="uc-label">Evidence</span>
          ${item.evidence.slice(0, 4).map((point) => `<span class="action-evidence-item">· ${point}</span>`).join("")}
        </div>
      </div>
      <div class="action-col3">
        <div class="action-block"><span class="uc-label">Recommended action</span><span class="action-block-text">${item.recommendedAction}</span></div>
        <div class="action-block rule"><span class="uc-label">Expected impact</span><span class="action-block-text" style="color:var(--muted)">${item.expectedImpact}</span></div>
        <div class="action-buttons">
          <button type="button" class="btn-primary">Assign owner</button>
          <button type="button" class="btn-secondary">Score detail</button>
        </div>
      </div>
    </article>
  `;
}

function renderActionList(title, note, actions) {
  return `
    <section class="action-list stack-gap">
      <div class="action-list-head"><span class="action-list-title">${title}</span><span class="action-list-note">${note}</span></div>
      ${actions.length ? actions.map(renderActionCard).join("") : `<div class="empty-state">No matching interventions in the current filters.</div>`}
    </section>
  `;
}

/* ---------- Block: Privacy ---------- */

function renderPrivacyBlocks() {
  const rules = privacyRules();
  const feeds = [
    { name: "Consented mobility observations", records: 84210, freshness: "12 min ago", state: "Aggregated", tone: "var(--mod)" },
    { name: "Destination visit aggregates", records: 12480, freshness: "12 min ago", state: "Aggregated", tone: "var(--mod)" },
    { name: "Weather & advisory service", records: 96, freshness: "4 min ago", state: "Public source", tone: "var(--muted)" },
    { name: "Road & transit corridor telemetry", records: 22760, freshness: "31 min ago", state: "Threshold-limited", tone: "var(--high)" }
  ];
  return `
    <div class="privacy-rules">
      ${rules.map((rule) => `
        <article class="privacy-rule">
          <span class="privacy-rule-title">${rule.title}</span>
          <p class="privacy-rule-body">${rule.body}</p>
        </article>
      `).join("")}
    </div>
    <div class="privacy-banner">
      <div class="privacy-banner-left">
        <span class="privacy-banner-num">${MIN_AGGREGATION_THRESHOLD}</span>
        <span class="privacy-banner-label">Minimum contributors</span>
      </div>
      <p class="privacy-banner-text">Any location-level statistic below the threshold is withheld and the console shows an insufficient-aggregation state instead of a number. Thresholds, retention windows and feed sources are configured per data-sharing agreement and audited monthly.</p>
    </div>
    <div class="feed-table">
      <div class="feed-table-head"><span>Feed</span><span>Records</span><span>Freshness</span><span>Aggregation</span></div>
      ${feeds.map((feed) => `
        <div class="feed-row">
          <span class="feed-name">${feed.name}</span>
          <span class="feed-records">${nf(feed.records)}</span>
          <span class="feed-freshness">${feed.freshness}</span>
          <span class="feed-state" style="color:${feed.tone}">${feed.state}</span>
        </div>
      `).join("")}
    </div>
  `;
}

/* ---------- Routes ---------- */

function renderDashboard(state, data) {
  const sideList = tagInsights(keyInsights(data.placesWithStats, data.risks, data.mobility));
  return `
    ${renderKpiStrip(data.placesWithStats, data.risks)}
    ${renderMapHero("Signals worth acting on", sideList)}
    ${renderMobilityStrip(data.mobilitySummary)}
    ${renderCharts(data.visitsOverTime, data.hourlyCurve)}
    ${renderPriorityCounters(data.actions)}
    ${renderSimulator(state, data)}
    ${renderActionList("Top interventions", "Ranked by priority score", data.actions.slice(0, 3))}
  `;
}

function renderActionCenterRoute(state, data) {
  return `
    ${renderPriorityCounters(data.actions)}
    ${renderSimulator(state, data)}
    ${renderActionList("Intervention queue", `${data.actions.length} items · evidence and score shown for each`, data.actions)}
  `;
}

function renderTourism(state, data) {
  const rows = [...data.placesWithStats].sort((a, b) => b.stat.visitCount - a.stat.visitCount);
  return `
    ${renderCharts(data.visitsOverTime, data.hourlyCurve)}
    ${renderCategoryBars(data.placesWithStats)}
    ${renderDestinationTable(rows, state.selectedDestination, {
      title: "Destination demand",
      note: "Sorted by aggregated visits",
      extraLabel: "Trend",
      extra: (place) => ({
        value: `${place.stat.trendPercent > 0 ? "+" : ""}${place.stat.trendPercent}%`,
        color: place.stat.trendPercent < 0 ? "var(--crit)" : "var(--mod)"
      })
    })}
  `;
}

function renderCrowd(state, data) {
  const sideList = [...data.placesWithStats]
    .sort((a, b) => b.stat.visitCount / b.capacity - a.stat.visitCount / a.capacity)
    .slice(0, 5)
    .map((place) => ({
      tag: `${Math.round((place.stat.visitCount / place.capacity) * 100)}% of capacity · ${place.stat.crowdLevel}`,
      text: place.name,
      sub: `Peak ${place.stat.peakHour} · ${destinationRecommendation(place)}`,
      tagColor: crowdVar(place.stat.crowdLevel)
    }));
  const actions = data.actions.filter((item) => item.category === "Crowd management" || item.category === "Visitor redistribution");
  return `
    ${renderMapHero("Concentration right now", sideList)}
    ${renderActionList("Crowd measures", "Peak-window interventions and redistribution", actions)}
  `;
}

function renderOpportunities(state, data) {
  const ranked = tourismOpportunities(data.placesWithStats);
  const actions = data.actions.filter((item) => item.category === "Tourism promotion" || item.category === "Visitor redistribution");
  return `
    ${renderDestinationTable(ranked, state.selectedDestination, {
      title: "Promotion potential",
      note: "Rating, under-visitation, dwell and headroom",
      extraLabel: "Score",
      extra: (place) => ({ value: String(place.opportunityScore), color: "var(--mod)" })
    })}
    ${renderActionList("Promotion actions", "Hidden-gem and redistribution measures", actions)}
  `;
}

function renderMobility(state, data) {
  const actions = data.actions.filter((item) => [
    "Road & traffic pressure",
    "Public transit pressure",
    "Parking & access",
    "Facility improvement"
  ].includes(item.category));
  return `
    ${renderMobilityStrip(data.mobilitySummary)}
    <section class="corridor-list">${data.mobility.map(renderCorridorCard).join("")}</section>
    ${renderActionList("Road, transit, parking and facility actions", "Field validation required before capacity decisions", actions)}
  `;
}

function renderSafety(state, data) {
  const actions = data.actions.filter((item) => item.category === "Safety & risk");
  return `
    <section class="risk-grid">${data.risks.map((risk) => renderRiskCard(risk, data.placesWithStats.find((place) => place.id === risk.placeId))).join("")}</section>
    ${renderActionList("Safety coordination", "Advisory response actions", actions)}
  `;
}

function renderRecommendations(state, data) {
  return `
    <section class="rec-grid">${data.recommendations.map((item, index) => renderRecommendationCard(item, index, data.placesWithStats)).join("")}</section>
    ${renderActionList("Explainable ranking", "Every score decomposed into its inputs", data.actions.slice(0, 6))}
  `;
}

function renderDestinations(state, data) {
  return `
    ${renderMapHero(null, null)}
    ${renderDestinationTable(data.placesWithStats, state.selectedDestination, {
      title: "All destinations",
      note: "Select a row to inspect",
      extraLabel: "Rating",
      extra: (place) => ({ value: place.rating.toFixed(1), color: "var(--muted)" })
    })}
    ${renderDestinationDetail(state, data)}
  `;
}

function renderPrivacyRoute() {
  return `<div class="stack-gap">${renderPrivacyBlocks()}</div>`;
}

/* ---------- Leaflet map ---------- */

export function destroyLeafletMaps() {
  activeMaps.forEach((map) => map.remove());
  activeMaps = [];
}

export function initializeLeafletMaps(state, data, onSelectDestination) {
  if (!window.L) return;
  const mapElement = document.querySelector("[data-leaflet-map]");
  if (!mapElement || !data.placesWithStats.length) return;

  const map = window.L.map(mapElement, { zoomControl: true, attributionControl: false, scrollWheelZoom: false });
  window.L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    subdomains: "abcd",
    maxZoom: 19
  }).addTo(map);

  const maxVisits = Math.max(...data.placesWithStats.map((place) => place.stat.visitCount));
  data.placesWithStats.forEach((place) => {
    const color = crowdHex(place.stat.crowdLevel);
    const marker = window.L.circleMarker([place.lat, place.lng], {
      radius: 8 + Math.sqrt(place.stat.visitCount / maxVisits) * 18,
      color,
      weight: 1.2,
      fillColor: color,
      fillOpacity: place.id === state.selectedDestination ? 0.42 : 0.2
    }).addTo(map);
    marker.bindTooltip(
      `<span>${escapeHtml(place.name)}<br>${escapeHtml(nf(place.stat.visitCount))} visits · ${escapeHtml(place.stat.crowdLevel)} · peak ${escapeHtml(place.stat.peakHour)}</span>`,
      { direction: "top", opacity: 0.95 }
    );
    marker.on("click", () => onSelectDestination(place.id));
  });

  data.mobility.forEach((corridor) => {
    const points = corridor.connectedPlaceIds
      .map((id) => data.placesWithStats.find((place) => place.id === id))
      .filter(Boolean)
      .map((place) => [place.lat, place.lng]);
    if (points.length < 2) return;
    window.L.polyline(points, {
      color: crowdHex(corridor.roadPressureLevel),
      weight: 1.6,
      opacity: 0.6,
      dashArray: "5 6"
    }).addTo(map);
  });

  const bounds = window.L.latLngBounds(data.placesWithStats.map((place) => [place.lat, place.lng]));
  map.fitBounds(bounds, { padding: [42, 42] });
  setTimeout(() => map.invalidateSize(), 60);

  activeMaps.push(map);
}
