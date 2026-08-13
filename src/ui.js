import {
  categoryDistribution,
  destinationRecommendation,
  joinPlacesWithStats,
  keyInsights,
  kpis,
  tourismOpportunities
} from "./services/intelligenceService.js";
import { buildActionCenter, destinationHealth, groupedActions, simulateImpact } from "./services/actionEngine.js";
import { DATA_SOURCE, MIN_AGGREGATION_THRESHOLD } from "./data/demoData.js";
import { displayValue, privacySummary } from "./services/privacyService.js";

const routeLabels = {
  dashboard: "Dashboard",
  actionCenter: "Action Center",
  tourism: "Tourism Intelligence",
  crowd: "Crowd Management",
  opportunities: "Tourism Opportunities",
  mobility: "Mobility & Roads",
  safety: "Safety & Risk",
  recommendations: "Recommendations",
  destinations: "Destinations",
  privacy: "Data & Privacy"
};

export function renderShell(state, data) {
  const nav = Object.entries(routeLabels).map(([route, label]) =>
    `<button class="${state.route === route ? "active" : ""}" data-route="${route}">${label}<span>›</span></button>`
  ).join("");

  return `
    <div class="app-shell ${state.presentation ? "presentation" : ""}">
      <aside class="sidebar">
        <div class="brand">
          <strong>TripSafe Tourism Intelligence</strong>
          <span>Tourism • Mobility • Crowd • Safety Intelligence</span>
          <span class="demo-pill">DEMO DATA — Prototype</span>
        </div>
        <nav class="nav">${nav}</nav>
      </aside>
      <main class="main">
        ${renderHeader(state)}
        ${renderRoute(state, data)}
      </main>
    </div>
  `;
}

function renderHeader(state) {
  return `
    <section class="topbar">
      <div>
        <h1>TripSafe Tourism Intelligence</h1>
        <p>Government command-center dashboard for anonymised tourism, crowd, mobility and risk intelligence.</p>
        <div class="chips">
          <span class="source-pill">${DATA_SOURCE}</span>
          <span class="chip">Region: ${state.region}</span>
          <span class="chip">Date range: ${state.dateRange}</span>
          <span class="chip">Freshness: 12 min ago</span>
        </div>
      </div>
      <div class="controls">
        <label class="control">Region
          <select data-filter="region">
            ${["All Regions", "Bengaluru", "Coastal Karnataka", "Hill Corridor"].map((item) => `<option ${state.region === item ? "selected" : ""}>${item}</option>`).join("")}
          </select>
        </label>
        <label class="control">Date range
          <select data-filter="dateRange">
            ${["Today", "Last 7 days", "Festival week"].map((item) => `<option ${state.dateRange === item ? "selected" : ""}>${item}</option>`).join("")}
          </select>
        </label>
        <label class="control">Category
          <select data-filter="category">
            ${["All Categories", "Heritage", "Entertainment", "Park", "Market", "Restaurant", "Beach", "Viewpoint", "Nature"].map((item) => `<option ${state.category === item ? "selected" : ""}>${item}</option>`).join("")}
          </select>
        </label>
        <label class="control">Crowd
          <select data-filter="crowd">
            ${["All Crowd Levels", "low", "moderate", "high", "critical"].map((item) => `<option ${state.crowd === item ? "selected" : ""}>${item}</option>`).join("")}
          </select>
        </label>
        <button class="toggle" data-toggle-presentation>${state.presentation ? "Exit Presentation Mode" : "Presentation Mode"}</button>
      </div>
    </section>
  `;
}

function filteredData(state, data) {
  const placesWithStats = joinPlacesWithStats(data.places, data.stats)
    .filter((place) => state.region === "All Regions" || place.region === state.region)
    .filter((place) => state.category === "All Categories" || place.category === state.category)
    .filter((place) => state.crowd === "All Crowd Levels" || place.stat.crowdLevel === state.crowd);

  return {
    ...data,
    placesWithStats,
    risks: data.risks.filter((risk) => placesWithStats.some((place) => place.id === risk.placeId)),
    mobility: data.mobility.filter((item) => item.connectedPlaceIds.some((id) => placesWithStats.some((place) => place.id === id))),
    recommendations: data.recommendations.filter((item) => !item.placeId || placesWithStats.some((place) => place.id === item.placeId))
  };
}

