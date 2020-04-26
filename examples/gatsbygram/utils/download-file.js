var fs = require(`fs`)
var request = require(`request`)

module.exports = function(url, dest, cb) {
  var file = fs.createWriteStream(dest)
  var sendReq = request.get(url)

  // verify response code
  sendReq.on(`response`, function(response) {
    if (response.statusCode !== 200) {
      cb(`Response status was ` + response.statusCode)
      return
    }
  })

  // check for request errors
  sendReq.on(`error`, function(err) {
    fs.unlink(dest)

    if (cb) {
      cb(err.message)
      return
    }
  })

  sendReq.pipe(file)

  file.on(`finish`, function() {
    file.close(cb) // close() is async, call cb after close completes.
  })

  file.on(`error`, function(err) {
    // Handle errors
    fs.unlink(dest)

    // Delete the file async. (But we don't check the result)
    if (cb) {
      cb(err.message)
      return
    }
  })
}
