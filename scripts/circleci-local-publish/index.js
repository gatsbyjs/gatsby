const http = require(`http`)
const path = require(`path`)
const fs = require(`fs`)
const { spawn, spawnSync } = require(`child_process`)

const [, , cmd, preid] = process.argv

// verdaccio is not easily killable on windows
function killVerdaccio(proc) {
  proc.kill(`SIGINT`)
}

function sleep(timeout) {
  return new Promise(resolve => setTimeout(resolve, timeout))
}

function fetch(url, options) {
  return new Promise((resolve, reject) => {
    http
      .request(url, options, res => {
        resolve(res.statusCode)
      })
      .on(`error`, err => {
        reject(err)
      })
      .end()
  })
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
    fetch(url, {
      options: `HEAD`,
    })
      .then(statusCode => {
        if (statusCode !== 200) {
          setTimeout(() => exec(url, onDone), interval)
          return
        }

        onDone()
      })
      .catch(() => {
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
  const REGISTRY_URL = `http://localhost:4873`
  let exitCode = 0

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

    await Promise.race([
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
      }),
      sleep(1000),
    ])

    await waitFor(REGISTRY_URL, 1000)

    // Setting a list of packages with lerna --force-publish works 100%, without it randomly fails.
    const workspaces = JSON.parse(
      spawnSync(`yarn`, [`-s`, `lerna`, `list`, `--json`, `--toposort`], {
        shell: true,
        cwd: path.resolve(__dirname, `../../`),
      }).stdout.toString()
    )

    // monorepo packages
    const packages = workspaces
      // .filter(pkg => !pkg.private && pkg.name !== `gatsby-admin`)
      .map(pkg => pkg.name)

    if (cmd === `publish` && !exitCode) {
      // Fill up the verdaccio registry so it knows all packages
      // Without this lerna errored on missing packgitages ¯\_(ツ)_/¯
      // => lerna ERR! E404 no such package available
      await Promise.all(
        packages.map(pkg => fetch(`${REGISTRY_URL}/${pkg}`), {
          method: `HEAD`,
        })
      )

      const { proc: lernaProc, promise: lernaPromise } = promiseSpawn(
        `yarn lerna publish --registry ${REGISTRY_URL} --canary --preid ${preid} --dist-tag ${preid} --force-publish=${packages} --ignore-scripts --yes`,
        {
          shell: true,
        }
      )

      lernaProc.stdout.on(`data`, msg => {
        // console.log(msg.toString())
      })

      lernaProc.stderr.on(`data`, msg => {
        // console.log(msg.toString())
      })

      exitCode = await lernaPromise

      spawnSync(`git`, [`checkout`, `../..`])
    }

    if (cmd === `install` && !exitCode) {
      console.log(`install`)
      const packageJson = require(path.join(process.cwd(), `package.json`))
      const { dependencies, devDependencies } = packageJson

      for (const pkg in dependencies) {
        if (packages.includes(pkg)) {
          dependencies[pkg] = preid
        }
      }
      for (const pkg in devDependencies) {
        if (packages.includes(pkg)) {
          devDependencies[pkg] = preid
        }
      }

      console.log(JSON.stringify(packageJson, null, 2))
      fs.writeFileSync(
        path.join(process.cwd(), `package.json`),
        JSON.stringify(packageJson, null, 2)
      )

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
