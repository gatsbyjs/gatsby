import spawn from "cross-spawn"
import { join } from "path"
import { createLogsMatcher } from "./matcher"

export function invokeCli(...args) {
  const results = spawn.sync(
    join(__dirname, "../../../packages/gatsby-cli/lib/index.js"),
    args,
    {
      cwd: join(__dirname, "../execution-folder"),
    }
  )

  if (results.error) {
    return [1, createLogsMatcher(results.error.toString().split("\n"))]
  }

  return [
    results.status,
    createLogsMatcher(results.output.toString().split("\n")),
  ]
}