function renderRoute(state, rawData) {
  const data = filteredData(state, rawData);
  if (!data.placesWithStats.length) {
    return renderEmptyState();
  }
  const routes = {
    dashboard: renderDashboard,
    tourism: renderTourism,
    crowd: renderCrowd,
    opportunities: renderOpportunities,
    mobility: renderMobility,
    safety: renderSafety,
    recommendations: renderRecommendations,
    destinations: renderDestinations,
    actionCenter: renderActionCenter,
    privacy: renderPrivacy
  };
  return routes[state.route](state, data);
}

function renderEmptyState() {
  return `
    <section class="grid">
      <section class="card pad span-12">
        <h2>Insufficient aggregated data</h2>
        <p>No destination-level aggregate meets the current filter combination. Adjust region, category or crowd filters to view demo insights.</p>
      </section>
    </section>
  `;
}

function renderDashboard(state, data) {
  const insightItems = keyInsights(data.placesWithStats, data.risks, data.mobility).map((text) => `<div class="insight">${text}</div>`).join("");
  const actions = buildActionCenter(data.placesWithStats, data.risks, data.mobility);
  return `
    <section class="grid">
      ${kpis(data.placesWithStats, data.risks).map(renderKpi).join("")}
      <section class="card pad span-5">
        <h2>Key Insights</h2>
        <div class="insight-list">${insightItems}</div>
      </section>
      <section class="card span-7">${renderMap(state, data)}</section>
      <section class="card pad span-6">${renderLineChart("Visits over time", data.visitsOverTime, "Visits")}</section>
      <section class="card pad span-6">${renderHourlyCurve(data.hourlyCurve)}</section>
      <section class="card pad span-12">${renderActionSummary(actions)}</section>
      <section class="card pad span-12">${renderImpactSimulator(state, data)}</section>
      <section class="card pad span-12 secondary-only">
        <h2>Recommended Authority Actions</h2>
        <div class="recommendation-list">${actions.slice(0, 4).map(renderActionCard).join("")}</div>
      </section>
    </section>
  `;
}

