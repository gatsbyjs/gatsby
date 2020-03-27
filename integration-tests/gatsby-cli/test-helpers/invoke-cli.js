import spawn from "cross-spawn"
import { join } from "path"

export function invokeCli(...args) {
  const results = spawn.sync(
    "node",
    [join(__dirname, "./gatsby-cli2.js"), ...args],
    {
      cwd: join(__dirname, "../execution-folder"),
    }
  )

  if (results.error) {
    console.log(results.error)
    return [1, results.error.toString()]
  }

  return [results.status, results.output.join("")]
}
