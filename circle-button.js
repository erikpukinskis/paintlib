var library = require("module-library")(require)

module.exports = library.export(
  "circle-button",[
  "web-element",
  "basic-styles"],
  function(element, basicStyles) {

    var CircleButton = element.template(
      "button.circle-button",{
      "role": "checkbox"},
      element.style({
        "display": "inline-block",
        "width": "1.333em",
        "height": "1.333em",
        "border-radius": "1em",
        "border": "none",
        "cursor": "pointer",
        "color": "white",
        "display": "flex",
        "flex-direction": "column",
        "align-items": "center",
        "box-sizing": "border-box",
        "background-color": basicStyles.light,
        "line-height": "0.9em",
        ":hover": {
          "background-color": "#999"}}),
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