/* eslint-disable no-unused-expressions */
import { IBuildContext } from "./types"
import { Stats } from "webpack"
import reporter from "gatsby-cli/lib/reporter"
import { emitter } from "../redux"

export async function recompile({
  webpackWatching,
}: IBuildContext): Promise<Stats> {
  if (!webpackWatching) {
    reporter.panic(`Missing compiler`)
  }
  // Promisify the event-based API. We do this using emitter
  // because you can't "untap" a webpack watcher, and we just want
  // one compilation.

  return new Promise(resolve => {
    function finish(stats: Stats): void {
      emitter.off(`COMPILATION_DONE`, finish)

      resolve(stats)
    }
    emitter.on(`COMPILATION_DONE`, finish)
    webpackWatching.resume()
    // Suspending is just a flag, so it's safe to re-suspend right away
    webpackWatching.suspend()
  })
}
