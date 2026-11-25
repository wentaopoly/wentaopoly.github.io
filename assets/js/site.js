// Language choice, the section bar, and BibTeX copy buttons. The visitor map is in visitor-map.js.

document.querySelectorAll("[data-lang-link]").forEach((link) => {
  link.addEventListener("click", () => {
    try {
      localStorage.setItem("lang", link.dataset.langLink);
    } catch (e) {
      // Storage can be unavailable in private windows; the link still works.
    }
  });
});

// Home page: mark the section bar link whose section is being read.
const sectionLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
if (sectionLinks.length) {
  const sections = sectionLinks.map((link) => document.getElementById(link.hash.slice(1)));
  const mark = () => {
    const line = window.innerHeight * 0.35;
    let current = 0;
    sections.forEach((section, i) => {
      if (section.getBoundingClientRect().top <= line) current = i;
    });
    sectionLinks.forEach((link, i) => link.classList.toggle("here", i === current));
  };
  window.addEventListener("scroll", mark, { passive: true });
  mark();
}

document.querySelectorAll("[data-copy]").forEach((button) => {
  const label = button.textContent;
  button.addEventListener("click", async () => {
    const code = button.parentElement.querySelector("code").textContent;
    await navigator.clipboard.writeText(code);
    button.textContent = button.dataset.copied;
    setTimeout(() => (button.textContent = label), 1600);
  });
});
