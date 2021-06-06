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

    var CheckMark = element.template(
      ".check-mark",
      element.style({
        "display": "inline-block",
        "width": "1em",
        "height": "1em",
        " .check": {
          "transform": "rotate(45deg)",
          "height": "0.7em",
          "width": "0.3em",
          "margin-left": "25%",
          "border-bottom": "0.2em solid white",
          "border-right": "0.2em solid white"}}),
      function() {
        this.addChild(
          element(
            ".check"))})

    var StateButton = element.template(
      "button.state-button",
      element.style({
        " .loading-state": {
          "display": "none"},
        " .dirty-state": {
          "display": "none"},
        " .done-state": {
          "display": "none"},
        "[data-state=loading] .loading-state": {
          "display": "block"},
        "[data-state=dirty] .dirty-state": {
          "display": "block"},
        "[data-state=done] .done-state": {
          "display": "block"},
        "[data-state=loading]": {
          "pointer-events": "none"}

      }),{
      "data-state": "dirty"},
      function(text) {
        this.addChild(
          element(
            ".loading-state",
            Hourglass(
              1,
              "em",
              "rgba(255,255,255,0.5) transparent")))
        this.addChild(
          element(
            ".done-state",
            CheckMark()))
        this.addChild(
          element(
            ".dirty-state",
            text))})

    StateButton.defineOn = function(bridge) {
      if (bridge.remember(
        "state-button")) {
          return }
      Hourglass.defineOn(
        bridge)
      bridge.addToHead(
        element.stylesheet(
          StateButton,
          CheckMark))
      bridge.remember(
        "state-button",
        true)}

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

    var toggleState = bridge.defineFunction(
      function toggleState(buttonId) {
        var button = document.getElementById(
          buttonId)
        var state = button.dataset.state
        if (state === "loading") {
          button.dataset.state = "done"
        } else if (state === "done") {
          button.dataset.state = "dirty"
        } else {
          button.dataset.state = "loading"
          setTimeout(
            function() {
              button.dataset.state = "done"},
            2000)}})

    var button = StateButton("Hi")
    button.addAttribute(
      "onclick",
      toggleState.withArgs(
        button.assignId())
          .evalable())

    site.addRoute(
      "get",
      "/",
      function(request, response) {
        bridge.forResponse(response).send(button)
      })

    return {}
  })
