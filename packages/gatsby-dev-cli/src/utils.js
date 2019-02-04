const child_process = require(`child_process`)

exports.promisifiedSpawn = ([cmd, args = [], spawnArgs = {}]) =>
  new Promise((resolve, reject) => {
    const proc = child_process.spawn(cmd, args, spawnArgs)

    // piping output is probably just temporary for dev - it adds a lot of noise
    proc.stdout.setEncoding(`utf8`)
    proc.stdout.on(`data`, console.log)

    proc.stderr.setEncoding(`utf8`)
    proc.stderr.on(`data`, console.error)

    proc.on(`close`, code => {
      if (code) {
        // console.log(cmd, args, `failed`, code)
        reject(code)
      } else {
        resolve()
      }
    })
  })
