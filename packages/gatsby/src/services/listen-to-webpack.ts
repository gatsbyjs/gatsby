import type { Compiler } from "webpack"
import type { InvokeCallback } from "xstate"
import reporter from "gatsby-cli/lib/reporter"

export function createWebpackWatcher(compiler: Compiler): InvokeCallback {
  return (callback): void => {
    compiler.hooks.invalid.tap(`file invalidation`, file => {
      reporter.verbose(`Webpack file changed: ${file}`)
      callback({ type: `SOURCE_FILE_CHANGED`, file })
    })
  }
}
