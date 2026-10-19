// Language choice, BibTeX copy buttons, and the visitor map.

document.querySelectorAll("[data-lang-link]").forEach((link) => {
  link.addEventListener("click", () => {
    try {
      localStorage.setItem("lang", link.dataset.langLink);
    } catch (e) {
      // Storage can be unavailable in private windows; the link still works.
    }
  });
});

document.querySelectorAll("[data-copy]").forEach((button) => {
  const label = button.textContent;
  button.addEventListener("click", async () => {
    const code = button.parentElement.querySelector("code").textContent;
    await navigator.clipboard.writeText(code);
    button.textContent = button.dataset.copied;
    setTimeout(() => (button.textContent = label), 1600);
  });
});

const visits = document.querySelector("[data-visits]");
if (visits) {
  const { apiUrl } = window.visitorMapConfig;
  fetch(apiUrl + "/api/visitors?limit=150&days=3650", { mode: "cors" })
    .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
    .then(({ summary, visitors }) => {
      // Same equirectangular frame as _includes/world-dots.svg: x = lon + 180, y = 75 - lat, 360 x 131.
      const map = visits.querySelector(".visits-map");
      for (const v of visitors) {
        const dot = document.createElement("span");
        dot.className = "visits-dot";
        dot.style.left = ((Number(v.longitude) + 180) / 360) * 100 + "%";
        dot.style.top = ((75 - Number(v.latitude)) / 131) * 100 + "%";
        dot.title = v.city || v.country || "";
        map.append(dot);
      }
      const caption = visits.querySelector("figcaption");
      caption.textContent = caption.dataset.template
        .replace("{visits}", summary.total_visits)
        .replace("{places}", summary.unique_locations);
    })
    .catch(() => visits.remove());
}

// Featured video: the cover links to the paper page; with JS it plays in place.
document.querySelectorAll("[data-player]").forEach((box) => {
  const video = box.querySelector("video");
  const play = box.querySelector("[data-play]");
  play.addEventListener("click", (event) => {
    event.preventDefault();
    play.remove();
    video.controls = true;
    video.play();
  });
});
