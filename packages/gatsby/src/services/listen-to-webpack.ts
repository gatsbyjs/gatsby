import { Compiler } from "webpack"
import { InvokeCallback } from "xstate"
import reporter from "gatsby-cli/lib/reporter"
import { getServerDataChanged } from "../utils/page-ssr-module/get-server-data-utils"

export const createWebpackWatcher =
  (compiler: Compiler): InvokeCallback =>
  (callback): void => {
    compiler.hooks.invalid.tap(`file invalidation`, async file => {
      reporter.verbose(`Webpack file changed: ${file}`)
      callback({ type: `SOURCE_FILE_CHANGED`, file })

      if (file && (await getServerDataChanged(file))) {
        reporter.verbose(`getServerData changed`)
        callback({ type: `GET_SERVER_DATA_CHANGED`, file })
      }
    })
  }
