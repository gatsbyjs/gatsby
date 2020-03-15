const fs = require(`fs-extra`)
const Promise = require(`bluebird`)
const { join } = require(`path`)
import { getPageHtmlFilePath } from "../../utils/page-html"

export function renderHTML({ htmlComponentRendererPath, paths, envVars }) {
  // This is being executed in child process, so we need to set some vars
  // for modules that aren't bundled by webpack.
  envVars.forEach(([key, value]) => (process.env[key] = value))

  return Promise.map(
    paths,
    path =>
      new Promise((resolve, reject) => {
        const htmlComponentRenderer = require(htmlComponentRendererPath)
        try {
          htmlComponentRenderer.default(path, (throwAway, htmlString) => {
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
