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
      }, 100)
    })

    kill(devProcess.pid)
  })

function runDevelop() {
  return new Promise((resolve, reject) => {
    const devProcess = execa(`yarn`, [`develop`], {
      cwd: basePath,
      env: { NODE_ENV: `development` },
    }).catch(err => {
      killProcess(devProcess.pid)
      reject(err)
    })

    devProcess.stdout.on(`data`, chunk => {
      if (chunk.toString().includes(`You can now view`)) {
        devProcess.removeListener("exit", onExit)
        // We only need to expose a kill function, the rest is not needed
        resolve({ kill: () => killProcess(devProcess) })
      }
    })
  })
}

exports.clean = async function clean() {
  try {
    await execa(`yarn`, [`clean`], {
      cwd: basePath,
    })
  } catch (err) {
    // ignore
  }
}

exports.createDevServer = async () => {
  try {
    await runDevelop()
  } catch (err) {
    await runDevelop()
  }
}
