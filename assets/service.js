(function () {
  "use strict";
  const publicBase = "https://widget.imnotfound.eu.org";
  const legacyPath = "/notion-widget-box";
  if (location.hostname === "zengyincen.github.io" && (location.pathname === legacyPath || location.pathname.startsWith(`${legacyPath}/`))) {
    const target = new URL(publicBase);
    target.pathname = location.pathname.slice(legacyPath.length) || "/";
    target.search = location.search;
    target.hash = location.hash;
    location.replace(target.toString());
  }
  window.WIDGET_BOX_SERVICE = Object.freeze({
    publicBase,
    apiBase: "https://nwb.imnotfound.eu.org",
    statusUrl: "https://nwb.imnotfound.eu.org/health"
  });
})();
