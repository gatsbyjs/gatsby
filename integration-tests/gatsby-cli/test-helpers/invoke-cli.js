import spawn from "cross-spawn"
import { join } from "path"
import { createLogsMatcher } from "./matcher"

// Use as `GatsbyCLI.cwd('execution-folder').invoke('new', 'foo')`
export const GatsbyCLI = {
  from(relativeCwd) {
    return {
      invoke(...args) {
        const results = spawn.sync(
          join(__dirname, `../../../packages/gatsby-cli/lib/index.js`),
          args,
          {
            cwd: join(__dirname, `../`, `./${relativeCwd}`),
          }
        )

        if (results.error) {
          return [1, createLogsMatcher(results.error.toString().split("\n"))]
        }

        return [
          results.status,
          createLogsMatcher(results.output.toString().split("\n")),
        ]
      },

      invokeAsync: (...args) => {
        const res = spawn(
          join(__dirname, `../../../packages/gatsby-cli/lib/index.js`),
          args,
          {
            cwd: join(__dirname, `../`, `./${relativeCwd}`),
          }
        )

        const logs = []

        res.stdout.on("data", data => {
          logs.push(data.toString())
        })

        return [res, () => createLogsMatcher(logs)]
      },
    }
  },
}
