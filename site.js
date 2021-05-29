var library = require("module-library")(require)


// Cycle 1: Catalog
// [HARD] Flag artists of interest
// Save resources to parse (ok: Bookmark)
// [HARD] ✓ open artists in google images
// [HARD] open groups of tabs with interesting paintings
// [HARD] filter out minor artists
// [HARD] save paintings that strike me
// [HARD] open paintings from every year in an artist's life
// [HARD] search biographical details......................................
// make post with tags (ok: Tumblr)
// [HARD] click tags, like and follow
// like and follow accounts on feed (ok: Tumblr)
// [HARD] find the right tags
// (repeat)
// 
// Cycle 2: Investigate
// Search biographic details
// Exhaustive timeline of work


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
