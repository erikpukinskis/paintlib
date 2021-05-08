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

    var input = element(
      "input",{
      "type": "text",
      "placeholder": "artist name"})

    var data = JSON.parse(fs.readFileSync('./test.json'))

    var imageUrls = data.value.map(function(data) {
      return data.contentUrl
    })

    var Lightbox = element.template.container(
      ".lightbox",
      element.style({
        "display": "flex",
        "flex-direction": "row",
        " button": {
          "flex-shrink": "0"},
        " .image-container": {
          "position": "relative",
          "flex-grow": "1"},
        " img": {
          "max-width": "100%"}}))

    baseBridge.addToHead(element.stylesheet([
      Lightbox]))

    site.addRoute(
      "get",
      "/",
      function(request, response) {
        var bridge = baseBridge.forResponse(
          response)

        var images = bridge.defineSingleton(
          'images',
          [imageUrls],
          function(urls) {
            return urls })

        var images = bridge.defineSingleton(
          'images',
          [imageUrls],
          function(imageUrls) {
            return {
              index: 0,
              urls: imageUrls }})

        var loadImage = bridge.defineFunction([
          images],
          function loadImage(images, direction) {
            if (direction == 1) {
              images.index++
            } else if (direction == -1) {
              images.index--
            }
            var img = document.getElementById(
              "selected-image")
            img.src = images.urls[images.index]
          })

        var lightbox = Lightbox([
          element(
            "button",{
            "onclick": loadImage.withArgs(
              1)
              .evalable()},
            "<"),
          element(
            ".image-container",[
            element(
              "img",{
              "id": "selected-image"})]),
          element(
            "button",{
            "onclick": loadImage.withArgs(
              1)
              .evalable()},
            ">")])

        bridge.domReady(loadImage)

        bridge.send([
          element("p", [input]),
          lightbox])})

    site.start(
      2090)

    // fetchPainterImages("cy gavin")

    function fetchPainterImages(painterName) {
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
        savePainterImages)
    }

    function savePainterImages(json) {
      console.log(json)
      fs.writeFileSync('./test.json', JSON.stringify(JSON.parse(json), null, 4))
    }

    function buildQueryString(obj) {
      var str = [];
      for (var p in obj)
        if (obj.hasOwnProperty(p)) {
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
      return str.join("&");
    }
  })

