var library = require("module-library")(require)

module.exports = library.export(
  "artists",[
  "./load-paintings",
  "web-element",
  "browser-bridge",
  "basic-styles"],
  function(loadPaintings, element, BrowserBridge, basicStyles) {

    function artists(site, baseRoute, nav) {

      var baseBridge = new BrowserBridge()

      basicStyles.addTo(
        baseBridge)

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

      var search = baseBridge.defineFunction(
        function search(query) {
          var pattern = new RegExp(query, "i")
          var rows = document.querySelectorAll(
            ".painter[data-name]")
          var any = false
          rows.forEach(
            function showHidePainter(row) {
              var name = row.dataset.name
              console.log("name", name)
              if (pattern.test(name)) {
                row.style.display = "block"}
                any = true
              else {
                row.style.display = "none"}})})

      var searchBox = element("input",{
        "type": "text",
        "placeholder": "Artist",
        "onkeyup": search.withArgs(
          element.value).evalable()})

      site.addRoute(
        "get",
        baseRoute,
        function(_, response) {
          var rows = painters.map(
            function(name) {
              var count = paintingsByPainter[name].length
              return element(
                "li.painter",{
                  "data-name": name},
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
            searchBox,
            element(
              "h1",
              painters.length+" Painters"),
            rows])})}

    return artists})