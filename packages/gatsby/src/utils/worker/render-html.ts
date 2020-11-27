import fs from "fs-extra"
import Promise from "bluebird"
import { join } from "path"
import { getPageHtmlFilePath } from "../../utils/page-html"
import { Stage } from "../../commands/types"

export const renderHTML = ({
  htmlComponentRendererPath,
  paths,
  stage,
  envVars,
}: {
  htmlComponentRendererPath: string
  paths: Array<string>
  stage: Stage
  envVars: Array<Array<string>>
}): Promise<Array<unknown>> => {
  // This is being executed in child process, so we need to set some vars
  // for modules that aren't bundled by webpack.
  envVars.forEach(([key, value]) => (process.env[key] = value))

  const htmlComponentRenderer = require(htmlComponentRendererPath)

  return Promise.map(
    paths,
    path =>
      new Promise((resolve, reject) => {
        try {
          htmlComponentRenderer.default(path, (_throwAway, htmlString) => {
            if (stage === `develop-html`) {
              return resolve(htmlString)
            } else {
              return resolve(
                fs.outputFile(
                  getPageHtmlFilePath(join(process.cwd(), `public`), path),
                  htmlString
                )
              )
            }
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
