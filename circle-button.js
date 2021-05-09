var library = require("module-library")(require)

module.exports = library.export(
  "circle-button",[
  "web-element",
  "basic-styles"],
  function(element, basicStyles) {

    var CircleButton = element.template(
      ".circle-button.button.light",{
      "role": "checkbox"},
      element.style({
        "display": "inline-block",
        "width": "1.5em",
        "height": "1.5em",
        "border-radius": "1.5em",
        "border": "none",
        "cursor": "pointer",
        "color": "white",
        "display": "flex",
        "flex-direction": "column",
        "align-items": "center",
        "box-sizing": "border-box",
        "line-height": "1em",
        "font-weight": "bold"}),
      function(child, onclick) {
        this.addAttribute(
          "onclick", onclick.evalable())
        this.addChild(
          child)})

    CircleButton.defineOn = function(bridge) {
      if (bridge.remember(
        "circle-button")) {
        return }
      bridge.addToHead(
        element.stylesheet(
          CircleButton))
      bridge.see(
        "circle-button",
        true)}

    return CircleButton })