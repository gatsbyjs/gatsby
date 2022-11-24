const execa = require(`execa`)
const path = require(`path`)
const kill = require("tree-kill")
const basePath = path.resolve(__dirname, `../`)

const killProcess = devProcess =>
  new Promise(resolve => {
    let timeout = setTimeout(() => {
      kill(devProcess.pid)
    }, 3000)

    devProcess.on(`exit`, () => {
      clearTimeout(timeout)

      setTimeout(() => {
        resolve()
      }, 100)
    })

    devProcess.cancel()
  })

function runDevelop() {
  return new Promise((resolve, reject) => {
    const devProcess = execa(
      process.execPath,
      [`./node_modules/gatsby/cli.js`, `develop`],
      {
        cwd: basePath,
        env: { NODE_ENV: `development` },
      }
    )

    devProcess.stdout.on(`data`, chunk => {
      if (chunk.toString().includes(`You can now view`)) {
        // We only need to expose a kill function, the rest is not needed
        resolve({ kill: () => killProcess(devProcess) })
      }
    })
  })
}

exports.clean = async function clean() {
  try {
    await execa(process.execPath, [`./node_modules/gatsby/cli.js`, `clean`], {
      cwd: basePath,
    })
  } catch (err) {}
}

exports.createDevServer = async () => runDevelop()
