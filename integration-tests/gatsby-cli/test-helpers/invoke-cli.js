import execa, { sync } from "execa"
import { join } from "path"
import strip from "strip-ansi"
import { createLogsMatcher } from "./matcher"
import kill from "tree-kill"

const gatsbyBinLocation = join(
  __dirname,
  "..",
  `node_modules`,
  `gatsby-cli`,
  `cli.js`
)

function waitChildProcessExit(pid, resolve, reject, attempt = 0) {
  try {
    process.kill(pid, 0) // check if process is still running
    if (attempt > 15) {
      reject(new Error("Gatsby process hasn't exited in 15 seconds"))
      return
    }
    setTimeout(() => {
      waitChildProcessExit(pid, resolve, reject, attempt + 1)
    }, 1000)
  } catch (e) {
    resolve()
  }
}
// Use as `GatsbyCLI.cwd('execution-folder').invoke('new', 'foo')`
export const GatsbyCLI = {
  from(relativeCwd) {
    return {
      invoke(args) {
        const NODE_ENV =
          (Array.isArray(args) ? args[0] : args) === `develop`
            ? `development`
            : `production`
        try {
          const results = sync(
            process.execPath,
            [gatsbyBinLocation].concat(args),
            {
              cwd: join(__dirname, `../`, `./${relativeCwd}`),
              env: { NODE_ENV, CI: 1, GATSBY_LOGGER: `ink` },
            }
          )
          return [
            results.exitCode,
            createLogsMatcher(strip(results.stdout.toString())),
          ]
        } catch (err) {
          return [
            err.exitCode,
            createLogsMatcher(strip(err.stdout?.toString() || ``)),
          ]
        }
      },

      invokeAsync: (args, onExit) => {
        const NODE_ENV =
          (Array.isArray(args) ? args[0] : args) === `develop`
            ? `development`
            : `production`
        const res = execa(process.execPath, [gatsbyBinLocation].concat(args), {
          cwd: join(__dirname, `../`, `./${relativeCwd}`),
          env: { NODE_ENV, CI: 1, GATSBY_LOGGER: `ink` },
        })

        let isKilled = false
        const onExitPromise = new Promise((resolve, reject) => {
          res.on(`exit`, () => {
            // give it some time to exit
            waitChildProcessExit(res.pid, resolve, reject)
          })

          res.catch(err => {
            if (!isKilled) {
              reject(err)
            }
          })
        })

        let logs = ``
        res.stdout.on("data", data => {
          if (!res.killed) {
            logs += data.toString()
          }

          if (!isKilled && onExit && onExit(strip(logs))) {
            isKilled = true
            kill(res.pid, "SIGINT")
          }
        })

        return [onExitPromise, () => createLogsMatcher(strip(logs))]
      },
    }
  },
}
