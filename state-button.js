var library = require("module-library")(require)

library.define(
  "hourglass",[
  "web-element"],
  function(element) {

    var Hourglass = element.template(
      ".lds-hourglass",
      element.style({
        "display": "inline-block",
        "position": "relative",
        " .spinner": {
          "content": "\" \"",
          "display": "block",
          "border-radius": "50%",
          "width": "0",
          "height": "0",
          "box-sizing": "border-box",
          "border-style": "solid",
          "animation": "lds-hourglass 1.2s infinite",
        }}),
      function(size, units, colors) {
        var half = parseFloat((size/2).toFixed(3))
        this.appendStyles({
          "width": size+units,
          "height": size+units})
        this.addChild(
          element(
            ".spinner",
            element.style({
            "border-color": colors+" "+colors,
              "border-width": half+units})))})

    var keyframes = element.style(
      "@keyframes lds-hourglass",{
      "0%": {
        "transform": "rotate(0)",
        "animation-timing-function": "cubic-bezier(0.55, 0.055, 0.675, 0.19)"},
      "50%": {
        "transform": "rotate(900deg)",
        "animation-timing-function": "cubic-bezier(0.215, 0.61, 0.355, 1)"},
      "100%": {
        "transform": "rotate(1800deg)"}})

  Hourglass.defineOn = function(bridge) {
    if (bridge.remember(
      "hourglass")) {
        return }
    bridge.addToHead(
      element.stylesheet(
        Hourglass,
        keyframes))
    bridge.see(
      "hourglass",
      true)}

  return Hourglass})

module.exports = library.export(
  "state-button",[
  "web-element",
  "hourglass"],
  function(element, Hourglass) {
    var StateButton = element.template(
      "button.state-button",
      element.style({

      }),
      function(text) {
        this.addChild(
          ".loading-state",
          Hourglass(
            1,
            "em",
            "rgba(255,255,255,0.5) transparent"))
        this.addChild(
          element(
            ".dirty-state",
            text))})

    StateButton.defineOn = function(bridge) {
      Hourglass.defineOn(bridge)}

    return StateButton})



library.define(
  "state-button/demo",[
  "state-button",
  "web-site",
  "browser-bridge",
  "web-element",
  "basic-styles"],
  function(StateButton, WebSite, BrowserBridge, element, basicStyles) {
    var site = new WebSite()
    site.start(8080)
    var bridge = new BrowserBridge()
    basicStyles.addTo(bridge)
    StateButton.defineOn(bridge)

    var button = StateButton("Hi")

    site.addRoute(
      "get",
      "/",
      function(request, response) {
        bridge.forResponse(response).send(button)
      })

    return {}
  })
