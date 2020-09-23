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
    promise: new Promise(resolve => {
      proc.on(`error`, err => {
        console.log(err)
        resolve(-1)
      })

      proc.on(`exit`, exitCode => {
        resolve(exitCode)
      })
      proc.on(`close`, exitCode => {
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

process.on(`exit`, code => {
  console.log(`Process exit event with code: `, code)
})
;(async () => {
  const REGISTRY_URL = `http://127.0.0.1:4873`

  let verdaccioProc
  let verdaccioPromise

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

    verdaccioPromise.then(exitCode => {
      if (exitCode === -1) {
        killVerdaccio(verdaccioProc)

        return new Promise(() => {
          setTimeout(() => {
            process.exit(-1)
          }, 1000)
        })
      }

      return Promise.resolve()
    })

    await waitFor(REGISTRY_URL, 1000)

    if (cmd === `publish`) {
      const { proc: lernaProc, promise: lernaPromise } = promiseSpawn(
        `yarn lerna publish --registry ${REGISTRY_URL} --canary --preid ${preid} --dist-tag ${preid} --force-publish --ignore-scripts --yes`,
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

      await lernaPromise

      spawnSync(`git`, [`checkout`, `../..`])
    }

    if (cmd === `install`) {
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

      await installPromise
      console.log(`installation done`)
    }
  } catch (err) {
    process.exitCode = -1
  } finally {
    killVerdaccio(verdaccioProc)
  }

  process.exit(process.exitCode || 0)
})()
