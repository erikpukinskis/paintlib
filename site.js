var library = require("module-library")(require)

library.using([
  "web-site",
  "web-element",
  "./browse-painter",
  "./clean-up-file-names"],
  function(WebSite, element, browsePainter, cleanUpFileNames) {

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
        "Artists"),
      '&nbsp;',
      element(
        "a.button.light",{
        "href": "/clean-up"},
        "Paintings")])

    browsePainter(
      site,
      "/",
      nav)

    cleanUpFileNames(
      site,
      "/clean-up/",
      nav)

    site.start(
      2090)})
