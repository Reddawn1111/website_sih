import { activeRepository } from "./data/repository.js";
import { renderShell } from "./ui.js";

const state = {
  route: "dashboard",
  region: "All Regions",
  dateRange: "Last 7 days",
  category: "All Categories",
  crowd: "All Crowd Levels",
  selectedDestination: "central-heritage",
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

function render() {
  document.getElementById("app").innerHTML = renderShell(state, data);
  bindEvents();
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
      state.route = "destinations";
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
