// Home page visitor map: one marker per place, sized by visits, drawn with Plotly (scattergeo).
// Data comes from the Worker in visitor-map-worker/, which only answers https://wentaopoly.github.io.

(function () {
  const box = document.querySelector("[data-visitor-map]");
  const status = box.querySelector("[data-visitor-map-status]");
  const dark = window.matchMedia("(prefers-color-scheme: dark)");
  let rows = [];

  function draw() {
    const css = getComputedStyle(document.documentElement);
    const color = (name) => css.getPropertyValue(name).trim();
    const trace = {
      type: "scattergeo",
      mode: "markers",
      lat: rows.map((row) => Number(row.latitude)),
      lon: rows.map((row) => Number(row.longitude)),
      text: rows.map((row) => row.city || row.country || ""),
      customdata: rows.map((row) => row.visits),
      hovertemplate: "<b>%{text}</b><br>" + box.dataset.labelVisits + ": %{customdata}<extra></extra>",
      marker: {
        size: rows.map((row) => Math.max(10, Math.min(30, 8 + Math.sqrt(Number(row.visits || 1)) * 4))),
        color: color("--accent"),
        opacity: 0.85,
        line: { width: 1.5, color: color("--bg") },
      },
    };
    const water = dark.matches ? "#111827" : "#f8fbff";
    const layout = {
      margin: { l: 0, r: 0, t: 0, b: 0 },
      paper_bgcolor: "transparent",
      plot_bgcolor: "transparent",
      font: { color: color("--text") },
      geo: {
        scope: "world",
        projection: { type: "natural earth" },
        showframe: false,
        showcoastlines: false,
        showland: true,
        landcolor: dark.matches ? "#1f2a37" : "#eef3f8",
        showocean: true,
        oceancolor: water,
        showcountries: true,
        countrycolor: color("--rule"),
        lakecolor: water,
        bgcolor: "transparent",
      },
    };
    Plotly.react(box.querySelector("[data-visitor-map-canvas]"), [trace], layout, { displayModeBar: false, responsive: true });
  }

  const { apiUrl } = window.visitorMapConfig;
  fetch(apiUrl + "/api/visitors?limit=150&days=3650", { mode: "cors" })
    .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
    .then(({ visitors }) => {
      rows = visitors.filter((row) => Number.isFinite(Number(row.latitude)) && Number.isFinite(Number(row.longitude)));
      if (!rows.length) {
        status.textContent = box.dataset.textEmpty;
        return;
      }
      draw();
      status.remove();
      dark.addEventListener("change", draw);
    })
    .catch(() => {
      status.textContent = box.dataset.textError;
    });
})();
