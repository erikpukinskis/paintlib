var library = require("module-library")(require)

module.exports = library.export(
  "trim",
  function() {
    function trim(text) {
      var frontClean = text.replace(
        /^[- \.,—_"]+/,
        "")
      var backClean = frontClean.replace(
        /[- \.,—_"]+$/,
        "")
      var byClean = backClean.replace(
        / by$/,
        "")
      var sClean = byClean.replace(
        /^['’]s /,
        "")
      // if (backClean != text) {
      //   console.log(JSON.stringify(text),"→",JSON.stringify(backClean))
      //   debugger
      // }
      return sClean}

    return trim})