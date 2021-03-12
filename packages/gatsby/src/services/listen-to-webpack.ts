import { Compiler } from "webpack"
import { InvokeCallback } from "xstate"
import reporter from "gatsby-cli/lib/reporter"

export const createWebpackWatcher = (compiler: Compiler): InvokeCallback => (
  callback
): void => {
  compiler.hooks.invalid.tap(`file invalidation`, file => {
    reporter.verbose(`Webpack file changed: ${file}`)

    // Webpack fires `invalid` event as soon as any file changes
    //   but it doesn't start recompiling at this point. Instead, it aggregates changes with debounce
    //   and recompile on a tail of debounce.
    //   For example, you may save a file multiple times quickly but webpack will only recompile once.
    //   Unfortunately webpack doesn't expose any event for aggregated changes.
    //   But we actually need it. If we start recompiling immediately on `invalid` we can miss some changes.
    // Hack below is a workaround for this missing webpack event
    // @ts-ignore
    const watcher = compiler.watchFileSystem.watcher // Watchpack instance
    watcher.once(`aggregated`, () => {
      callback({ type: `SOURCE_FILE_CHANGED`, file })
    })

    // TODO: fallback to timeout?
  })
}
