var library = require("module-library")(require)

module.exports = library.export(
  "clean-up-file-names",[
  "browser-bridge",
  "web-element",
  "basic-styles",
  "fs",
  "./check-button",
  "make-request"],
  function(BrowserBridge, element, basicStyles, fs, CheckButton, makeRequest) {

    var baseBridge = new BrowserBridge()

    basicStyles.addTo(
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
        year,
        title,
        artist,
        filename,
        verified}}

    var confirmMeta = baseBridge.defineFunction([
      makeRequest.defineOn(baseBridge)],
      function confirmMeta(makeRequest, baseRoute, id, value) {
        var element = document.getElementById(
          id)
        var year = element.querySelector("[name=year]").value
        var artist = element.querySelector("[name=artist]").value
        var title = element.querySelector("[name=title]").value
        var filename = element.dataset.filename
        makeRequest({
          "method": "post",
          "path": baseRoute+"/filename/"+filename+"/meta",
          "data": {
            year,
            artist,
            title}})})

    CheckButton.defineOn(
      baseBridge)

    var Painting = element.template(
      ".painting",
      element.style({
        "display": "flex",
        "flex-direction": "row",
        "align-items": "center",
        " input": {
          "display": "inline-block",
          "margin-right": "1em"}}),
      function(painting, baseUrl) {
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
          element(
            "input",{
            "name": "title",
            "type": "text",
            "size": "32",
            "value": painting.title}),
          CheckButton(
            baseBridge,
            confirmMeta.withArgs(
              baseUrl,
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
        baseRoute+"/filename/:filename/meta",
        function(request, response) {
          var filename = request.params.filename
          var year = request.body.year
          var artist = request.body.artist
          var title = request.body.title
          var newFilename = year+" "+artist+", "+title+"..jpeg"
          rename(filename, newFilename)
          response.send({
            ok: true})})}

    function rename(oldFilename, newFilename) {
      var painting = paintings.find(withName)
      function withName(painting) {
        return painting.filename == oldFilename}
      painting.filename = newFilename
      fs.renameSync(
        "paintings/"+oldFilename,
        "paintings/"+newFilename)
      console.log(
        "renamed "+newFilename)}

    return cleanUpFileNames})