/* eslint-disable no-unused-expressions */
import { IBuildContext } from "./types"
import * as fs from "fs-extra"
import { Stats } from "webpack"
import reporter from "gatsby-cli/lib/reporter"
import { emitter } from "../redux"
import { buildRenderer } from "../commands/build-html"
import { Stage } from "../commands/types"
import { clearRequireCacheRecursively } from "../utils/clear-require-cache"

export async function recompile(context: IBuildContext): Promise<Stats> {
  const [stats] = await Promise.all([
    recompileDevBundle(context),
    recompileSSRBundle(context),
  ])
  return stats
}

async function recompileDevBundle({
  webpackWatching,
}: IBuildContext): Promise<Stats> {
  if (!webpackWatching) {
    reporter.panic(`Missing compiler`)
  }
  return new Promise<Stats>(resolve => {
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

async function recompileSSRBundle({
  program,
  websocketManager,
  recompiledFiles = new Set(),
}: IBuildContext): Promise<void> {
  if (!(await includesSSRComponent(recompiledFiles))) {
    return
  }
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

async function includesSSRComponent(
  recompiledFiles: Set<string>
): Promise<boolean> {
  const result = await Promise.all(
    Array.from(recompiledFiles).map(path => isSSRPageComponent(path))
  )
  return result.some(isSSR => isSSR === true)
}

async function isSSRPageComponent(filename: string): Promise<boolean> {
  if (
    !(await fs.pathExists(filename)) ||
    !(await fs.lstat(filename)).isFile()
  ) {
    return false
  }
  const text = await fs.readFile(filename, `utf8`)
  return text.includes(`getServerData`)
}
