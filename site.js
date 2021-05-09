var library = require("module-library")(require)

library.using([
  "web-site",
  "./browse-painter"],
  function(WebSite, browsePainter) {

    var site = new WebSite()

    browsePainter(site)

    site.start(
      2090)})
