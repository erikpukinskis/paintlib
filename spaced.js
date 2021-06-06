var library = require("module-library")(require)

module.exports = library.export(
  "spaced",[
  "web-element"],
  function(element) {

    var Spaced = element.template.container(
      ".spaced",
      element.style({
        "display": "flex",
        "flex-direction": "row",
        " > *": {
          "margin-right": "8px"},
        " > :last-child": {
          "margin-right": "0px"}}))

    Spaced.addTo = function(bridge) {
      if (bridge.remember(
        "spaced")) {
          return }
      bridge.addToHead(
        element.stylesheet(
          Spaced))
      bridge.see(
        "spaced",
        true)}

    return Spaced})