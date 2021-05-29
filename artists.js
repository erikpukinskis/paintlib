var library = require("module-library")(require)

module.exports = library.export(
  "artists",[
  "./load-paintings",
  "web-element",
  "browser-bridge",
  "basic-styles"],
  function(loadPaintings, element, BrowserBridge, basicStyles) {

    var baseBridge = new BrowserBridge()

    basicStyles.addTo(
      baseBridge)

    function artists(site, baseRoute, nav) {
      var { painters, paintings } = loadPaintings()

      var paintingsByPainter = paintings.reduce(
        function(byPainter, painting) {
          if (!painting) return byPainter
          if (!byPainter[painting.artist]) {
            byPainter[painting.artist] = []}
          byPainter[painting.artist].push(painting)
          return byPainter},
        {})

      painters.sort()

      site.addRoute(
        "get",
        baseRoute,
        function(_, response) {
          var rows = painters.map(
            function(name) {
              var count = paintingsByPainter[name].length
              return element(
                "li",
                element.style({
                  "margin": "0.2em 0",
                  'font-weight': count > 2 ? 'bold' : 'normal'}),
                element(
                  "a",{
                  "href": "/"},
                  name),
                " ("+count+")")})

          baseBridge.forResponse(response).send([
            nav,
            element(
              "h1",
              painters.length+" Painters"),
            rows])})}

    return artists})