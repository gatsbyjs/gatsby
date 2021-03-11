import VirtualModulesPlugin from "webpack-virtual-modules"
import * as path from "path"
import * as fs from "fs-extra"
/*
 * This module allows creating virtual (in memory only) modules / files
 * that webpack compilation can access without the need to write module
 * body to actual filesystem.
 *
 * It's useful for intermediate artifacts that are not part of final builds,
 * but are used in some way to generate final ones (for example `async-requires.js`).
 *
 * Using virtual modules allow us to avoid unnecessary I/O to write/read those modules,
 * but more importantly using virtual modules give us immediate invalidation events
 * in webpack watching mode (as opposed to debounced/delayed events when filesystem is used).
 * Instant invalidation events make it much easier to work with various state transitions
 * in response to external events that are happening while `gatsby develop` is running.
 */

interface IGatsbyWebpackVirtualModulesContext {
  writeModule: VirtualModulesPlugin["writeModule"]
}

const fileContentLookup: Record<string, string> = {}
const instances: Array<IGatsbyWebpackVirtualModulesContext> = []

export const VIRTUAL_MODULES_BASE_PATH = `.cache/_this_is_virtual_fs_path_`

export class GatsbyWebpackVirtualModules {
  apply(compiler): void {
    const virtualModules = new VirtualModulesPlugin(fileContentLookup)
    virtualModules.apply(compiler)
    instances.push({
      writeModule: virtualModules.writeModule.bind(virtualModules),
    })
  }
}

export function getAbsolutePathForVirtualModule(filePath: string): string {
  return path.join(process.cwd(), VIRTUAL_MODULES_BASE_PATH, filePath)
}

export function writeModule(filePath: string, fileContents: string): void {
  const adjustedFilePath = getAbsolutePathForVirtualModule(filePath)

  if (fileContentLookup[adjustedFilePath] === fileContents) {
    // we already have this, no need to cause invalidation
    return
  }

  // workaround webpack marking virtual modules as deleted because those files don't really exist
  // so we create those files just so watchpack doesn't mark them as initially missing
  fs.outputFileSync(
    adjustedFilePath
    fileContents
  )

  fileContentLookup[adjustedFilePath] = fileContents

  instances.forEach(instance => {
    instance.writeModule(adjustedFilePath, fileContents)
  })
}
