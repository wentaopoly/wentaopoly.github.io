(function () {
  function shouldSkipTracking() {
    if (typeof window === "undefined") return true;
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") return true;
    if (window.navigator.webdriver) return true;

    const dnt = window.navigator.doNotTrack || window.doNotTrack || window.navigator.msDoNotTrack;
    return dnt === "1" || dnt === "yes";
  }

  function getConfig() {
    return window.visitorMapConfig || {};
  }

  function getStorageKey(apiUrl) {
    return "visitor-map:last-sent:" + apiUrl;
  }

  function recentlyTracked(apiUrl, trackIntervalHours) {
    try {
      const raw = window.localStorage.getItem(getStorageKey(apiUrl));
      if (!raw) return false;

      const lastSentAt = Number(raw);
      if (!Number.isFinite(lastSentAt)) return false;

      return Date.now() - lastSentAt < trackIntervalHours * 60 * 60 * 1000;
    } catch (_error) {
      return false;
    }
  }

  function markTracked(apiUrl) {
    try {
      window.localStorage.setItem(getStorageKey(apiUrl), String(Date.now()));
    } catch (_error) {
      // Ignore storage failures in privacy-focused browsers.
    }
  }

  function buildPayload() {
    return {
      path: window.location.pathname,
      referrer: document.referrer || "",
      language: window.navigator.language || "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      title: document.title || "",
    };
  }

  function sendVisit(apiUrl, payload) {
    const endpoint = apiUrl.replace(/\/+$/, "") + "/api/visit";
    const body = JSON.stringify(payload);

    if (window.navigator.sendBeacon) {
      const blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
      const accepted = window.navigator.sendBeacon(endpoint, blob);

      if (accepted) {
        markTracked(apiUrl);
        return;
      }
    }

    fetch(endpoint, {
      method: "POST",
      mode: "cors",
      cache: "no-store",
      keepalive: true,
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
      },
      body,
    })
      .then((response) => {
        if (response.ok) {
          markTracked(apiUrl);
        }
      })
      .catch(() => {
        // Tracking should never interfere with page behavior.
      });
  }

  function initTracker() {
    const config = getConfig();
    const apiUrl = (config.apiUrl || "").trim();
    const trackIntervalHours = Number(config.trackIntervalHours || 6);

    if (!apiUrl || shouldSkipTracking() || recentlyTracked(apiUrl, trackIntervalHours)) {
      return;
    }

    sendVisit(apiUrl, buildPayload());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTracker, { once: true });
  } else {
    initTracker();
  }
})();
