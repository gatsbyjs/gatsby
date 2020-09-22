const http = require(`http`)
const { parse: parseUrl } = require(`url`)
const { spawn, spawnSync } = require(`child_process`)

const [, , preid] = process.argv

function waitFor(url, interval = 1000) {
  function exec(url, onDone) {
    const { hostname, port } = parseUrl(url)
    http
      .get(
        {
          hostname,
          port,
          path: `/`,
          agent: false, // Create a new agent just for this one request
        },
        ({ statusCode }) => {
          if (statusCode !== 200) {
            setTimeout(() => exec(url, onDone), interval)
            return
          }

          onDone()
        }
      )
      .on(`error`, () => {
        setTimeout(() => exec(url, onDone), interval)
      })
  }

  return new Promise((resolve, reject) => {
    exec(url, resolve)
  })
}

const proc = spawn(`verdaccio`, [`--config`, `config.yml`], {
  shell: true,
  cwd: __dirname,
})

proc.stdout.on(`data`, msg => {
  console.log(msg.toString())
})

proc.stderr.on(`data`, msg => {
  console.log(msg.toString())
  process.exit(-1)
})

waitFor(`http://127.0.0.1:4873`, 1000)
  .then(
    () =>
      new Promise(resolve => {
        const lerna = spawn(
          `yarn`,
          [
            `lerna`,
            `publish`,
            `--registry`,
            `http://127.0.0.1:4873`,
            `--canary`,
            `--preid`,
            preid,
            `--dist-tag`,
            preid,
            `--force-publish`,
            `--ignore-scripts`,
            `--yes`,
          ],
          {
            shell: true,
          }
        )

        lerna.stdout.on(`data`, msg => {
          console.log(msg.toString())
        })

        lerna.stderr.on(`data`, msg => {
          console.log(msg.toString())
          resolve(-1)
        })

        lerna.on(`exit`, exitCode => {
          resolve(exitCode)
        })
      })
  )
  .then(exitCode => {
    proc.kill(`SIGINT`)

    if (exitCode === 0) {
      process.exit(0)
      return
    }

    spawnSync(`git`, [`checkout`, `../..`])

    process.exit(0)
  })
