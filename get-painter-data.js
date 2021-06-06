var library = require("module-library")(require)

module.exports = library.export(
  "get-painter-data",[
  "fs",
  "make-request"],
  function(fs, makeRequest) {

    function getPainterData(painterName, callback) {
      var filename = "painters/"+painterName+".json"

      if (!fs.existsSync(filename)) {
        fetchPainterImages(painterName, callback)
        return }

      var data = JSON.parse(
        fs.readFileSync(
          filename))

      var imageObjects = data.value.map(function(data) {
        return {
          url: data.contentUrl,
          width: data.width,
          height: data.height }})

      console.log("loaded "+filename)

      callback(imageObjects)}

    function fetchPainterImages(painterName, callback) {
      var url = "https://api.bing.microsoft.com/v7.0/images/search?"+buildQueryString({
        q: painterName+" painting",
        count: 150,
        offset: 0,
        minWidth: 700,
        minHeight: 700,
        safeSearch: "off"
      });

      makeRequest({
        method: "get",
        url: url,
        headers: {
          "Ocp-Apim-Subscription-Key": process.env.BING_SEARCH_API_SUBSCRIPTION_KEY,
          "Accept": "application/json"}},
        function(json, response) {
          if (response.statusCode !== 200) {
            console.error(
              JSON.stringify(
                JSON.parse(json),
                null,
                4))
            return}
          var data = JSON.parse(
              json)
          var formatted = JSON.stringify(
            data,
            null,
            4)
          var filename = "painters/"+painterName+".json"
          fs.writeFileSync(
            filename,
            formatted)
          console.log("wrote "+filename)
          callback(data)})}


    function buildQueryString(obj) {
      var str = [];
      for (var p in obj)
        if (obj.hasOwnProperty(p)) {
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
      return str.join("&")}

    return getPainterData })