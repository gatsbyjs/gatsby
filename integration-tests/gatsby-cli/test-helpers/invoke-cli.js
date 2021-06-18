import execa, { sync } from "execa"
import { join } from "path"
import strip from "strip-ansi"
import { createLogsMatcher } from "./matcher"

const gatsbyBinLocation = join(
  __dirname,
  "..",
  `node_modules`,
  `gatsby-cli`,
  `cli.js`
)

// Use as `GatsbyCLI.cwd('execution-folder').invoke('new', 'foo')`
export const GatsbyCLI = {
  from(relativeCwd) {
    return {
      invoke(args) {
        const NODE_ENV = args[0] === `develop` ? `development` : `production`
        try {
          const results = sync("node", [gatsbyBinLocation].concat(args), {
            cwd: join(__dirname, `../`, `./${relativeCwd}`),
            env: { NODE_ENV, CI: 1, GATSBY_LOGGER: `ink` },
          })

          console.log({ results })

          return [
            results.exitCode,
            createLogsMatcher(strip(results.stdout.toString())),
          ]
        } catch (err) {
          console.log({ err })
          return [
            err.exitCode,
            createLogsMatcher(strip(err.stdout?.toString() || ``)),
          ]
        }
      },

      invokeAsync: (args, onExit) => {
        const NODE_ENV = args[0] === `develop` ? `development` : `production`
        const res = execa("node", [gatsbyBinLocation].concat(args), {
          cwd: join(__dirname, `../`, `./${relativeCwd}`),
          env: { NODE_ENV, CI: 1, GATSBY_LOGGER: `ink` },
        })

        let logs = ``
        res.stdout.on("data", data => {
          if (!res.killed) {
            logs += data.toString()
          }

          if (onExit && onExit(strip(logs))) {
            res.cancel()
          }
        })

        return [
          res.catch(err => {
            if (err.isCanceled) {
              return
            }

            throw err
          }),
          () => createLogsMatcher(strip(logs)),
        ]
      },
    }
  },
}
