import fs from "fs"
import crypto from "crypto"
import glob from "glob"

export function createFileContentHash(
  root: string,
  globPattern: string
): string {
  // TODO: Use hash-wasm
  const hash = crypto.createHash(`md5`)
  const files = glob.sync(`${root}/${globPattern}`, { nodir: true })

  files.forEach(filepath => {
    hash.update(fs.readFileSync(filepath))
  })

  return hash.digest(`hex`)
}
