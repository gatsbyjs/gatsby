const execa = require(`execa`)
const path = require(`path`)

function spawnGatsbyProcess(command = `develop`, env = {}) {
  return execa(process.execPath, [`./node_modules/gatsby/cli.js`, command], {
    stdio: [`inherit`, `inherit`, `inherit`],
    env: {
      ...process.env,
      NODE_ENV: command === `develop` ? `development` : `production`,
      ...env,
    },
  })
}

exports.spawnGatsbyProcess = spawnGatsbyProcess

exports.runGatsbyClean = () => spawnGatsbyProcess("clean")
