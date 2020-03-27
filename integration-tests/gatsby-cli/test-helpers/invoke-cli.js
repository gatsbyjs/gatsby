import child_process from "child_process"
import { join } from "path"

export function invokeCli(...args) {
  const child = child_process.execFile(
    join(__dirname, "./gatsby-cli.js"),
    args,
    {
      cwd: join(__dirname, "../execution-folder"),
    }
  )

  const logs = []

  child.stdout.setEncoding("utf8")
  child.stdout.on("data", data => {
    logs.push(data.toString())
  })

  child.stderr.setEncoding("utf8")
  child.stderr.on("data", data => {
    logs.push(data.toString())
  })

  return new Promise(resolve => {
    child.on("close", code => resolve([code, logs.join("")]))
    child.on("exit", code => resolve([code, logs.join("")]))
  })
}