function renderActionSummary(actions) {
  return `
    <h2>Action Center Snapshot</h2>
    <p>Tourism Data -> Decision Support. Each item follows Observation -> Evidence -> Problem/Opportunity -> Recommended Action -> Priority -> Expected Impact.</p>
    <div class="action-summary">
      ${groupedActions(actions).map((group) => `
        <div class="action-count priority-${group.priority}">
          <span>${group.label}</span>
          <strong>${group.actions.length}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function renderKpi(item) {
  const tone = item.tone ? `status-${item.tone}` : "";
  return `
    <article class="card pad span-4">
      <div class="label">${item.label}</div>
      <div class="kpi-value ${tone}">${item.value}</div>
      <div class="delta">${item.delta}</div>
    </article>
  `;
}

function renderTourism(state, data) {
  const categories = categoryDistribution(data.placesWithStats);
  return `
    <section class="grid">
      <section class="card pad span-6">${renderLineChart("Visits over time", data.visitsOverTime, "Visits")}</section>
      <section class="card pad span-6">${renderBars("Popular activity categories", categories, "visits")}</section>
      <section class="card pad span-6">${renderHourlyCurve(data.hourlyCurve)}</section>
      <section class="card pad span-6">${renderDestinationRanking(data.placesWithStats)}</section>
      <section class="card pad span-12">
        <h2>Destination Intelligence</h2>
        <div class="destination-list">${data.placesWithStats.map(renderDestinationRow).join("")}</div>
      </section>
    </section>
  `;
}

function renderCrowd(state, data) {
  const hot = [...data.placesWithStats].sort((a, b) => b.stat.visitCount / b.capacity - a.stat.visitCount / a.capacity);
  const actions = buildActionCenter(data.placesWithStats, data.risks, data.mobility).filter((item) => item.category === "Crowd Management");
  return `
    <section class="grid">
      <section class="card span-7">${renderMap(state, data)}</section>
      <section class="card pad span-5">
        <h2>Where People Are Concentrating</h2>
        <div class="recommendation-list">
          ${hot.slice(0, 5).map((place) => `
            <div class="insight">
              <strong>${place.name}</strong>
              <span class="muted">Peak: ${place.stat.peakHour} • Crowd: ${place.stat.crowdLevel.toUpperCase()}</span>
              <span>${destinationRecommendation(place)}</span>
            </div>
          `).join("")}
        </div>
      </section>
      <section class="card pad span-12">
        <h2>Actionable Crowd Recommendations</h2>
        <div class="recommendation-list">${actions.map(renderActionCard).join("")}</div>
      </section>
    </section>
  `;
}

function renderOpportunities(state, data) {
  return `
    <section class="grid">
      <section class="card pad span-12">
        <h2>Under-Visited But High-Potential Places</h2>
        <div class="destination-list">
          ${tourismOpportunities(data.placesWithStats).map((place) => `
            <div class="destination-row" data-destination="${place.id}">
              <strong>${place.name}</strong>
              <span>Rating ${place.rating}</span>
              <span>${place.stat.visitCount.toLocaleString("en-IN")} visits</span>
              <span>${place.stat.averageDwellMinutes} min dwell</span>
              <span class="status-${place.stat.crowdLevel}">${place.stat.crowdLevel}</span>
              <span>${place.opportunityScore}/100 score</span>
              <span>${promotionText(place, data.placesWithStats)}</span>
            </div>
          `).join("")}
        </div>
      </section>
    </section>
  `;
}

function renderMobility(state, data) {
  const infraActions = buildActionCenter(data.placesWithStats, data.risks, data.mobility)
    .filter((item) => item.category === "Infrastructure" || item.category === "Facility Improvement");
  return `
    <section class="grid">
      <section class="card pad span-12">
        <h2>Tourism Mobility Hotspots</h2>
        <p>Data-driven recommendation - field validation required. These are potential infrastructure priorities, not confirmed engineering conclusions.</p>
        <div class="recommendation-list">
          ${data.mobility.map((item) => `
            <div class="recommendation">
              <span class="status-pill">${item.pressurePercent}% pressure</span>
              <div>
                <strong>${item.corridorName}</strong>
                <p>Peak: ${item.peakWindow}. ${item.recommendation}</p>
              </div>
            </div>
          `).join("")}
        </div>
      </section>
      <section class="card pad span-12">
        <h2>Road, Pedestrian, Parking & Facility Actions</h2>
        <div class="recommendation-list">${infraActions.map(renderActionCard).join("")}</div>
      </section>
    </section>
  `;
}

function renderSafety(state, data) {
  const safetyActions = buildActionCenter(data.placesWithStats, data.risks, data.mobility).filter((item) => item.category === "Safety & Risk");
  return `
    <section class="grid">
      <section class="card pad span-12">
        <h2>Safety & Risk Intelligence</h2>
        <p>Advisory demo insights only. These are not emergency guarantees.</p>
        <div class="recommendation-list">
          ${data.risks.map((risk) => {
            const place = data.placesWithStats.find((item) => item.id === risk.placeId);
            return `
              <div class="recommendation">
                <span class="status-pill status-${risk.level}">${risk.level.toUpperCase()}</span>
                <div>
                  <strong>${place?.name || risk.placeId}</strong>
                  <p>${risk.reason}. Affected activity: ${risk.affectedActivity}. Recommendation: ${risk.suggestedResponse}</p>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </section>
      <section class="card pad span-12">
        <h2>Safety & Risk Actions</h2>
        <div class="recommendation-list">${safetyActions.map(renderActionCard).join("")}</div>
      </section>
    </section>
  `;
}

function renderRecommendations(state, data) {
  const actions = buildActionCenter(data.placesWithStats, data.risks, data.mobility);
  return `
    <section class="grid">
      <section class="card pad span-12">
        <h2>Transparent Recommendation Engine</h2>
        <p>Rules combine crowd pressure, visit trend, dwell time, destination popularity, risk level, alternatives and mobility pressure.</p>
        <div class="recommendation-list">${data.recommendations.map(renderRecommendation).join("")}</div>
      </section>
      <section class="card pad span-12">
        <h2>Explainable Priority Ranking</h2>
        <div class="recommendation-list">${actions.map(renderActionCard).join("")}</div>
      </section>
    </section>
  `;
}

function renderDestinations(state, data) {
  const selected = data.placesWithStats.find((place) => place.id === state.selectedDestination) || data.placesWithStats[0];
  return `
    <section class="grid">
      <section class="card pad span-5">
        <h2>Destinations</h2>
        <div class="destination-list">${data.placesWithStats.map(renderDestinationRow).join("")}</div>
      </section>
      <section class="card pad span-7">${renderDestinationDetail(selected, data)}</section>
    </section>
  `;
}

function renderActionCenter(state, data) {
  const actions = buildActionCenter(data.placesWithStats, data.risks, data.mobility);
  return `
    <section class="grid">
      <section class="card pad span-12">
        <h2>Action Center</h2>
        <p>Actionable tourism and infrastructure intelligence. Every recommendation is demo-only and requires field validation before implementation.</p>
        ${renderActionSummary(actions)}
      </section>
      <section class="card pad span-12">${renderImpactSimulator(state, data)}</section>
      ${groupedActions(actions).map((group) => `
        <section class="card pad span-12">
          <h2>${group.label}</h2>
          <div class="recommendation-list">${group.actions.length ? group.actions.map(renderActionCard).join("") : "<p>No matching recommendations in the current filters.</p>"}</div>
        </section>
      `).join("")}
    </section>
  `;
}

function renderPrivacy() {
  return `
    <section class="grid">
      <section class="card pad span-12">
        <h2>Data & Privacy</h2>
        <p>This prototype uses synthetic demo data. Future live data must always carry an explicit source indicator.</p>
        <div class="privacy-rules">${privacySummary().map((item) => `<div>${item}</div>`).join("")}</div>
        <p style="margin-top:16px">Minimum aggregation threshold: <strong>${MIN_AGGREGATION_THRESHOLD}</strong> contributors/events. If the threshold is not met, the interface displays <strong>Insufficient aggregated data</strong>.</p>
      </section>
    </section>
  `;
}

function renderRecommendation(item) {
  return `
    <div class="recommendation">
      <span class="status-pill status-${item.priority === "high" ? "critical" : "high"}">${item.priority.toUpperCase()}</span>
      <div>
        <strong>${item.problem}</strong>
        <p>Evidence: ${item.evidence}</p>
        <p>Action: ${item.action}</p>
        <p>Objective: ${item.objective}</p>
      </div>
    </div>
  `;
}

function renderActionCard(item) {
  return `
    <article class="action-card priority-${item.priority}">
      <div>
        <span class="status-pill">${item.priority.toUpperCase()}</span>
        <span class="score-pill">Priority Score: ${item.priorityScore}/100</span>
      </div>
      <div>
        <h3>${item.title}</h3>
        <div class="chips">
          <span class="chip">Location: ${item.location}</span>
          <span class="chip">Category: ${item.category}</span>
          <span class="chip">Confidence: ${item.dataConfidence}</span>
          <span class="chip">Status: ${item.fieldValidationStatus}</span>
        </div>
        <p><strong>Evidence:</strong></p>
        <ul>${item.evidence.map((point) => `<li>${point}</li>`).join("")}</ul>
        <p><strong>Recommended action:</strong> ${item.recommendedAction}</p>
        <p><strong>Expected impact:</strong> ${item.expectedImpact}</p>
        <p><strong>Score explanation:</strong> ${item.scoreExplanation}</p>
      </div>
    </article>
  `;
}

function renderDestinationRow(place) {
  return `
    <div class="destination-row" data-destination="${place.id}">
      <strong>${place.name}</strong>
      <span>${place.category}</span>
      <span>${displayValue(place.stat, place.stat.visitCount.toLocaleString("en-IN"))}</span>
      <span>${place.stat.averageDwellMinutes} min</span>
      <span>${place.stat.peakHour}</span>
      <span class="status-${place.stat.crowdLevel}">${place.stat.crowdLevel.toUpperCase()}</span>
      <span>${destinationRecommendation(place)}</span>
    </div>
  `;
}

function renderDestinationDetail(place, data) {
  const alternatives = place.alternatives.map((id) => data.placesWithStats.find((item) => item.id === id)?.name).filter(Boolean).join(", ");
  const risk = data.risks.find((item) => item.placeId === place.id);
  const mobility = data.mobility.find((item) => item.connectedPlaceIds.includes(place.id));
  const health = destinationHealth(place, data.risks, data.mobility);
  return `
    <h2>${place.name}</h2>
    <div class="detail-layout">
      <div>
        <div class="chips">
          <span class="chip">${place.category}</span>
          <span class="chip">Rating ${place.rating}</span>
          <span class="chip">Crowd ${place.stat.crowdLevel}</span>
          <span class="chip">Trend ${place.stat.trendPercent > 0 ? "+" : ""}${place.stat.trendPercent}%</span>
        </div>
        <div class="health-panel">
          <div class="kpi-value">${health.score}/100</div>
          <strong>Destination Health</strong>
          <p>Transparent score from visitation, trend, dwell time, rating, crowd pressure, risk and infrastructure signals.</p>
          <div class="health-grid">
            <div><span class="label">Good</span>${health.good.map((item) => `<p>${item}</p>`).join("")}</div>
            <div><span class="label">Warning</span>${health.warning.map((item) => `<p>${item}</p>`).join("")}</div>
            <div><span class="label">Opportunity</span>${health.opportunity.map((item) => `<p>${item}</p>`).join("")}</div>
          </div>
        </div>
        ${renderHourlyCurve(data.hourlyCurve)}
      </div>
      <div class="recommendation-list">
        <div class="insight"><strong>Crowd Management</strong><span>${destinationRecommendation(place)}</span></div>
        <div class="insight"><strong>Promotion</strong><span>${place.stat.visitCount < 3000 ? "Promote as hidden gem." : "Use timed promotion to distribute peaks."}</span></div>
        <div class="insight"><strong>Infrastructure</strong><span>${mobility ? mobility.recommendation : "No high mobility priority in demo data."}</span></div>
        <div class="insight"><strong>Safety</strong><span>${risk ? risk.suggestedResponse : "No elevated advisory risk in demo data."}</span></div>
        <div class="insight"><strong>Nearby alternatives</strong><span>${alternatives || "No alternatives configured."}</span></div>
      </div>
    </div>
  `;
}

function promotionText(place, placesWithStats) {
  const alternatives = place.alternatives
    .map((id) => placesWithStats.find((candidate) => candidate.id === id))
    .filter(Boolean);
  const pressured = alternatives.find((candidate) => candidate.stat.crowdLevel === "high" || candidate.stat.crowdLevel === "critical");
  if (place.stat.visitCount < 3000 && place.rating >= 4.6) {
    return pressured
      ? `Promote during ${place.stat.peakHour} to distribute demand away from ${pressured.name}.`
      : `Promote during ${place.stat.peakHour}; improve wayfinding and signage.`;
  }
  return "Balanced promotion candidate; tune messaging by peak period.";
}

function renderImpactSimulator(state, data) {
  const result = simulateImpact(state.scenario, data.placesWithStats);
  return `
    <h2>What If We Act?</h2>
    <p><strong>SIMULATED DEMO OUTCOME.</strong> This is a lightweight scenario model, not a real prediction.</p>
    <div class="simulator">
      <label class="control">Intervention
        <select data-filter="scenario">
          ${[
            ["promote", "Promote alternative destination"],
            ["parking", "Increase parking"],
            ["shuttle", "Add shuttle"],
            ["signage", "Improve signage"],
            ["redirect", "Redirect visitors"],
            ["pedestrian", "Improve pedestrian infrastructure"]
          ].map(([value, label]) => `<option value="${value}" ${state.scenario === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </label>
      <div class="sim-result">
        <div>
          <span class="label">Current</span>
          <strong>${result.primaryName}</strong>
          <div class="kpi-value">${result.currentPrimary.toLocaleString("en-IN")}</div>
        </div>
        <div>
          <span class="label">Projected</span>
          <strong>${result.primaryName}</strong>
          <div class="kpi-value">${result.projectedPrimary.toLocaleString("en-IN")}</div>
        </div>
        <div>
          <span class="label">Alternative gain</span>
          <strong>${result.alternativeName}</strong>
          <div class="kpi-value">+${result.shiftedVisits.toLocaleString("en-IN")}</div>
        </div>
      </div>
      <p>Scenario: ${result.scenarioLabel}. Expected demo benefit: ${result.impactType}.</p>
    </div>
  `;
}

function renderMap(state, data) {
  const zones = data.placesWithStats.map((place, index) => {
    const x = 90 + ((index * 83) % 710);
    const y = 70 + ((index * 117) % 290);
    const radius = Math.max(18, Math.min(46, place.stat.visitCount / 320));
    return `<circle class="zone ${place.stat.crowdLevel}" cx="${x}" cy="${y}" r="${radius}" data-destination="${place.id}"><title>${place.name}: ${place.stat.crowdLevel}</title></circle>
      <text x="${x + radius + 6}" y="${y + 4}" fill="#dff8ff" font-size="12">${place.name}</text>`;
  }).join("");
  const selected = data.placesWithStats.find((place) => place.id === state.selectedDestination) || data.placesWithStats[0];
  return `
    <div class="map-wrap">
      <svg class="map" viewBox="0 0 900 430" role="img" aria-label="Aggregated synthetic crowd density map">
        <path d="M70 300 C180 210, 250 260, 350 185 S560 160, 640 84 S780 80, 835 130" fill="none" stroke="rgba(33,212,215,.3)" stroke-width="10" stroke-linecap="round"/>
        <path d="M120 90 C250 140, 320 90, 420 130 S590 230, 770 210" fill="none" stroke="rgba(147,197,253,.16)" stroke-width="18" stroke-linecap="round"/>
        ${zones}
      </svg>
      <div class="map-panel">
        <div class="label">Aggregated crowd density, not individual people</div>
        <h3>${selected.name}</h3>
        <p>Crowd: <strong class="status-${selected.stat.crowdLevel}">${selected.stat.crowdLevel.toUpperCase()}</strong> • Peak: ${selected.stat.peakHour}</p>
        <p>${destinationRecommendation(selected)}</p>
        <div class="chips">
          <span class="chip">Green low</span><span class="chip">Yellow moderate</span><span class="chip">Orange high</span><span class="chip">Red critical</span>
        </div>
      </div>
    </div>
  `;
}

function renderLineChart(title, series, unit) {
  const max = Math.max(...series.map((item) => item[1]));
  const points = series.map((item, index) => {
    const x = 40 + index * (520 / Math.max(1, series.length - 1));
    const y = 180 - (item[1] / max) * 140;
    return `${x},${y}`;
  }).join(" ");
  return `
    <h2>${title}</h2>
    <svg class="chart" viewBox="0 0 620 230" role="img" aria-label="${title}">
      <polyline points="${points}" fill="none" stroke="#21d4d7" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      ${series.map((item, index) => {
        const x = 40 + index * (520 / Math.max(1, series.length - 1));
        const y = 180 - (item[1] / max) * 140;
        return `<circle cx="${x}" cy="${y}" r="5" fill="#2dd4bf"/><text x="${x - 14}" y="210" fill="#9fb8cc" font-size="12">${item[0]}</text>`;
      }).join("")}
      <text x="40" y="24" fill="#9fb8cc" font-size="12">${unit}</text>
    </svg>
  `;
}

function renderHourlyCurve(curve) {
  const series = curve.map((value, hour) => [`${hour}:00`, value]);
  return renderLineChart("Peak visiting hours", series.filter((_, index) => index % 2 === 0), "Crowd index");
}

function renderBars(title, items, unit) {
  const max = Math.max(...items.map((item) => item.value));
  return `
    <h2>${title}</h2>
    <div class="bars">
      ${items.map((item) => `
        <div class="bar-row">
          <span>${item.label}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${Math.round((item.value / max) * 100)}%"></div></div>
          <span>${unit === "visits" ? item.value.toLocaleString("en-IN") : item.value}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderDestinationRanking(placesWithStats) {
  const items = [...placesWithStats]
    .sort((a, b) => b.stat.visitCount - a.stat.visitCount)
    .slice(0, 8)
    .map((place) => ({ label: place.name, value: place.stat.visitCount }));
  return renderBars("Destination ranking", items, "visits");
}
