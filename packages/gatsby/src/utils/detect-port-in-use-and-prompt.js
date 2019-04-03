const detect = require(`detect-port`)
const report = require(`gatsby-cli/lib/reporter`)

// Checks if a port is in use and prompts the user to enter another one
// Then calls callback with new port
const detectPortInUseAndPrompt = (port, rlInterface, callback) => {
  let newPort = port

  detect(port, (err, _port) => {
    if (err) {
      report.panic(err)
    }

    if (port !== _port) {
      // eslint-disable-next-line max-len
      const question = `Something is already running at port ${port} \nWould you like to run the app at another port instead? [Y/n] `

      rlInterface.question(question, answer => {
        if (answer.length === 0 || answer.match(/^yes|y$/i)) {
          newPort = _port
        }
        callback(newPort)
      })
    } else {
      callback(newPort)
    }
  })
}

module.exports = detectPortInUseAndPrompt
