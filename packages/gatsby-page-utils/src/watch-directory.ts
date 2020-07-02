const Promise = require(`bluebird`)
import * as chokidar from "chokidar"
const { slash } = require(`gatsby-core-utils`)

export async function watchDirectory(
  path: string,
  glob: string | ReadonlyArray<string>,
  onNewFile: (path: string) => void,
  onRemovedFile: (path: string) => void
): Promise<void> {
  return new Promise(resolve => {
    chokidar
      .watch(glob, { cwd: path })
      .on(`add`, path => {
        path = slash(path)
        onNewFile(path)
      })
      .on(`unlink`, path => {
        path = slash(path)
        onRemovedFile(path)
      })
      .on(`ready`, () => resolve())
  })
}
