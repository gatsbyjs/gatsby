import child_process from "child_process"
import { join } from "path"

export function invokeCli(...args) {
  return new Promise(resolve => {
    child_process.execFile(
      join(__dirname, "./gatsby-cli.js"),
      args,
      {
        cwd: join(__dirname, "../execution-folder"),
      },
      (error, stdout, stderr) => {
        const logs = [stdout, stderr].join("")
        if (error) {
          console.error(err)
          return resolve([1, logs])
        }
        resolve([0, logs])
      }
    )
  })
}
