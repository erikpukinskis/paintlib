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
      function(filename, index) {
        paintings[index] = extractVerifiedMeta(
          filename,
          index)})

    var painters = paintings.filter(
      hasVerifiedArtist)
      .map(
        function(painting) {
          return painting.artist})

    var paintersRegExp = buildPaintersRegExp(
      painters)

    function buildPaintersRegExp(painters) {
      var paintersString = painters.map(
        toPainterRegExp)
        .join(
          "|")
      return new RegExp(
        "("+paintersString+")",
        "i")}

    function toPainterRegExp(name) {
      name = name.replace(/\./, "[.]?")
      var names = name.split(" ")

      if (names.length == 2) {
        var first = names[0]
        var last = names[1]
        name = first+"( [a-zA-Z]+| [A-Z][.])? "+last}

      return new RegExp(
        name,
        "i")}

    console.log(paintersRegExp)

    filenames.forEach(
      function(filename, index) {
        if (paintings[index]) return
        paintings[index] = guessPaintingMeta(
          filename)})

    function addPainter(painter) {
      // if (painters.includes(painter)) {
      //   return }

      if (!painters.includes(painter)) {
        painters.push(
          painter)
        console.log("Added a new painter!", painter)
      }

      // painters.push(
      //   painter)
      paintersRegExp = buildPaintersRegExp(
        painters)

      var painterRegExp = toPainterRegExp(
        painter)

      var freshMeta = []

      paintings.forEach(
        function(painting, index) {
          if (!painterRegExp.test(
            painting.filename)) {
            return}
          var meta = guessPaintingMeta(
            painting.filename)
          meta.index = index
          if (!meta) {
            return}
          freshMeta.push(
            meta)})

      return freshMeta
    }

    function extractVerifiedMeta(filename) {
      if (!/\.\.jpeg$/.test(filename)) {
        return }

      var title = filename.replace(/\.\.jpeg$/, "")
      var year = ""
      var artist = ""

      var yearMatch = title.match(
        /^([0-9]{4}[?]?) /)

      if (/^- /.test(title)) {
        var year = "-"
        title = title.slice(2)
      } else if (yearMatch) {
        var year = yearMatch[1]
        title = title.replace(
          yearMatch[0],
          "")
      }

      var parts = title.match(/^([^,]*),(.*)$/)
      if (parts) {
        artist = parts[1]
        title = parts[2]
      }

      var meta = {
        year: year == "-" ? year : trim(year),
        title: trim(title),
        artist: trim(artist),
        filename: filename,
        verified: true }

      return meta}

    function trim(text) {
      var frontClean = text.replace(
        /^[- \.,—_"]+/,
        "")
      var backClean = frontClean.replace(
        /[- \.,—_"]+$/,
        "")
      var byClean = backClean.replace(
        / ?by$/,
        "")
      var sClean = byClean.replace(
        /^['’]s /,
        "")
      // if (backClean != text) {
      //   console.log(JSON.stringify(text),"→",JSON.stringify(backClean))
      //   debugger
      // }
      return sClean}

    function hasVerifiedArtist(painting) {
      return painting && painting.verified && painting.artist}

    function whitelist(filename) {
      if (filename === ".DS_Store") {
        return false }
      return true }

    function guessPaintingMeta(filename) {
      var originalFilename = filename.replace(/\.(jpg|jpeg)$/i, "")
      var title = originalFilename
      var year = ""
      var artist = ""

      if (!/ /.test(
        title)) {
        var withSpaces = title.replace(
          /[-_]+/g,
          " ")
        title = withSpaces}

      var years = title.match(/[0-9]{4}/g)

      if (years && years.length == 1) {
        var year = years[0]
        title = title.replace(year, "")
      }

      for(var painter of painters) {
        // if (painter == "Georgia" && /Maia S. Oprea/i.test(filename)) {
        //   console.log(filename)
        //   debugger
        // }
        var painterMatch = title.match(
          toPainterRegExp(
            painter))
        if (!painterMatch) {
          continue}
        artist = painter
        title = title.replace(
          painterMatch[0],
          "")
        break}

      if (!artist && /,/.test(title)) {
        var parts = title.match(/^([^,]*),(.*)$/)
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

      return meta}

    function metaToFilename(meta) {
      return meta.year+" "+meta.artist+", "+meta.title}

    function capitalize(text) {
      return text.slice(0,1).toUpperCase()+text.slice(1).toLowerCase()}

    var updateMeta = baseBridge.defineFunction(
      function updateMeta(painting) {
        var element = document.querySelector("[data-filename='"+painting.filename.replace("'", "\\'")+"']")

        if (!element || !painting.dirty) return

        var year = element.querySelector("[name=year]")
        var artist = element.querySelector("[name=artist]")
        var title = element.querySelector("[name=title]")

        year.value = painting.year
        artist.value = painting.artist
        title.value = painting.title
        element.classList.add(
          "hot-flash")})

    var verify = baseBridge.defineFunction([
      makeRequest.defineOn(baseBridge),
      updateMeta],
      function verify(makeRequest, updateMeta, baseRoute, id, verified, event) {
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
            element.dataset.filename = data.renamed.filename
            debugger
            data.paintings.forEach(
              updateMeta)})})

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
            "size": "5",
            "value": painting.year}),
          element(
            "input",{
            "name": "artist",
            "type": "text",
            "size": "20",
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
          var artist = request.body.artist
          var verified = request.body.verified

          var dots = verified ? ".." : "."
          var newFilename = metaToFilename(request.body)+dots+"jpeg"

          var index = paintings.findIndex(
            function(painting) {
            return painting.filename == oldFilename})

          if (fs.existsSync(
            "paintings/"+newFilename)) {
            throw new Error("paintings/"+newFilename+" already exists. Seems dangerous to rename")}

          fs.renameSync(
            "paintings/"+oldFilename,
            "paintings/"+newFilename)
          
          if (verified) {
            var otherChanges = addPainter(
              artist)
            if (otherChanges) {
              otherChanges.forEach(
                function(painting) {
                  paintings[painting.index] = painting})
            }
            var meta = 
              extractVerifiedMeta(
                newFilename)
          } else {
            var otherChanges = []
            var meta = guessPaintingMeta(
              newFilename)
          }

          paintings[index] = meta
        
          console.log(
            "renamed "+newFilename)

          response.send({
            paintings: otherChanges,
            renamed: meta})})}

    return cleanUpFileNames})
