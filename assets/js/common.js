$(document).ready(function () {
  function createJupyterCssLink() {
    const cssLink = document.createElement("link");
    cssLink.href = "/assets/css/jupyter.css";
    cssLink.rel = "stylesheet";
    cssLink.type = "text/css";
    cssLink.dataset.jupyterStyles = "true";
    return cssLink;
  }

  function applyJupyterStyling(iframe, theme) {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      if (!doc || !doc.head) return;

      if (!doc.head.querySelector('link[data-jupyter-styles="true"]')) {
        doc.head.append(createJupyterCssLink());
      }

      if (doc.body) {
        if (theme == "dark") {
          doc.body.setAttribute("data-jp-theme-light", "false");
          doc.body.setAttribute("data-jp-theme-name", "JupyterLab Dark");
        } else {
          doc.body.setAttribute("data-jp-theme-light", "true");
          doc.body.setAttribute("data-jp-theme-name", "JupyterLab Light");
        }
      }
    } catch (_error) {
      // Cross-origin notebook iframes should not break page behavior.
    }
  }

  // add toggle functionality to abstract, award and bibtex buttons
  $("a.abstract").click(function () {
    $(this).parent().parent().find(".abstract.hidden").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.award").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.bibtex").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden").toggleClass("open");
  });
  $("a").removeClass("waves-effect waves-light");

  // bootstrap-toc
  if ($("#toc-sidebar").length) {
    // remove related publications years from the TOC
    $(".publications h2").each(function () {
      $(this).attr("data-toc-skip", "");
    });
    var navSelector = "#toc-sidebar";
    var $myNav = $(navSelector);
    Toc.init($myNav);
    $("body").scrollspy({
      target: navSelector,
      offset: 100,
    });
  }

  // add css to jupyter notebooks
  let jupyterTheme = determineComputedTheme();

  $(".jupyter-notebook-iframe-container iframe").each(function () {
    const iframe = this;

    $(iframe).on("load", function () {
      applyJupyterStyling(iframe, jupyterTheme);
    });

    applyJupyterStyling(iframe, jupyterTheme);
  });

  // trigger popovers
  $('[data-toggle="popover"]').popover({
    trigger: "hover",
  });
});
