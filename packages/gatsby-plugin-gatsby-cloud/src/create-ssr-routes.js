import { writeFile } from "fs-extra"
import { SSRROUTES_FILENAME } from "./constants"

export default async function writeSSRFile(pluginData, ssrRoutes) {
  const { publicFolder } = pluginData

  if (!ssrRoutes.length) {
    return null
  }

  // Is it ok to pass through the data or should we format it so that we don't have dependencies
  // between the redirects and rewrites formats? What are the chances those will change?
  const FILE_PATH = publicFolder(SSRROUTES_FILENAME)
  return writeFile(FILE_PATH, JSON.stringify({ routes: ssrRoutes }))
}
