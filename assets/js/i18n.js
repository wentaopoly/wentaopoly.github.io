/**
 * Client-side i18n for al-folio Jekyll site.
 * Reads translations from window.I18N (injected by Jekyll from _data/locale/*.yml)
 * and swaps content based on user language selection.
 */
(function () {
  "use strict";

  var DEFAULT_LANG = "en";
  var STORAGE_KEY = "site-lang";
  var translations = window.I18N || {};

  function getCurrentLang() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  }

  function setCurrentLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
  }

  function getNestedValue(obj, path) {
    var keys = path.split(".");
    var result = obj;
    for (var i = 0; i < keys.length; i++) {
      if (result == null) return undefined;
      result = result[keys[i]];
    }
    return result;
  }

  /**
   * Apply translations to all elements with data-i18n attribute.
   * data-i18n="nav.about" -> looks up translations[lang].nav.about
   * data-i18n-html="about.bio" -> sets innerHTML instead of textContent
   */
  function applyTranslations(lang) {
    var locale = translations[lang];
    if (!locale) return;

    // Update text content
    var elements = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var key = el.getAttribute("data-i18n");
      var value = getNestedValue(locale, key);
      if (value !== undefined) {
        el.textContent = value;
      }
    }

    // Update HTML content
    var htmlElements = document.querySelectorAll("[data-i18n-html]");
    for (var j = 0; j < htmlElements.length; j++) {
      var htmlEl = htmlElements[j];
      var htmlKey = htmlEl.getAttribute("data-i18n-html");
      var htmlValue = getNestedValue(locale, htmlKey);
      if (htmlValue !== undefined) {
        htmlEl.innerHTML = htmlValue;
      }
    }

    // Update HTML lang attribute
    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;

    // Update active state in language menu
    var langOptions = document.querySelectorAll(".lang-option");
    for (var k = 0; k < langOptions.length; k++) {
      var opt = langOptions[k];
      if (opt.getAttribute("data-lang") === lang) {
        opt.style.fontWeight = "bold";
        opt.style.color = "var(--global-theme-color)";
      } else {
        opt.style.fontWeight = "normal";
        opt.style.color = "var(--global-text-color)";
      }
    }

    // Update the toggle button label
    var langLabel = { en: "EN", zh: "中", fr: "FR" };
    var currentLabel = document.getElementById("lang-current");
    if (currentLabel) {
      currentLabel.textContent = langLabel[lang] || "EN";
    }
  }

  /**
   * Rebuild the CV section with translated data.
   * This handles structured CV content that can't use simple data-i18n attributes.
   */
  function rebuildCV(lang) {
    var locale = translations[lang];
    if (!locale || !locale.cv) return;
    var cv = locale.cv;

    // CV header fields
    setTextIfExists("[data-cv-name]", cv.name);
    setTextIfExists("[data-cv-label]", cv.label);
    setHtmlIfExists("[data-cv-summary]", cv.summary);

    // Rebuild experience entries
    rebuildEntries("experience", cv.experience, lang);
    // Rebuild education entries
    rebuildEntries("education", cv.education, lang);
    // Rebuild skills
    rebuildSkills(cv.skills);
    // Rebuild languages
    rebuildLanguages(cv.languages);
    // Rebuild projects
    rebuildProjects(cv.projects);
  }

  function setTextIfExists(selector, value) {
    var el = document.querySelector(selector);
    if (el && value) el.textContent = value;
  }

  function setHtmlIfExists(selector, value) {
    var el = document.querySelector(selector);
    if (el && value) el.innerHTML = value;
  }

  function rebuildEntries(type, entries, lang) {
    var container = document.querySelector("[data-cv-section='" + type + "']");
    if (!container || !entries) return;

    var locale = translations[lang];
    var presentLabel = (locale && locale.labels && locale.labels.present) || "present";

    var html = "";
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var title = entry.company || entry.institution || "";
      var subtitle = entry.position || entry.studyType || "";
      var location = entry.location || "";
      var area = entry.area || "";
      var summary = entry.summary || "";

      html += '<div class="card-item mb-3">';
      html += '<div class="row">';

      // Left: title and meta
      html += '<div class="col">';
      html += "<h4>" + title + "</h4>";
      if (subtitle) html += "<p><em>" + subtitle + "</em></p>";
      if (area) html += "<p>" + area + "</p>";
      if (location) html += '<p class="text-muted">' + location + "</p>";
      if (summary) html += "<p>" + summary + "</p>";

      // Highlights
      if (entry.highlights && entry.highlights.length > 0) {
        html += '<ul class="card-text font-weight-light list-group list-group-flush">';
        for (var j = 0; j < entry.highlights.length; j++) {
          html += '<li class="list-group-item">' + entry.highlights[j] + "</li>";
        }
        html += "</ul>";
      }
      html += "</div></div></div>";
    }
    container.innerHTML = html;
  }

  function rebuildSkills(skills) {
    var container = document.querySelector("[data-cv-section='skills']");
    if (!container || !skills) return;

    var html = "";
    for (var i = 0; i < skills.length; i++) {
      html += '<div class="card-item mb-2">';
      html += "<strong>" + skills[i].name + ":</strong> " + skills[i].keywords;
      html += "</div>";
    }
    container.innerHTML = html;
  }

  function rebuildLanguages(languages) {
    var container = document.querySelector("[data-cv-section='languages']");
    if (!container || !languages) return;

    var html = "";
    for (var i = 0; i < languages.length; i++) {
      html += '<div class="card-item mb-2">';
      html += "<strong>" + languages[i].name + ":</strong> " + languages[i].summary;
      html += "</div>";
    }
    container.innerHTML = html;
  }

  function rebuildProjects(projects) {
    var container = document.querySelector("[data-cv-section='projects']");
    if (!container || !projects) return;

    var html = "";
    for (var i = 0; i < projects.length; i++) {
      html += '<div class="card-item mb-2">';
      html += "<h4>" + projects[i].name + "</h4>";
      html += "<p>" + projects[i].summary + "</p>";
      html += "</div>";
    }
    container.innerHTML = html;
  }

  /**
   * Rebuild news section with translated content.
   */
  function rebuildNews(lang) {
    var locale = translations[lang];
    if (!locale || !locale.news) return;

    var newsTable = document.querySelector("[data-i18n-news]");
    if (!newsTable) return;

    var html = "";
    for (var i = 0; i < locale.news.length; i++) {
      var item = locale.news[i];
      html += "<tr>";
      html += '<th scope="row" style="width: 20%">' + item.date + "</th>";
      html += "<td>" + item.content + "</td>";
      html += "</tr>";
    }
    newsTable.innerHTML = html;
  }

  /**
   * Switch to a new language.
   */
  function switchLanguage(lang) {
    setCurrentLang(lang);
    applyTranslations(lang);
    rebuildCV(lang);
    rebuildNews(lang);

    // Close the language menu
    var menu = document.getElementById("lang-menu");
    if (menu) menu.style.display = "none";
  }

  /**
   * Initialize i18n on page load.
   */
  function init() {
    var lang = getCurrentLang();

    // Setup language toggle button
    var toggleBtn = document.getElementById("lang-toggle");
    var menu = document.getElementById("lang-menu");

    if (toggleBtn && menu) {
      toggleBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        menu.style.display = menu.style.display === "flex" ? "none" : "flex";
        menu.style.flexDirection = "column";
      });

      // Close menu when clicking outside
      document.addEventListener("click", function () {
        menu.style.display = "none";
      });

      menu.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }

    // Setup language option buttons
    var langOptions = document.querySelectorAll(".lang-option");
    for (var i = 0; i < langOptions.length; i++) {
      langOptions[i].addEventListener("click", function () {
        var selectedLang = this.getAttribute("data-lang");
        switchLanguage(selectedLang);
      });
    }

    // Apply saved language on load
    if (lang !== DEFAULT_LANG) {
      switchLanguage(lang);
    } else {
      // Still mark active option
      applyTranslations(lang);
    }
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
