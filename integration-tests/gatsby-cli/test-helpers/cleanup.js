import { join } from "path"
import { exec } from "child_process"

const root = join(__dirname, "..")

// Executes a shell command and return it as a Promise.
function pExec(command) {
  return new Promise(resolve => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.warn(error)
      }
      resolve(stdout ? stdout : stderr)
    })
  })
}

export function removeFolder(folder) {
  return pExec(`rm -rf ${root}/${folder}`)
}
