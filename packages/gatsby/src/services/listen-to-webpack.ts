import { Compiler } from "webpack"
import { InvokeCallback } from "xstate"
import reporter from "gatsby-cli/lib/reporter"

export const createWebpackWatcher =
  (compiler: Compiler): InvokeCallback =>
  (callback): void => {
    compiler.hooks.invalid.tap(`file invalidation`, file => {
      reporter.verbose(`Webpack file changed: ${file}`)
      callback({ type: `SOURCE_FILE_CHANGED`, file })
    })
  }
