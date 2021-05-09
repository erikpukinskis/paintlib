var library = require("module-library")(require)

module.exports = library.export(
  "clean-up-file-names",[
  "browser-bridge",
  "web-element",
  "basic-styles",
  "fs",
  "./check-button",
  "./circle-button",
  "make-request"],
  function(BrowserBridge, element, basicStyles, fs, CheckButton, CircleButton, makeRequest) {

    var baseBridge = new BrowserBridge()

    basicStyles.addTo(
      baseBridge)
    CheckButton.defineOn(
      baseBridge)
    CircleButton.defineOn(
      baseBridge)

    var paintings = fs.readdirSync(
      "./paintings")
      .filter(
        whitelist)
      .map(
        parseMetadata)

    function whitelist(filename) {
      if (filename === '.DS_Store') {
        return false }
      return true }

    function parseMetadata(filename) {
      var verified = /\.\.jpeg$/.test(filename)
      var title = filename.replace(/[.][.]?(jpg|jpeg)$/, "")
      var year = ""
      var artist = ""

      if (/^- /.test(title)) {
        var year = "-"
        title = title.slice(2)
      }

      if (/^[0-9]{4} /.test(title)) {
        var year = title.slice(0,4)
        title = title.slice(5)
      }

      if (/,/.test(title)) {
        var parts = title.match(/^(.*),(.*)$/)
        artist = parts[1]
        title = parts[2]
      }

      return {
        year: year.trim(),
        title: title.trim(),
        artist: artist.trim(),
        filename: filename,
        verified}}

    var verify = baseBridge.defineFunction([
      makeRequest.defineOn(baseBridge)],
      function verify(makeRequest, baseRoute, id, verified) {
        var element = document.getElementById(
          id)
        var year = element.querySelector("[name=year]").value
        var artist = element.querySelector("[name=artist]").value
        var title = element.querySelector("[name=title]").value
        var filename = element.dataset.filename
        makeRequest({
          "method": "post",
          "path": baseRoute+"meta",
          "data": {
            filename,
            year,
            artist,
            title,
            verified}},
          function(data) {
            element.dataset.filename = data.newFilename})})

    var swap = baseBridge.defineFunction(
      function swap(id) {
        var element = document.getElementById(
          id)
        var artist = element.querySelector("[name=artist]")
        var title = element.querySelector("[name=title]")
        var newArtist = title.value
        var newTitle = artist.value
        artist.value = newArtist
        title.value = newTitle})

    var Painting = element.template(
      ".painting",
      element.style({
        "display": "flex",
        "flex-direction": "row",
        "align-items": "center",
        " input": {
          "display": "inline-block",
          "margin-right": "1em"}}),
      function(painting, baseRoute) {
        var id = this.assignId()
        this.addAttribute(
          "data-filename",
          painting.filename)
        this.addChildren([
          element(
            "input",{
            "name": "year",
            "type": "text",
            "size": "4",
            "value": painting.year}),
          element(
            "input",{
            "name": "artist",
            "type": "text",
            "size": "18",
            "value": painting.artist}),
          CircleButton(
            "⇌",
            swap.withArgs(
              id)),
          element(
            "input",{
            "name": "title",
            "type": "text",
            "size": "32",
            "value": painting.title}),
          CheckButton(
            baseBridge,
            verify.withArgs(
              baseRoute,
              id),
            "Verified",
            painting.verified)])})

    baseBridge.addToHead(
      element.stylesheet([
        Painting]))

    function cleanUpFileNames(site, baseRoute, nav) {
      site.addRoute(
        "get",
        baseRoute,
        function(_, response) {
          var rows = paintings.map(
            function(data) {
              return Painting(
                data,
                baseRoute)})
          baseBridge.forResponse(response).send([
            nav,
            rows])})

      site.addRoute(
        "post",
        baseRoute+"meta",
        function(request, response) {
          var oldFilename = request.body.filename
          var verified = request.body.verified
          var year = request.body.year.trim()
          var artist = request.body.artist.trim()
          var title = request.body.title.trim()

          var dots = verified ? ".." : "."
          var newFilename = year+" "+artist+", "+title+dots+"jpeg"

          var painting = paintings.find(
            function(painting) {
            return painting.filename == oldFilename})

          fs.renameSync(
            "paintings/"+oldFilename,
            "paintings/"+newFilename)
          
          painting.filename = newFilename
          painting.verified = verified
          painting.year = year
          painting.artist = artist
          painting.title = title

          console.log(
            "renamed "+newFilename)

          response.send({
            newFilename})})}

    return cleanUpFileNames})