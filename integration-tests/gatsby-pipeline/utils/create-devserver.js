const execa = require(`execa`)
const path = require(`path`)
const kill = require("tree-kill")
const basePath = path.resolve(__dirname, `../`)

const killProcess = devProcess =>
  new Promise(resolve => {
    devProcess.on(`exit`, () => {
      // give it some time to exit
      setTimeout(() => {
        resolve()
      }, 0)
    })

    kill(devProcess.pid)
  })

module.exports = () =>
  new Promise(resolve => {
    const devProcess = execa(`yarn`, [`develop`], {
      cwd: basePath,
      env: { NODE_ENV: `development` },
    })

    devProcess.stdout.on(`data`, chunk => {
      if (chunk.toString().includes(`You can now view`)) {
        // We only need to expose a kill function, the rest is not needed
        resolve({ kill: () => killProcess(devProcess) })
      }
    })
  })
