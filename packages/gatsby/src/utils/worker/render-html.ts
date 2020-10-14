import fs from "fs-extra"
import Promise from "bluebird"
import { join } from "path"
import { getPageHtmlFilePath } from "../../utils/page-html"

export const renderHTML = ({
  htmlComponentRendererPath,
  paths,
  stage,
  envVars,
}: {
  htmlComponentRendererPath: string
  paths: Array<string>
  envVars: Array<Array<string>>
}): Promise<Array<unknown>> => {
  // This is being executed in child process, so we need to set some vars
  // for modules that aren't bundled by webpack.
  envVars.forEach(([key, value]) => (process.env[key] = value))

  return Promise.map(
    paths,
    path =>
      new Promise((resolve, reject) => {
        // Make sure we get the latest version during development
        if (stage === `develop-html`) {
          delete require.cache[require.resolve(htmlComponentRendererPath)]
        }
        const htmlComponentRenderer = require(htmlComponentRendererPath)
        try {
          htmlComponentRenderer.default(
            path,
            async (_throwAway, htmlString) => {
              if (stage === `develop-html`) {
                resolve(htmlString)
              } else {
                resolve(
                  fs.outputFile(
                    getPageHtmlFilePath(join(process.cwd(), `public`), path),
                    htmlString
                  )
                )
              }
            }
          )
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
