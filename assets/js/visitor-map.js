(function () {
  function getConfig() {
    return window.visitorMapConfig || {};
  }

  function setStatus(section, message, state) {
    const node = section.querySelector("[data-visitor-map-status]");
    if (!node) return;

    node.textContent = message;
    node.dataset.state = state || "info";
  }

  function getThemeColors() {
    const styles = getComputedStyle(document.documentElement);

    return {
      background: styles.getPropertyValue("--global-bg-color").trim() || "#ffffff",
      text: styles.getPropertyValue("--global-text-color").trim() || "#111111",
      muted: styles.getPropertyValue("--global-text-color-light").trim() || "#7a7a7a",
      divider: styles.getPropertyValue("--global-divider-color").trim() || "#d9d9d9",
      accent: styles.getPropertyValue("--global-theme-color").trim() || "#1f77b4",
      card: styles.getPropertyValue("--global-card-bg-color").trim() || "#ffffff",
      dark: document.documentElement.getAttribute("data-theme") === "dark",
    };
  }

  function markerSize(visits) {
    return Math.max(10, Math.min(30, 8 + Math.sqrt(Number(visits || 1)) * 4));
  }

  function buildTrace(rows, colors) {
    return {
      type: "scattergeo",
      mode: "markers",
      lat: rows.map((row) => Number(row.latitude)),
      lon: rows.map((row) => Number(row.longitude)),
      text: rows.map((row) => row.city || "Unknown"),
      customdata: rows.map((row) => [row.visits]),
      hovertemplate: "<b>%{text}</b><br>Visits: %{customdata[0]}<extra></extra>",
      marker: {
        size: rows.map((row) => markerSize(row.visits)),
        color: colors.accent,
        opacity: 0.85,
        line: {
          width: 1.5,
          color: colors.card,
        },
      },
    };
  }

  function buildLayout(colors) {
    return {
      margin: { l: 0, r: 0, t: 0, b: 0 },
      paper_bgcolor: "transparent",
      plot_bgcolor: "transparent",
      font: { color: colors.text },
      geo: {
        scope: "world",
        projection: { type: "natural earth" },
        showframe: false,
        showcoastlines: false,
        showland: true,
        landcolor: colors.dark ? "#1f2a37" : "#eef3f8",
        showocean: true,
        oceancolor: colors.dark ? "#111827" : "#f8fbff",
        showcountries: true,
        countrycolor: colors.divider,
        lakecolor: colors.dark ? "#111827" : "#f8fbff",
        bgcolor: "transparent",
      },
    };
  }

  function renderMap(section, rows) {
    const target = section.querySelector("[data-visitor-map-canvas]");
    if (!target || !window.Plotly) return;

    const validRows = rows.filter((row) => Number.isFinite(Number(row.latitude)) && Number.isFinite(Number(row.longitude)));

    if (validRows.length === 0) {
      setStatus(section, "No geolocated visitors yet.", "empty");
      return;
    }

    const colors = getThemeColors();
    const config = {
      displayModeBar: false,
      responsive: true,
    };

    Plotly.react(target, [buildTrace(validRows, colors)], buildLayout(colors), config);
    setStatus(section, "", "ready");
  }

  async function fetchPayload(section) {
    const config = getConfig();
    const apiUrl = (section.dataset.apiUrl || config.apiUrl || "").trim();

    if (!apiUrl) {
      setStatus(section, "Set `visitor_map.api_url` in `_config.yml` to enable the map.", "setup");
      return null;
    }

    const url = new URL(apiUrl.replace(/\/+$/, "") + "/api/visitors");
    url.searchParams.set("limit", String(section.dataset.limit || config.maxLocations || 150));
    url.searchParams.set("days", String(section.dataset.days || config.windowDays || 3650));

    const response = await fetch(url.toString(), {
      method: "GET",
      mode: "cors",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Visitor map API returned " + response.status);
    }

    return response.json();
  }

  function bindThemeRefresh(section, rows) {
    if (section._visitorMapObserver) return;

    const observer = new MutationObserver(() => {
      if (window.Plotly) {
        renderMap(section, rows);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    section._visitorMapObserver = observer;
  }

  async function initVisitorMap() {
    const section = document.querySelector("[data-visitor-map]");
    if (!section) return;

    try {
      const payload = await fetchPayload(section);
      if (!payload) return;

      const visitors = payload.visitors || [];

      if (!window.Plotly) {
        setStatus(section, "Plotly did not load, so the map could not render.", "error");
        return;
      }

      renderMap(section, visitors);
      bindThemeRefresh(section, visitors);
    } catch (error) {
      setStatus(section, "Could not load visitor data right now.", "error");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initVisitorMap, { once: true });
  } else {
    initVisitorMap();
  }
})();
