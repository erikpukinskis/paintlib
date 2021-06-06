var library = require("module-library")(require)

module.exports = library.export(
  "browse-painter",[
  "browser-bridge",
  "web-element",
  "basic-styles",
  "make-request",
  "./get-painter-data",
  "./spaced",
  "./state-button"],
  function(BrowserBridge, element, basicStyles, makeRequest, getPainterData, Spaced, StateButton) {

    var baseBridge = new BrowserBridge()
    basicStyles.addTo(baseBridge)
    Spaced.addTo(baseBridge)
    StateButton.defineOn(baseBridge)

    var FullScreenTopBarLayout = element.template.container(
      "div.layout",
      element.style({
        "display": "flex",
        "height": "100vh",
        "flex-direction": "column",
        "> div:first-child": {
          "flex-shrink": "0"},
        "> div:last-child": {
          "flex-grow": "1"}}))

    var Lightbox = element.template(
      "div.lightbox",
      element.style({
        "display": "flex",
        "flex-direction": "row",
        " button": {
          "flex-shrink": "0"},
        " .image-container": {
          "flex-grow": "1",
          "overflow": "scroll"},
        " #selected-image": {
          "background-repeat": "no-repeat",
          "background-size": "contain",
          "background-position": "center",
          "cursor": "zoom-in"},
        " #selected-image[data-zoomed=true]": {
          "cursor": "zoom-out"}}),
      function(loadImage, zoomIn) {
        this.addChildren([
          element(
            "button",{
            "onclick": loadImage.withArgs(
              -1)
              .evalable()},
            "<"),
          element(
            ".image-container",
            element({
              "onclick": zoomIn
                .evalable(),
              "id": "selected-image",
              "style": "width: 100%; height: 100%;"})),
          element(
            "button",{
            "onclick": loadImage.withArgs(
              1)
              .evalable()},
            ">")])})

    var body = element.template(
      "body",
      element.style({
        "margin": "0"}))

    baseBridge.addToHead(
        element.stylesheet([
          Lightbox,
          FullScreenTopBarLayout,
          body]))

    makeRequest.defineOn(
      baseBridge)

    var baseLoadImage = baseBridge.defineFunction(function loadImage(imageDb, direction, event) {
        event && event.stopPropagation()
        if (direction == 1) {
          imageDb.index++
        } else if (direction == -1) {
          imageDb.index--
        } else if (direction == 0) {
          imageDb.index = 0
        }
        var div = document.getElementById(
          "selected-image")
        var image = imageDb.images[imageDb.index]
        if (!image) {
          console.log("no images")
          return
        }
        div.style['background-image'] = "url("+image.url+")"
        div.style.width = "100%"
        div.style.height = "100%"
        div.removeAttribute(
          "data-zoomed")})

    var zoomIn = baseBridge.defineFunction(
      function zoomIn(imageDb) {
        var image = imageDb.images[imageDb.index]
        var div = document.getElementById(
          "selected-image")
        div.dataset.zoomed = div.dataset.zoomed ? "" : "true"
        if (div.dataset.zoomed) {
          var width = image.width+"px"
          var height = image.height+"px"
        } else {
          var width = "100%"
          var height = "100%"
        }
        div.style.width = width
        div.style.height = height})

    var setQueryParam = baseBridge.defineFunction(
      function setQueryParam(key, value) {
        var params = new URLSearchParams(
          document.location.search)
        params.set(key, value)
        history.replaceState(
          null,
          null,
          "?"+params.toString())})

    var getQueryParam = baseBridge.defineFunction(
      function getQueryParam(key, sanitize) {
        var params = new URLSearchParams(
          document.location.search)
        var string = params.get(
          key)
        if (sanitize) {
          return sanitize(string)
        } else {
          return string}})

    var loadArtist = baseBridge.defineFunction([
      makeRequest.defineOn(
        baseBridge),
      baseLoadImage,
      setQueryParam],
      function loadArtist(makeRequest, baseLoadImage, setQueryParam, baseRoute, imageDb, eventOrArtist) {
        if (typeof eventOrArtist == "string") {
          var artistName = eventOrArtist
        } else {
          console.log("preventing default...")
          eventOrArtist.preventDefault()
          var artistName = eventOrArtist.target.name.value}

        var button = document.getElementById(
          "search-artist-button")

        button.dataset.state = "loading"
        console.log('loading', artistName)
        setQueryParam("artist", artistName)

        var path = baseRoute+"painter/"+encodeURIComponent(artistName)
        makeRequest({
          "method": "get",
          "path": path},
          function(data) {
            imageDb.images = JSON.parse(data)
            button.dataset.state = "done"
            baseLoadImage(
              imageDb,
              0)})})

    var handleQueryChange = baseBridge.defineFunction(
      function handleQueryChange(value) {
        var button = document.getElementById(
          "search-artist-button")
        button.dataset.state = "dirty"
        console.log("value", value)})


    function browsePainter(site, baseRoute, nav) {
      site.addRoute(
        "get",
        baseRoute,
        function(request, response) {
          var bridge = baseBridge.forResponse(
            response)

          var name = request.query.artist
          console.log("artistName", name)

          var imageDb = bridge.defineSingleton(
            'imageDb',
            function() {
              return {
                index: 0,
                images: [] }})

          var loadImage = baseLoadImage.withArgs(
            imageDb)

          var lightbox = Lightbox(
            loadImage,
            zoomIn.withArgs(
              imageDb))


          bridge.domReady([
            loadImage,
            loadArtist.withArgs(
              baseRoute,
              imageDb)],
            function(loadImage, loadArtist) {
              document.onkeyup = function(event) {
                if (event.key == "ArrowLeft") {
                  loadImage(-1)
                } else if (event.key == "ArrowRight") {
                  loadImage(1)}}
                var artistName = getQueryParam(
                  "artist")
                if (artistName) {
                  loadArtist(
                    artistName)}
                else {
                  loadImage(
                    0)}})

          var submitButton = StateButton(
            "Search")
          submitButton.addAttribute(
            "id",
            "search-artist-button")

          var form = element(
            "form",{
              "onsubmit": loadArtist.withArgs(
                baseRoute,
                imageDb,
                bridge.event).evalable()},
            Spaced(
              element(
                "input",{
                "type": "text",
                "name": "name",
                "value": name || "",
                "placeholder": "artist name",
                "onkeypress": handleQueryChange.withArgs(
                    element.value)
                    .evalable()}),
              submitButton))

          bridge.send(
            FullScreenTopBarLayout([
              nav,
              element(
                "div",{
                style: "padding: 0 10px 10px 10px"},
                form),
              lightbox]))})


      site.addRoute(
        "get",
        baseRoute+"painter/:name",
        function(request, response) {
          var painterName = request.params.name.replace(/[^a-zA-Z ]+/g, "").toLowerCase()

          getPainterData(
            painterName,
            function(data) {
              response.send(
                data)})})}

    return browsePainter

  })

