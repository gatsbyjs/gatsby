import execa, { sync } from "execa"
import { closeSync, mkdtempSync, openSync, readFileSync, rmSync } from "fs"
import { tmpdir } from "os"
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

        // `spawnSync` hands back stdout and stderr as two separate buffers, so
        // concatenating them afterwards would lose the order the CLI actually
        // wrote them in (and execa's `all` is async-only). Instead point both
        // fd 1 and fd 2 at the same open file - the child dups a single file
        // description for both, so they share an offset and the writes land
        // interleaved exactly as they happened.
        const outputDir = mkdtempSync(join(tmpdir(), `gatsby-cli-invoke-`))
        const outputFile = join(outputDir, `output.log`)
        const outputFd = openSync(outputFile, `w`)

        let exitCode
        try {
          const results = sync(
            process.execPath,
            [gatsbyBinLocation].concat(args),
            {
              cwd: join(__dirname, `../`, `./${relativeCwd}`),
              env: {
                NODE_ENV,
                CI: 1,
                GATSBY_LOGGER: `ink`,
              },
              stdio: [`pipe`, outputFd, outputFd],
            }
          )
          exitCode = results.exitCode
        } catch (err) {
          exitCode = err.exitCode
        } finally {
          closeSync(outputFd)
        }

        const output = readFileSync(outputFile, `utf8`)
        rmSync(outputDir, { recursive: true, force: true })

        return [exitCode, createLogsMatcher(strip(output))]
      },

      invokeAsync: (args, onExit) => {
        const NODE_ENV =
          (Array.isArray(args) ? args[0] : args) === `develop`
            ? `development`
            : `production`
        const res = execa(process.execPath, [gatsbyBinLocation].concat(args), {
          cwd: join(__dirname, `../`, `./${relativeCwd}`),
          env: { NODE_ENV, CI: 1, GATSBY_LOGGER: `ink` },
          // gives us `res.all`, a single stream with stdout and stderr
          // interleaved, instead of having to pick one or stitch them together
          all: true,
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
        res.all.on("data", data => {
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
