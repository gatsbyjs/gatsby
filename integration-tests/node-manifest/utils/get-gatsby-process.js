const { spawn } = require(`child_process`)
const path = require(`path`)

const gatsbyBin = path.join(`node_modules`, `.bin`, `gatsby`)

exports.spawnGatsbyProcess = (command = `develop`, env = {}) =>
  spawn(
    gatsbyBin,
    [command, ...(command === `develop` ? ["-H", "localhost"] : [])],
    {
      stdio: [`inherit`, `inherit`, `inherit`, `inherit`],
      env: {
        ...process.env,
        NODE_ENV: command === `develop` ? `development` : `production`,
        ...env,
      },
    }
  )
