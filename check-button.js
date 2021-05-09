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
        "border": "0.2em solid "+basicStyles.colors.light,
        "[aria-checked=false]:hover": {
          "border-color": basicStyles.colors.bright},
        "[aria-checked=true]:hover": {
          "background": basicStyles.colors.active.bright},
        "flex-shrink": "0",
        "width": "1.5em",
        "height": "1.5em",
        "border-radius": "1.5em",
        "cursor": "pointer",
        "color": "white",
        "box-sizing": "border-box",
        "text-align": "center",
        "line-height": "1.25em",
        "[aria-checked=true]": {
          "border-color": 'transparent',
          "background-color": basicStyles.colors.bright},
        ".check-button__dirty": {
          "border-color": basicStyles.colors.hey}}),
      "✔",
      function(bridge, onclick, label, checked, group, index, dirty) {
        if (group) {
          var id = group+"-"+index
          this.addAttribute(
            "id",
            id)
        } else {
          var id = this.assignId()}
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
            bridge.event,
            onclick)
            .evalable())
        if (dirty) {
          this.addSelector(
            ".check-button__dirty")}})

    CheckButton.defineOn = function defineOn(bridge) {
      var binding = bridge.remember(
        "check-button/toggle")

      if (binding) return

      bridge.addToHead(
        element.stylesheet(
          CheckButton))

      var last = bridge.defineSingleton(
        function() {
          return {
            automating: false,
            group: undefined,
            index: undefined }})

      binding = bridge.defineFunction([
        last],
        function toggleCheckButton(last, id, event, callback) {
          setTimeout(function() {
          document.getSelection().removeAllRanges();
          })
          var parts = id.match(/^(.*)-([0-9]+)$/)
          var group = parts[1]
          var index = parseInt(parts[2])
          if (event.shiftKey && last.group == group && !last.automating) {
            if (index < last.index) {
              var from = index
              var to = last.index
            } else {
              var from = last.index
              var to = index
            }
            // set the automating flag so we don't trigger some infinite recurion by hitting this branch again
            last.automating = true
            for(var i=from; i<=to; i++) {
              if (i != index && i != last.index) {
                var element = document.getElementById(
                    group+"-"+i)
                element.click()
              }
            }
            last.automating = false
            last.index = index
          } else {
            var from = index
            var to = index
          }

          if (!last.automating) {
            last.index = index
            last.group = group
          }

          var element = document.getElementById(
            id)
          var value = element.getAttribute(
            "aria-checked")
          var newValue = value == "true" ? false : true
          element.classList.remove(
            "check-button__dirty")
          element.setAttribute(
            "aria-checked",
            newValue)
          callback(
            newValue,
            event)})

      bridge.see(
        "check-button/toggle",
        binding)}

    return CheckButton })