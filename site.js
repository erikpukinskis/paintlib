var library = require("module-library")(require)

library.using([
  "web-site",
  "web-element",
  "./browse-painter",
  "./clean-up-file-names",
  "./artists"],
  function(WebSite, element, browsePainter, cleanUpFileNames, artists) {

    var site = new WebSite()

    var Nav = element.template.container(
      ".nav",
      element.style({
        "margin-top": "1em"}))

    var nav = Nav([
      element.stylesheet(Nav),
      element(
        "a.button.light",{
        "href": "/"},
        "Search"),
      '&nbsp;',
      element(
        "a.button.light",{
        "href": "/clean-up"},
        "Paintings"),
      '&nbsp;',
      element(
        "a.button.light",{
        "href": "/artists"},
        "Artists")])

    browsePainter(
      site,
      "/",
      nav)

    cleanUpFileNames(
      site,
      "/clean-up/",
      nav)

    artists(
      site,
      "/artists/",
      nav)

    site.start(
      2090)})
