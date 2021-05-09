var library = require("module-library")(require)

module.exports = library.export(
  "clean-up-file-names",[
  "browser-bridge",
  "web-element",
  "basic-styles",
  "fs",
  "./check-button"],
  function(BrowserBridge, element, basicStyles, fs, CheckButton) {

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
      var title = filename.replace(/[.](jpg|jpeg)$/, "")
      var year = ""
      var artist = ""

      if (/^- /.test(title)) {
        var year = "–"
        title = title.slice(2)
      }

      return {
        year: year,
        title: title,
        artist: artist,
        filename: filename}}

    var confirmMeta = baseBridge.defineFunction(
      function confirmMeta(id) {
        console.log("confirm", id)
      })

    CheckButton.defineOn(
      baseBridge)

    var Painting = element.template(
      ".painting",
      element.style({
        "display": "flex",
        "flex-direction": "row",
        "align-items": "center",
        " input": {
          "padding-top": "0",
          "display": "inline-block",
          "margin-right": "1em"}}),
      function(painting) {
        var id = this.assignId()
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
              id),
            "Verified")])})

    baseBridge.addToHead(
      element.stylesheet([
        Painting]))

    var rows = paintings.map(Painting)

    function cleanUpFileNames(site, baseRoute, nav) {
      site.addRoute(
        "get",
        baseRoute,
        function(_, response) {
          baseBridge.forResponse(response).send([
            nav,
            rows])})}

    return cleanUpFileNames})