const searchConfig = window.siteSearchConfig || {};
let searchBootstrapPromise;

function getShortcutLabel() {
  const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
  return isMac ? "⌘ K" : "Ctrl K";
}

function updateSearchTriggerLabel() {
  const trigger = document.querySelector("[data-search-shortcut]");
  if (!trigger) return;

  trigger.innerHTML = `${getShortcutLabel()} <i class="fa-solid fa-magnifying-glass"></i>`;
}

function applySearchTheme(ninjaKeys) {
  if (!ninjaKeys) return;

  if (determineComputedTheme() === "dark") {
    ninjaKeys.classList.add("dark");
  } else {
    ninjaKeys.classList.remove("dark");
  }
}

function ensureNinjaKeysElement() {
  let ninjaKeys = document.querySelector("ninja-keys");
  if (ninjaKeys) return ninjaKeys;

  ninjaKeys = document.createElement("ninja-keys");
  ninjaKeys.setAttribute("hideBreadcrumbs", "");
  ninjaKeys.setAttribute("noAutoLoadMdIcons", "");
  ninjaKeys.setAttribute("placeholder", searchConfig.placeholder || "Type to start searching");
  document.body.append(ninjaKeys);
  return ninjaKeys;
}

function loadClassicScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-search-script="${src}"]`);

    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }

      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.dataset.searchScript = src;
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true }
    );
    script.addEventListener("error", reject, { once: true });
    document.body.append(script);
  });
}

async function ensureSearchReady() {
  if (!searchBootstrapPromise) {
    searchBootstrapPromise = (async () => {
      const ninjaKeys = ensureNinjaKeysElement();

      await import(searchConfig.ninjaModuleUrl);
      await customElements.whenDefined("ninja-keys");
      await loadClassicScript(searchConfig.searchDataUrl);

      ninjaKeys.data = window.__siteSearchData || [];
      applySearchTheme(ninjaKeys);
      return ninjaKeys;
    })().catch((error) => {
      searchBootstrapPromise = null;
      throw error;
    });
  }

  return searchBootstrapPromise;
}

async function openSearchModal() {
  const $navbarNav = $("#navbarNav");
  if ($navbarNav.hasClass("show")) {
    $navbarNav.collapse("hide");
  }

  const ninjaKeys = await ensureSearchReady();
  applySearchTheme(ninjaKeys);
  ninjaKeys.open();
}

window.openSearchModal = openSearchModal;

document.addEventListener("DOMContentLoaded", function () {
  updateSearchTriggerLabel();
  const searchToggle = document.getElementById("search-toggle");

  if (searchToggle) {
    searchToggle.addEventListener("click", function () {
      openSearchModal();
    });
  }

  document.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openSearchModal();
    }
  });
});
