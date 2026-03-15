/**
 * Client-side i18n for the site.
 * Reads translations from window.I18N and upgrades page sections in place.
 */
(function () {
  "use strict";

  var DEFAULT_LANG = "en";
  var STORAGE_KEY = "site-lang";
  var translations = window.I18N || {};
  var cvData = window.CVRenderData || null;

  function detectBrowserLang() {
    var browserLang = (navigator.language || navigator.userLanguage || "").toLowerCase();
    if (browserLang.indexOf("zh") === 0) return "zh";
    if (browserLang.indexOf("fr") === 0) return "fr";
    return DEFAULT_LANG;
  }

  function getCurrentLang() {
    return localStorage.getItem(STORAGE_KEY) || detectBrowserLang();
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

  function createNode(tagName, className, textContent) {
    var node = document.createElement(tagName);

    if (className) {
      node.className = className;
    }

    if (typeof textContent === "string") {
      node.textContent = textContent;
    }

    return node;
  }

  function setTextIfExists(selector, value) {
    var el = document.querySelector(selector);
    if (el && value) {
      el.textContent = value;
    }
  }

  function getLocale(lang) {
    return translations[lang] || translations[DEFAULT_LANG] || {};
  }

  function resolveValue(primary, fallback) {
    return primary !== undefined && primary !== null && primary !== "" ? primary : fallback;
  }

  function getLangLabel(lang) {
    return { en: "EN", zh: "中", fr: "FR" }[lang] || "EN";
  }

  function setLanguageMenuState(lang) {
    var options = document.querySelectorAll(".lang-option");

    for (var i = 0; i < options.length; i++) {
      var isActive = options[i].getAttribute("data-lang") === lang;
      options[i].classList.toggle("active", isActive);
      options[i].setAttribute("aria-pressed", isActive ? "true" : "false");
    }

    var currentLabel = document.getElementById("lang-current");
    if (currentLabel) {
      currentLabel.textContent = getLangLabel(lang);
    }
  }

  function setLanguageMenuOpen(open) {
    var menu = document.getElementById("lang-menu");
    var button = document.getElementById("lang-toggle");

    if (!menu || !button) return;

    menu.classList.toggle("show", open);
    button.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function applyTranslations(lang) {
    var locale = getLocale(lang);
    var elements = document.querySelectorAll("[data-i18n]");
    var htmlElements = document.querySelectorAll("[data-i18n-html]");

    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var key = el.getAttribute("data-i18n");
      var value = getNestedValue(locale, key);

      if (value !== undefined) {
        el.textContent = value;
      }
    }

    for (var j = 0; j < htmlElements.length; j++) {
      var htmlEl = htmlElements[j];
      var htmlKey = htmlEl.getAttribute("data-i18n-html");
      var htmlValue = getNestedValue(locale, htmlKey);

      if (htmlValue !== undefined) {
        htmlEl.innerHTML = htmlValue;
      }
    }

    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
    setLanguageMenuState(lang);
  }

  function getCvSectionEntries(type) {
    if (!cvData) return [];

    if (cvData.sections) {
      if (type === "experience") {
        return (cvData.sections.Experience || []).concat(cvData.sections.Volunteer || []);
      }

      if (type === "education") return cvData.sections.Education || [];
      if (type === "skills") return cvData.sections.Skills || [];
      if (type === "languages") return cvData.sections.Languages || [];
      if (type === "projects") return cvData.sections.Projects || cvData.sections["Open Source Projects"] || [];
    }

    if (type === "experience") {
      return (cvData.work || []).concat(cvData.volunteer || []);
    }

    return cvData[type] || [];
  }

  function getYearLabel(entry, presentLabel) {
    var start = resolveValue(entry.start_date, entry.startDate);
    var end = resolveValue(entry.end_date, entry.endDate);

    if (!start) return "";

    var startYear = String(start).split("-")[0];
    var normalizedEnd = end ? String(end).trim() : "";
    var endYear = normalizedEnd ? normalizedEnd.split("-")[0] : presentLabel;

    if (normalizedEnd && normalizedEnd.toLowerCase() === "present") {
      endYear = presentLabel;
    }

    return startYear + " - " + endYear;
  }

  function appendHighlights(container, items) {
    if (!items || !items.length) return;

    var list = createNode("ul", "items");

    for (var i = 0; i < items.length; i++) {
      var item = createNode("li");
      var span = createNode("span", "item", items[i]);
      item.appendChild(span);
      list.appendChild(item);
    }

    container.appendChild(list);
  }

  function createDateColumn(entry, presentLabel, location) {
    var column = createNode("div", "col-xs-2 col-sm-2 col-md-2 text-center date-column");
    var table = createNode("table", "table-cv");
    var tbody = createNode("tbody");
    var dateLabel = getYearLabel(entry, presentLabel);

    if (dateLabel) {
      var badgeRow = createNode("tr");
      var badgeCell = createNode("td");
      var badge = createNode("span", "badge font-weight-bold danger-color-dark text-uppercase align-middle", dateLabel);

      badge.style.minWidth = "75px";
      badgeCell.appendChild(badge);
      badgeRow.appendChild(badgeCell);
      tbody.appendChild(badgeRow);
    }

    if (location) {
      var locationRow = createNode("tr");
      var locationCell = createNode("td");
      var locationText = createNode("p", "location");
      var icon = createNode("i", "fa-solid fa-location-dot iconlocation");

      locationText.appendChild(icon);
      locationText.append(" " + location);
      locationCell.appendChild(locationText);
      locationRow.appendChild(locationCell);
      tbody.appendChild(locationRow);
    }

    table.appendChild(tbody);
    column.appendChild(table);
    return column;
  }

  function createLinkedHeading(entry, text) {
    var heading = createNode("h6", "title font-weight-bold ml-1 ml-md-4");

    if (entry.url) {
      var link = createNode("a", null, text);
      link.href = entry.url;
      heading.appendChild(link);
    } else {
      heading.textContent = text;
    }

    return heading;
  }

  function buildCvEntryNode(baseEntry, translatedEntry, presentLabel) {
    var listItem = createNode("li", "list-group-item");
    var row = createNode("div", "row");
    var contentColumn = createNode("div", "col-xs-10 col-sm-10 col-md-10 mt-2 mt-md-0");
    var title = resolveValue(translatedEntry.position, resolveValue(translatedEntry.studyType, resolveValue(baseEntry.position, resolveValue(baseEntry.studyType, baseEntry.degree))));
    var entity =
      resolveValue(translatedEntry.company, translatedEntry.institution) ||
      resolveValue(baseEntry.company, resolveValue(baseEntry.name, resolveValue(baseEntry.organization, baseEntry.institution)));
    var area = resolveValue(translatedEntry.area, baseEntry.area);
    var summary = resolveValue(translatedEntry.summary, baseEntry.summary);
    var location = resolveValue(translatedEntry.location, baseEntry.location);
    var highlights = resolveValue(translatedEntry.highlights, baseEntry.highlights) || [];

    row.appendChild(createDateColumn(baseEntry, presentLabel, location));

    if (title) {
      contentColumn.appendChild(createLinkedHeading(baseEntry, title));
    }

    if (entity) {
      contentColumn.appendChild(createNode("h6", "ml-1 ml-md-4 meta-line", entity));
    }

    if (area) {
      contentColumn.appendChild(createNode("h6", "ml-1 ml-md-4 meta-line meta-line-italic", area));
    }

    if (summary) {
      contentColumn.appendChild(createNode("h6", "ml-1 ml-md-4 meta-line meta-line-italic", summary));
    }

    appendHighlights(contentColumn, highlights);
    row.appendChild(contentColumn);
    listItem.appendChild(row);
    return listItem;
  }

  function rebuildEntries(type, lang) {
    var container = document.querySelector("[data-cv-section='" + type + "']");
    var locale = getLocale(lang);
    var translatedCv = locale.cv || {};
    var translatedEntries = translatedCv[type];
    var baseEntries = getCvSectionEntries(type);
    var presentLabel = (locale.labels && locale.labels.present) || "Present";

    if (!container || !translatedEntries || !baseEntries.length) return;

    var list = createNode("ul", "card-text font-weight-light list-group list-group-flush");

    for (var i = 0; i < baseEntries.length; i++) {
      list.appendChild(buildCvEntryNode(baseEntries[i] || {}, translatedEntries[i] || {}, presentLabel));
    }

    container.replaceChildren(list);
  }

  function rebuildSkills(lang) {
    var container = document.querySelector("[data-cv-section='skills']");
    var translatedSkills = getLocale(lang).cv && getLocale(lang).cv.skills;
    var baseSkills = getCvSectionEntries("skills");

    if (!container || !translatedSkills || !baseSkills.length) return;

    var fragment = document.createDocumentFragment();

    for (var i = 0; i < baseSkills.length; i++) {
      var baseSkill = baseSkills[i] || {};
      var translatedSkill = translatedSkills[i] || {};
      var row = createNode("div", "skill-item");
      var iconClass = baseSkill.icon;
      var name = resolveValue(translatedSkill.name, baseSkill.name);
      var keywords = resolveValue(translatedSkill.keywords, baseSkill.keywords);
      var label = createNode("strong", null, name + ":");

      if (iconClass) {
        row.appendChild(createNode("i", iconClass));
        row.append(" ");
      }

      row.appendChild(label);
      row.append(" " + keywords);
      fragment.appendChild(row);
    }

    container.replaceChildren(fragment);
  }

  function rebuildLanguages(lang) {
    var container = document.querySelector("[data-cv-section='languages']");
    var translatedLanguages = getLocale(lang).cv && getLocale(lang).cv.languages;
    var baseLanguages = getCvSectionEntries("languages");

    if (!container || !translatedLanguages || !baseLanguages.length) return;

    var fragment = document.createDocumentFragment();

    for (var i = 0; i < baseLanguages.length; i++) {
      var baseLanguage = baseLanguages[i] || {};
      var translatedLanguage = translatedLanguages[i] || {};
      var row = createNode("div", "language-item");
      var name = resolveValue(translatedLanguage.name, resolveValue(baseLanguage.name, baseLanguage.language));
      var summary = resolveValue(translatedLanguage.summary, resolveValue(baseLanguage.summary, baseLanguage.fluency));
      var label = createNode("strong", null, name + ":");

      row.appendChild(label);
      row.append(" " + summary);
      fragment.appendChild(row);
    }

    container.replaceChildren(fragment);
  }

  function rebuildProjects(lang) {
    var container = document.querySelector("[data-cv-section='projects']");
    var translatedProjects = getLocale(lang).cv && getLocale(lang).cv.projects;
    var baseProjects = getCvSectionEntries("projects");

    if (!container || !translatedProjects || !baseProjects.length) return;

    var list = createNode("ul", "card-text font-weight-light list-group list-group-flush");

    for (var i = 0; i < baseProjects.length; i++) {
      var baseProject = baseProjects[i] || {};
      var translatedProject = translatedProjects[i] || {};
      var item = createNode("li", "list-group-item");
      var title = resolveValue(translatedProject.name, baseProject.name);
      var summary = resolveValue(translatedProject.summary, baseProject.summary);
      var heading;

      if (baseProject.url) {
        heading = createNode("h6", "title font-weight-bold");
        var link = createNode("a", null, title);
        link.href = baseProject.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        heading.appendChild(link);
      } else {
        heading = createNode("h6", "title font-weight-bold", title);
      }

      item.appendChild(heading);

      if (summary) {
        item.appendChild(createNode("p", null, summary));
      }

      appendHighlights(item, resolveValue(translatedProject.highlights, baseProject.highlights));
      list.appendChild(item);
    }

    container.replaceChildren(list);
  }

  function rebuildCV(lang) {
    var locale = getLocale(lang);
    var cvLocale = locale.cv;

    if (!cvLocale || !cvData) return;

    setTextIfExists("[data-cv-name]", cvLocale.name);
    setTextIfExists("[data-cv-label]", cvLocale.label);
    setTextIfExists("[data-cv-summary]", cvLocale.summary);

    rebuildEntries("experience", lang);
    rebuildEntries("education", lang);
    rebuildSkills(lang);
    rebuildLanguages(lang);
    rebuildProjects(lang);
  }

  function rebuildNews(lang) {
    var locale = getLocale(lang);
    var newsTable = document.querySelector("[data-i18n-news]");

    if (!newsTable || !locale.news) return;

    var fragment = document.createDocumentFragment();

    for (var i = 0; i < locale.news.length; i++) {
      var item = locale.news[i];
      var row = createNode("tr");
      var dateCell = createNode("th", null, item.date);
      var contentCell = createNode("td", null, item.content);

      dateCell.scope = "row";
      dateCell.style.width = "20%";
      row.appendChild(dateCell);
      row.appendChild(contentCell);
      fragment.appendChild(row);
    }

    newsTable.replaceChildren(fragment);
  }

  function switchLanguage(lang) {
    setCurrentLang(lang);
    applyTranslations(lang);
    rebuildCV(lang);
    rebuildNews(lang);
    setLanguageMenuOpen(false);
  }

  function initLanguageMenu() {
    var toggleBtn = document.getElementById("lang-toggle");
    var menu = document.getElementById("lang-menu");

    if (!toggleBtn || !menu) return;

    toggleBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      setLanguageMenuOpen(!menu.classList.contains("show"));
    });

    menu.addEventListener("click", function (event) {
      event.stopPropagation();
    });

    document.addEventListener("click", function () {
      setLanguageMenuOpen(false);
    });
  }

  function initLanguageOptions() {
    var langOptions = document.querySelectorAll(".lang-option");

    for (var i = 0; i < langOptions.length; i++) {
      langOptions[i].addEventListener("click", function () {
        switchLanguage(this.getAttribute("data-lang"));
      });
    }
  }

  function init() {
    var lang = getCurrentLang();

    initLanguageMenu();
    initLanguageOptions();

    if (lang !== DEFAULT_LANG) {
      switchLanguage(lang);
    } else {
      applyTranslations(lang);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
