import telemetry from "gatsby-telemetry"
import type { CollectedScriptProps } from "gatsby-script"

interface IGatsbyScriptStats {
  total: number
  "post-hydrate": number
  idle: number
  "off-main-thread": number
  onLoad: number
  onError: number
  inlineScripts: number
  scriptsWithSources: number
}

export function collectGatsbyScriptTelemetry(
  scripts: Array<CollectedScriptProps>
): void {
  const keys = new Set()

  const stats: IGatsbyScriptStats = {
    total: 0,
    "post-hydrate": 0,
    idle: 0,
    "off-main-thread": 0,
    onLoad: 0,
    onError: 0,
    inlineScripts: 0,
    scriptsWithSources: 0,
  }

  for (const script of scripts) {
    const { id, src, strategy, onLoad, onError, inline } = script

    const key = id || src

    if (keys.has(key)) {
      continue
    }

    stats.total++

    stats[strategy]++

    if (onLoad) {
      stats.onLoad++
    }

    if (onError) {
      stats.onError++
    }

    if (src) {
      stats.scriptsWithSources++
    }

    if (inline) {
      stats.inlineScripts++
    }

    keys.add(key)
  }

  telemetry.trackCli(`GATSBY_SCRIPTS_TOTAL`, {
    name: `total unique gatsby scripts`,
    valueInteger: stats.total,
  })

  telemetry.trackCli(`GATSBY_SCRIPTS_POST_HYDRATE`, {
    name: `unique post-hydrate gatsby scripts`,
    valueInteger: stats[`post-hydrate`],
  })

  telemetry.trackCli(`GATSBY_SCRIPTS_IDLE`, {
    name: `unique idle gatsby scripts`,
    valueInteger: stats.idle,
  })

  telemetry.trackCli(`GATSBY_SCRIPTS_OFF_MAIN_THREAD`, {
    name: `unique off-main-thread gatsby scripts`,
    valueInteger: stats[`off-main-thread`],
  })

  telemetry.trackCli(`GATSBY_SCRIPTS_ON_LOAD`, {
    name: `unique gatsby script onLoad callbacks`,
    valueInteger: stats.onLoad,
  })

  telemetry.trackCli(`GATSBY_SCRIPTS_ON_ERROR`, {
    name: `unique gatsby script onError callbacks`,
    valueInteger: stats.onError,
  })

  telemetry.trackCli(`GATSBY_SCRIPTS_WITH_SOURCES`, {
    name: `unique gatsby scripts with sources`,
    valueInteger: stats.scriptsWithSources,
  })

  telemetry.trackCli(`GATSBY_SCRIPTS_INLINE`, {
    name: `unique inline gatsby scripts`,
    valueInteger: stats.inlineScripts,
  })
}
