const http = require(`http`)
const { parse: parseUrl } = require(`url`)
const { spawn, spawnSync } = require(`child_process`)

const [, , cmd, preid] = process.argv

// verdaccio is not easily killable on windows
function killVerdaccio(proc) {
  proc.kill(`SIGINT`)
}

function promiseSpawn(shell, options) {
  const [command, ...args] = shell.split(` `)
  const proc = spawn(command, args, options)

  return {
    proc,
    promise: new Promise((resolve, reject) => {
      proc.on(`error`, err => {
        console.log(err)
        reject(-1)
      })

      proc.on(`exit`, exitCode => {
        resolve(exitCode)
      })
    }),
  }
}

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

          setTimeout(onDone, 2000)
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

process.on(`exit`, code => {
  console.log(`Process exit event with code: `, code)
})
;(async () => {
  const REGISTRY_URL = `http://127.0.0.1:4873`
  let exitCode = 0

  let verdaccioProc
  let verdaccioPromise

  // Setting a list of packages with lerna --force-publish works 100%, without it randomly fails.
  const workspaces = JSON.parse(
    JSON.parse(
      spawnSync(`yarn`, [`workspaces`, `info`, `--json`], {
        shell: true,
      }).stdout.toString()
    ).data
  )

  const packages = Object.keys(workspaces).filter(
    pkg => ![`gatsby-source-lever`, `gatsby-admin`].includes(pkg)
  )

  try {
    const verdaccio = promiseSpawn(`verdaccio --config config.yml`, {
      shell: true,
      cwd: __dirname,
    })

    verdaccioProc = verdaccio.proc
    verdaccioPromise = verdaccio.promise

    verdaccioProc.stdout.on(`data`, msg => {
      console.log(msg.toString())
    })

    verdaccioProc.stderr.on(`data`, msg => {
      console.log(msg.toString())
    })

    verdaccioPromise.then(exitC => {
      if (exitC === -1) {
        killVerdaccio(verdaccioProc)
        exitCode = exitC

        return new Promise(() => {
          setTimeout(() => {
            process.exit(-1)
          }, 1000)
        })
      }

      return Promise.resolve()
    })

    await waitFor(REGISTRY_URL, 1000)

    if (cmd === `publish` && !exitCode) {
      const { proc: lernaProc, promise: lernaPromise } = promiseSpawn(
        `yarn lerna publish --registry ${REGISTRY_URL} --canary --preid ${preid} --dist-tag ${preid} --force-publish=${packages.join(
          `,`
        )} --ignore-scripts --yes`,
        {
          shell: true,
        }
      )

      lernaProc.stdout.on(`data`, msg => {
        console.log(msg.toString())
      })

      lernaProc.stderr.on(`data`, msg => {
        console.log(msg.toString())
      })

      exitCode = await lernaPromise

      spawnSync(`git`, [`checkout`, `../..`])
    }

    if (cmd === `install` && !exitCode) {
      const { proc: installProc, promise: installPromise } = promiseSpawn(
        `${
          process.execArgv.includes(`--pm npm`) ? `npm` : `yarn`
        } --registry ${REGISTRY_URL}`,
        {
          shell: true,
        }
      )

      installProc.stdout.on(`data`, msg => {
        console.log(msg.toString())
      })

      installProc.stderr.on(`data`, msg => {
        console.log(msg.toString())
      })

      exitCode = await installPromise
      console.log(`installation done`)
    }
  } catch (err) {
    exitCode = -1
  } finally {
    killVerdaccio(verdaccioProc)
  }

  process.exit(exitCode || 0)
})()
