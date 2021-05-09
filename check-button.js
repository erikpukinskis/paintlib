var library = require("module-library")(require)

module.exports = library.export(
  "check-button",[
  "web-element",
  "basic-styles"],
  function(element, basicStyles) {

    var CheckButton = element.template(
      ".check-button",{
      "role": "checkbox"},
      element.style({
        "display": "inline-block",
        "border": "0.1em solid "+basicStyles.light,
        "width": "1.333em",
        "height": "1.333em",
        "border-radius": "1em",
        "cursor": "pointer",
        "color": "white",
        "box-sizing": "border-box",
        "text-align": "center",
        "line-height": "1.333em",
        "[aria-checked=true]": {
          "border-color": basicStyles.green,
          "background-color": basicStyles.green}}),
      "✔",
      function(bridge, onclick, label, checked) {
        var id = this.assignId()
        var toggleCheckButton = bridge.remember(
          "check-button/toggle")
        if (!toggleCheckButton) {
          throw new Error(
            "You must call checkButton.defineOn(bridge) if you want to use it on a bridge")}
        this.addAttribute(
          "aria-label",
          label)
        this.addAttribute(
          "aria-checked",
          checked ? "true" : "false")
        this.addAttribute(
          "onclick",
          toggleCheckButton.withArgs(
            id,
            onclick)
            .evalable())})

    CheckButton.defineOn = function defineOn(bridge) {
      var binding = bridge.remember(
        "check-button/toggle")
      if (binding) return
      bridge.addToHead(
        element.stylesheet(
          CheckButton))
      binding = bridge.defineFunction(
        function toggleCheckButton(id, callback) {
          var element = document.getElementById(
            id)
          var value = element.getAttribute(
            "aria-checked")
          var newValue = value == "true" ? false : true
          element.setAttribute(
            "aria-checked",
            newValue)
          callback(
            newValue)})
      bridge.see(
        "check-button/toggle",
        binding)}

    return CheckButton })