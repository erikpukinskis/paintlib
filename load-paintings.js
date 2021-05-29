var library = require("module-library")(require)

module.exports = library.export(
  "load-paintings",[
  "fs",
  "./extract-verified-meta"],
  function(fs, extractVerifiedMeta) {
    function loadPaintings() {
      var filenames = fs.readdirSync(
        "./paintings")
        .filter(
          whitelist)

      var paintings = []

      filenames.forEach(
        function(filename, index) {
          paintings[index] = extractVerifiedMeta(
            filename,
            index)})

      var painters = paintings.reduce(
        function(painters, painting) {
          if (!painting || !painting.artist || !painting.verified || painters.has(
            painting.artist)) {
              return painters}
          painters.add(
            painting.artist)
          return painters},
        new Set())

      return { paintings, painters: Array.from(painters), filenames }}

    function whitelist(filename) {
      if (filename === ".DS_Store") {
        return false }
      return true }

    return loadPaintings})