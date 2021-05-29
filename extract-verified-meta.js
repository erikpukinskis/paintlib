var library = require("module-library")(require)

module.exports = library.export(
  "extract-verified-meta",[
  "./trim"],
  function(trim) {
    function extractVerifiedMeta(filename) {
      if (!/\.\.jpeg$/.test(filename)) {
        return }

      var title = filename.replace(/\.\.jpeg$/, "")
      var year = ""
      var artist = ""

      var yearMatch = title.match(
        /^([0-9]{4}[?]?) /)

      if (/^- /.test(title)) {
        var year = "-"
        title = title.slice(2)
      } else if (yearMatch) {
        var year = yearMatch[1]
        title = title.replace(
          yearMatch[0],
          "")
      }

      var parts = title.match(/^([^,]*),(.*)$/)
      if (parts) {
        artist = parts[1]
        title = parts[2]
      }

      var meta = {
        year: year == "-" ? year : trim(year),
        title: trim(title),
        artist: trim(artist),
        filename: filename,
        verified: true }

      return meta}

    return extractVerifiedMeta})
