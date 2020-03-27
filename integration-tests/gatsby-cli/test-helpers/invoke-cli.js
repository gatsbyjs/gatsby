import spawn from "cross-spawn"
import { join } from "path"

export function invokeCli(...args) {
  const results = spawn.sync(join(__dirname, "./gatsby-cli.js"), args, {
    cwd: join(__dirname, "../execution-folder"),
  })

  return [results.status, results.output.join("")]
}
