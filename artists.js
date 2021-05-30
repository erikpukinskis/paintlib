var library = require("module-library")(require)

module.exports = library.export(
  "artists",[
  "./load-paintings",
  "web-element",
  "browser-bridge",
  "basic-styles",
  "make-request"],
  function(loadPaintings, element, BrowserBridge, basicStyles, makeRequest) {

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

      var searchPaintings = baseBridge.defineFunction(
        function(loadArtist, lightboxElementId, event) {
          var artistName = event.target.dataset.name
          console.log('load', artistName)})

      var search = baseBridge.defineFunction(
        function search(query) {
          var pattern = new RegExp(query, "i")
          var rows = document.querySelectorAll(
            ".painter[data-name]")
          var any = false
          rows.forEach(
            function showHidePainter(row) {
              var name = row.dataset.name
              if (pattern.test(name)) {
                row.style.display = "block"
                any = true}
              else {
                row.style.display = "none"}})
          var buttons = document.getElementById(
            "query-buttons")
          buttons.style.display = "block"
          var searchPaintingsButton = document.getElementById(
            "search-paintings-button")
          searchPaintingsButton.href = "/?artist="+encodeURIComponent(query)
          searchPaintingsButton.innerText = "Find "+query+" paintings"})

      var searchBox = element("input",{
        "type": "text",
        "placeholder": "Artist",
        "onkeyup": search.withArgs(
          element.value).evalable()})

      var queryButtons = element(
        "p",{
        "id": "query-buttons",
        "style": "display: none"},
        element(
          "a.button",{
          "id": "search-paintings-button"}))

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
            rows,
            queryButtons])})}

    return artists})