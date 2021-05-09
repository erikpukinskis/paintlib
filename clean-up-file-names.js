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


    var filenames = fs.readdirSync(
      "./paintings")
      .filter(
        whitelist)

    var paintings = []

    filenames.forEach(
      extractVerifiedMeta)

    var painters = paintings.filter(
      hasVerifiedArtist)
      .map(
        toArtist)

    var paintersString = painters.join(
      "|")
    var paintersRegExp = new RegExp(
      "("+paintersString+")",
      'i')

    filenames.forEach(
      guessPaintingMeta)

    function extractVerifiedMeta(filename, i) {
      if (!/\.\.jpeg$/.test(filename)) {
        return }

      var title = filename.replace(/\.\.jpeg$/, "")
      var year = ""
      var artist = ""

      if (/^- /.test(title)) {
        var year = "-"
        title = title.slice(2)
      } else if (/^[0-9]{4} /.test(title)) {
        var year = title.slice(0,4)
        title = title.slice(5)
      }

      var parts = title.match(/^([^,]*),(.*)$/)
      if (parts) {
        artist = parts[1]
        title = parts[2]
      }

      paintings[i] = {
        year: trim(year),
        title: trim(title),
        artist: trim(artist),
        filename: filename,
        verified: true }}

    function trim(text) {
      var frontClean = text.replace(
        /^[ \.,]+/,
        "")
      var backClean = frontClean.replace(
        /[ \.,]+$/,
        "")
      // if (backClean != text) {
      //   console.log(JSON.stringify(text),"→",JSON.stringify(backClean))
      //   debugger
      // }
      return backClean}

    function hasVerifiedArtist(painting) {
      return painting.verified && painting.artist}

    function toArtist(painting) {
      return painting.artist}

    function whitelist(filename) {
      if (filename === '.DS_Store') {
        return false }
      return true }

    function guessPaintingMeta(filename, i) {
      if (paintings[i]) {
        return }

      var originalFilename = filename.replace(/\.(jpg|jpeg)$/i, "")
      var title = originalFilename
      var year = ""
      var artist = ""

      var years = title.match(/[0-9]{4}/g)

      if (years && years.length == 1) {
        var year = years[0]
        title = title.replace(year, "")
      }

      var painterMatch = title.match(
          paintersRegExp)

      if (painterMatch) {
        artist = painterMatch[1]
        title = title.replace(artist, "")
      } else if (/,/.test(title)) {
        var parts = title.match(/^(.*),(.*)$/)
        artist = parts[1]
        title = parts[2]
      }

      var meta = {
        year: trim(year),
        title: trim(title),
        artist: trim(artist),
        filename: filename,
        verified: false}

      var newFilename = metaToFilename(
        meta)
      meta.dirty = newFilename != originalFilename
      paintings[i] = meta}

    function metaToFilename(meta) {
      return meta.year+" "+meta.artist+", "+meta.title}

    function copyMeta(meta, painting) {
      painting.verified = meta.verified
      painting.year = meta.year
      painting.artist = meta.artist
      painting.title = meta.title }

    var verify = baseBridge.defineFunction([
      makeRequest.defineOn(baseBridge)],
      function verify(makeRequest, baseRoute, id, verified, event) {
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
      function(painting, baseRoute, index) {
        var id = "painting-"+index
        this.addAttribute(
          "id",
          id)
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
            painting.verified,
            "verification-checkbox",
            index,
            painting.dirty)])})

    baseBridge.addToHead(
      element.stylesheet([
        Painting]))

    function cleanUpFileNames(site, baseRoute, nav) {
      site.addRoute(
        "get",
        baseRoute,
        function(_, response) {
          var rows = paintings.map(
            function(data, i) {
              return Painting(
                data,
                baseRoute,
                i)})
          baseBridge.forResponse(response).send([
            nav,
            rows])})

      site.addRoute(
        "post",
        baseRoute+"meta",
        function(request, response) {
          var oldFilename = request.body.filename

          var dots = request.body.verified ? ".." : "."
          var newFilename = metaToFilename(request.body)+dots+"jpeg"

          var painting = paintings.find(
            function(painting) {
            return painting.filename == oldFilename})

          fs.renameSync(
            "paintings/"+oldFilename,
            "paintings/"+newFilename)
          
          copyMeta(
            request.body,
            painting)
          painting.filename = newFilename

          console.log(
            "renamed "+newFilename)

          response.send({
            newFilename})})}

    return cleanUpFileNames})