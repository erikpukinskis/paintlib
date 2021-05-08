var library = require("module-library")(require)

library.using([
  "web-site",
  "browser-bridge",
  "web-element",
  "basic-styles",
  "make-request",
  "fs"],
  function(WebSite, BrowserBridge, element, basicStyles, makeRequest, fs) {
    var site = new WebSite()
    var baseBridge = new BrowserBridge()
    basicStyles.addTo(baseBridge)

    var imageObjects = []

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

    var Lightbox = element.template.container(
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
          "cursor": "zoom-out"}}))

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

    site.addRoute(
      "get",
      "/",
      function(request, response) {
        var bridge = baseBridge.forResponse(
          response)

        var imageDb = bridge.defineSingleton(
          'imageDb',
          [imageObjects],
          function(imageObjects) {
            return {
              index: 0,
              images: imageObjects }})

        var loadImage = bridge.defineFunction([
          imageDb],
          function loadImage(imageDb, direction, event) {
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

        var zoomIn = bridge.defineFunction([
          imageDb],
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


        var lightbox = Lightbox([
          element(
            "button",{
            "onclick": loadImage.withArgs(
              -1)
              .evalable()},
            "<"),
          element(
            ".image-container",
            element({
              "onclick": zoomIn.evalable(),
              "id": "selected-image",
              "style": "width: 100%; height: 100%;"})),
          element(
            "button",{
            "onclick": loadImage.withArgs(
              1)
              .evalable()},
            ">")])

        bridge.domReady(loadImage.withArgs(0))

        var loadArtist = bridge.defineFunction([
          makeRequest.defineOn(
            baseBridge),
          imageDb,
          loadImage],
          function loadArtist(makeRequest, imageDb, loadImage, event) {
            event.preventDefault()
            var artistName = event.target.name.value
            var path = "/painter/"+encodeURIComponent(artistName)
            makeRequest({
              "method": "get",
              "path": path},
              function(data) {
                imageDb.images = JSON.parse(data)
                loadImage(0)})})

        var form = element(
          "form",{
            "onsubmit": loadArtist.withArgs(bridge.event).evalable()},
          element(
            "input",{
            "type": "text",
            "name": "name",
            "placeholder": "artist name"}))

        bridge.send(
          FullScreenTopBarLayout([
            element(
              "div",{
              style: "padding: 0 10px 10px 10px"},
              form),
            lightbox]))})


    site.addRoute(
      "get",
      "/painter/:name",
      function(request, response) {
        var painterName = request.params.name.replace(/[^a-zA-Z ]+/g, "").toLowerCase()

        getPainterData(
          painterName,
          function(data) {
            var imageObjects = data.value.map(function(data) {
                return {
                  url: data.contentUrl,
                  width: data.width,
                  height: data.height }})
            response.send(
              imageObjects)})})

    function getPainterData(painterName, callback) {
        var filename = "painters/"+painterName+".json"

        if (!fs.existsSync(filename)) {
          fetchPainterImages(painterName, callback)
          return }

        var data = JSON.parse(
          fs.readFileSync(
            filename))

        console.log("loaded "+filename)

        callback(data)}

    site.start(
      2090)

    // fetchPainterImages("cy gavin")

    function fetchPainterImages(painterName, callback) {
      var url = "https://api.bing.microsoft.com/v7.0/images/search?"+buildQueryString({
        q: painterName+" painting",
        count: 150,
        offset: 0,
        minWidth: 700,
        minHeight: 700,
        safeSearch: "off"
      });

      makeRequest({
        method: "get",
        url: url,
        headers: {
          "Ocp-Apim-Subscription-Key": process.env.BING_SEARCH_API_SUBSCRIPTION_KEY,
          "Accept": "application/json"}},
        function(json) {
          var data = JSON.parse(
              json)
          var formatted = JSON.stringify(
            data,
            null,
            4)
          var filename = "painters/"+painterName+".json"
          fs.writeFileSync(
            filename,
            formatted)
          console.log("wrote "+filename)
          callback(data)})}


    function buildQueryString(obj) {
      var str = [];
      for (var p in obj)
        if (obj.hasOwnProperty(p)) {
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
      return str.join("&");
    }
  })

