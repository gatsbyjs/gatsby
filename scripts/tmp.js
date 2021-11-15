const path = require(`path`)
const { spawn, execSync } = require(`child_process`)

async function run() {
  const gatsbyPKG = require(`../packages/gatsby/package.json`)
  const nextMajor = String(Number(gatsbyPKG.version.match(/[^.]+/)[0]) + 1)

  function promiseSpawn(command, args, options) {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, options)

      let error
      proc.on(`error`, err => {
        error = err
      })

      if (proc.stdout) {
        proc.stdout.on(`data`, data => {
          console.log(data.toString())
        })
      }
      if (proc.stderr) {
        proc.stderr.on(`data`, data => {
          console.log(`${data.toString()}`)
        })
      }

      proc.on(`close`, code => {
        if (code === 0) {
          resolve()
        } else {
          reject(error)
        }
      })
    })
  }

  const tagName = `alpha-9689ff`
  const preId = `alpha-9689ff`

  console.log(` `)
  console.log(`=== PUBLISHING V${nextMajor} ALPHA ===`)
  await promiseSpawn(
    process.execPath,
    [
      `./node_modules/lerna/cli.js`,
      `publish`,
      `--canary`,
      `premajor`,
      `--ignore-scripts`,
      `--exact`,
      `--preid`,
      preId,
      `--pre-dist-tag`,
      tagName,
      `--force-publish`, // publish all
    ],
    {
      cwd: path.resolve(__dirname, `../`),
      stdio: [`inherit`, `inherit`, `inherit`],
    }
  )
}

run()
