import fs from "fs-extra"
import Promise from "bluebird"
import { join } from "path"
import { getPageHtmlFilePath } from "../../utils/page-html"

export const renderHTML = ({
  htmlComponentRendererPath,
  paths,
  envVars,
}: {
  htmlComponentRendererPath: string
  paths: string
  envVars: [string, string][]
}): Promise<unknown[]> => {
  // This is being executed in child process, so we need to set some vars
  // for modules that aren't bundled by webpack.
  envVars.forEach(([key, value]) => (process.env[key] = value))

  return Promise.map(
    paths,
    path =>
      new Promise((resolve, reject) => {
        const htmlComponentRenderer = require(htmlComponentRendererPath)
        try {
          htmlComponentRenderer.default(path, (_throwAway, htmlString) => {
            resolve(
              fs.outputFile(
                getPageHtmlFilePath(join(process.cwd(), `public`), path),
                htmlString
              )
            )
          })
        } catch (e) {
          // add some context to error so we can display more helpful message
          e.context = {
            path,
          }
          reject(e)
        }
      })
  )
}
