const { spawn } = require(`child_process`)

module.exports = function () {
  return new Promise((resolve, reject) => {
    const cp = spawn(`ulimit`, [`-n`])

    let output = ``
    cp.stdout.setEncoding(`utf8`)

    cp.stdout.on(`data`, data => output += data)
    cp.stdout.on(`exit`, code => {
      // If the ulimit command fails, or doesn't exist in the environment,
      // fall back to a safe number
      // This will most likely happen on Windows
      if (code != 0) { resolve(256) }

      resolve(parseInt(output, 10))
    })
  })
}
