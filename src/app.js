import { activeRepository } from "./data/repository.js";
import { renderShell, destroyLeafletMaps, initializeLeafletMaps } from "./ui.js";
import { joinPlacesWithStats } from "./services/intelligenceService.js";
import { deriveMobilityMetrics } from "./services/mobilityService.js";
import { buildActionCenter } from "./services/actionEngine.js";

const state = {
  route: "dashboard",
  region: "All Regions",
  dateRange: "Last 7 days",
  category: "All Categories",
  crowd: "All Crowd Levels",
  selectedDestination: "central-heritage",
  scenario: "promote",
  presentation: false
};

const data = {
  places: await activeRepository.getPlaces(),
  stats: await activeRepository.getAggregatedPlaceStats(),
  risks: await activeRepository.getRiskSignals(),
  mobility: await activeRepository.getMobilityInsights(),
  recommendations: await activeRepository.getRecommendations(),
  visitsOverTime: await activeRepository.getVisitsOverTime(),
  hourlyCurve: await activeRepository.getHourlyCurve()
};

function filteredContext() {
  const placesWithStats = joinPlacesWithStats(data.places, data.stats)
    .filter((place) => state.region === "All Regions" || place.region === state.region)
    .filter((place) => state.category === "All Categories" || place.category === state.category)
    .filter((place) => state.crowd === "All Crowd Levels" || place.stat.crowdLevel === state.crowd);
  const mobility = deriveMobilityMetrics(data.mobility)
    .filter((item) => item.connectedPlaceIds.some((id) => placesWithStats.some((place) => place.id === id)));
  const risks = data.risks.filter((risk) => placesWithStats.some((place) => place.id === risk.placeId));
  const actions = buildActionCenter(placesWithStats, risks, mobility);
  const selected = placesWithStats.find((place) => place.id === state.selectedDestination) || placesWithStats[0];
  if (selected && selected.id !== state.selectedDestination) {
    state.selectedDestination = selected.id;
  }
  return { placesWithStats, mobility, risks, actions, selected };
}

function selectDestination(destinationId) {
  state.selectedDestination = destinationId;
  render();
}

function render() {
  destroyLeafletMaps();
  document.getElementById("app").innerHTML = renderShell(state, data);
  bindEvents();

  const context = filteredContext();
  if (context.placesWithStats.length) {
    initializeLeafletMaps(state, { ...data, ...context }, selectDestination);
    focusSelectedDestination();
  }
}

function focusSelectedDestination() {
  const selectedRow = document.querySelector(`.destination-row[data-destination="${state.selectedDestination}"]`);
  selectedRow?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  document.getElementById("destination-detail")?.focus({ preventScroll: true });
}

function bindEvents() {
  document.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => {
      state.route = button.dataset.route;
      render();
    });
  });

  document.querySelectorAll("[data-destination]").forEach((item) => {
    item.addEventListener("click", () => {
      state.selectedDestination = item.dataset.destination;
      if (item.classList.contains("destination-row")) {
        state.route = "destinations";
      }
      render();
    });
  });

  document.querySelectorAll("[data-filter]").forEach((field) => {
    field.addEventListener("change", () => {
      state[field.dataset.filter] = field.value;
      render();
    });
  });

  document.querySelector("[data-toggle-presentation]")?.addEventListener("click", () => {
    state.presentation = !state.presentation;
    state.route = "dashboard";
    render();
  });
}

render();
