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
        "margin-top": "1em",
        " a": {
          "display": "inline-block",
          "padding": "0.3em 0.6em",
          "background": "#ccc",
          "color": "white",
          "text-decoration": "none",
          "margin-right": "0.6em",
          "border-radius": "0.3em"}}))

    var nav = Nav([
      element.stylesheet(Nav),
      element(
        "a",{
        "href": "/"},
        "Artists"),
      element(
        "a",{
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
