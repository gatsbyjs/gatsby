/* eslint-disable no-unused-expressions */
import { IBuildContext } from "./types"
import { Stats } from "webpack"
import reporter from "gatsby-cli/lib/reporter"
import { emitter } from "../redux"
import { buildRenderer } from "../commands/build-html"
import { Stage } from "../commands/types"
import { clearRequireCacheRecursively } from "../utils/clear-require-cache"

export async function recompile(context: IBuildContext): Promise<Stats> {
  const { webpackWatching, serverDataDirty } = context
  if (!webpackWatching) {
    reporter.panic(`Missing compiler`)
  }
  // Promisify the event-based API. We do this using emitter
  // because you can't "untap" a webpack watcher, and we just want
  // one compilation.
  const devBundlePromise = new Promise<Stats>(resolve => {
    function finish(stats: Stats): void {
      emitter.off(`COMPILATION_DONE`, finish)
      resolve(stats)
    }
    emitter.on(`COMPILATION_DONE`, finish)
    webpackWatching.resume()
    // Suspending is just a flag, so it's safe to re-suspend right away
    webpackWatching.suspend()
  })

  const ssrBundlePromise = serverDataDirty
    ? updateSSRBundle(context)
    : Promise.resolve()

  const [stats] = await Promise.all([devBundlePromise, ssrBundlePromise])
  return stats
}

async function updateSSRBundle({
  program,
  websocketManager,
}: IBuildContext): Promise<void> {
  reporter.verbose(`Recompiling SSR bundle`)

  const { close, rendererPath } = await buildRenderer(
    program,
    Stage.DevelopHTML
  )

  clearRequireCacheRecursively(rendererPath)

  if (websocketManager) {
    websocketManager.emitStaleServerData()
  }

  await close()
}
