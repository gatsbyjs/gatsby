import { writeFile } from "fs-extra"
import { REDIRECTS_FILENAME } from "./constants"
import { emitRedirects, emitRewrites } from "./ipc"

export default async function writeRedirectsFile(
  pluginData,
  redirects,
  rewrites
) {
  const { publicFolder } = pluginData

  // gatsby adds path-prefix to redirects so we need to remove them again
  if (redirects && pluginData.pathPrefix) {
    redirects = redirects.map(redirect => {
      if (redirect.fromPath.startsWith(pluginData.pathPrefix)) {
        redirect.fromPath = redirect.fromPath.slice(
          pluginData.pathPrefix.length
        )
      }

      if (redirect.toPath.startsWith(pluginData.pathPrefix)) {
        redirect.toPath = redirect.toPath.slice(pluginData.pathPrefix.length)
      }

      return redirect
    })
  }

  /**
   * IPC Emit for redirects
   */
  let lastMessageSent
  redirects.forEach(redirect => {
    lastMessageSent = emitRedirects(redirect)
  })

  /**
   * IPC Emit for rewrites
   */
  rewrites.forEach(rewrite => {
    lastMessageSent = emitRewrites(rewrite)
  })

  // This prevents process from exiting before handling the last IPC message
  await lastMessageSent

  // Is it ok to pass through the data or should we format it so that we don't have dependencies
  // between the redirects and rewrites formats? What are the chances those will change?
  const FILE_PATH = publicFolder(REDIRECTS_FILENAME)
  return writeFile(FILE_PATH, JSON.stringify({ redirects, rewrites }))
}
