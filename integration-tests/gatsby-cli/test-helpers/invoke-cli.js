import execa, { sync } from "execa"
import { join, resolve } from "path"
import { createLogsMatcher } from "./matcher"

// Use as `GatsbyCLI.cwd('execution-folder').invoke('new', 'foo')`
export const GatsbyCLI = {
  from(relativeCwd) {
    return {
      invoke(args) {
        try {
          const results = sync(
            resolve(`./node_modules/.bin/gatsby`),
            [].concat(args),
            {
              cwd: join(__dirname, `../`, `./${relativeCwd}`),
            }
          )

          return [
            results.exitCode,
            createLogsMatcher(results.stdout.toString().split("\n")),
          ]
        } catch (err) {
          return [
            err.exitCode,
            createLogsMatcher(err.stdout?.toString().split("\n") || ``),
          ]
        }
      },

      invokeAsync: (args, onExit) => {
        const res = execa(
          resolve(`./node_modules/.bin/gatsby`),
          [].concat(args),
          {
            cwd: join(__dirname, `../`, `./${relativeCwd}`),
          }
        )

        const logs = []
        res.stdout.on("data", data => {
          if (!res.killed) {
            logs.push(data.toString())
          }

          if (onExit && onExit(data.toString())) {
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
          () => createLogsMatcher(logs),
        ]
      },
    }
  },
}
