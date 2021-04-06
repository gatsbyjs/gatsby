import { writeFile } from "fs-extra"
import { REDIRECTS_FILENAME } from "./constants"

export default async function writeRedirectsFile(
  pluginData,
  redirects,
  rewrites
) {
  const { publicFolder } = pluginData

  if (!redirects.length && !rewrites.length) return null

  // Is it ok to pass through the data or should we format it so that we don't have dependencies
  // between the redirects and rewrites formats? What are the chances those will change?
  const FILE_PATH = publicFolder(REDIRECTS_FILENAME)
  return writeFile(FILE_PATH, JSON.stringify({ redirects, rewrites }))
}
