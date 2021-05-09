var library = require("module-library")(require)

module.exports = library.export(
  "clean-up-file-names",[
  "browser-bridge",
  "web-element",
  "basic-styles",
  "fs"],
  function(BrowserBridge, element, basicStyles, fs) {

    var baseBridge = new BrowserBridge()

    basicStyles.addTo(
      baseBridge)

    var filenames = fs.readdirSync(
      "./paintings").filter(
      whitelist)

    function whitelist(filename) {
      if (filename === '.DS_Store') {
        return false }
      return true }

    var Painting = element.template(
      "p.painting",
      element.style({
        " input": {
          "display": "inline-block",
          "margin-right": "1em"}}),
      function(painting) {
        this.addChildren([
          element(
            "input",{
            "type": "text",
            "size": "4",
            "value": ""}),
          element(
            "input",{
            "type": "text",
            "size": "12",
            "value": ""}),
          element(
            "input",{
            "type": "text",
            "size": "24",
            "value": painting}),
          ])})

    baseBridge.addToHead(
      element.stylesheet([
        Painting]))

    var names = filenames.map(Painting)

    function cleanUpFileNames(site, baseRoute, nav) {
      site.addRoute(
        "get",
        baseRoute,
        function(_, response) {
          baseBridge.forResponse(response).send([
            nav,
            names])})}

    return cleanUpFileNames})