import React from "react"
import { Partytown } from "@builder.io/partytown/react"
import { GatsbyScriptContext, ScriptStrategy } from "gatsby-script"
import type { CollectedScriptProps } from "gatsby-script"
import type { GatsbySSR } from "gatsby"
import { collectTelemetry } from "./collect-telemetry"

const scriptsPerPage: Map<string, Array<CollectedScriptProps>> = new Map()
const trackedScripts: Set<string> = new Set()

export const wrapRootElement: GatsbySSR[`wrapRootElement`] = ({
  element,
  pathname,
}) => (
  <GatsbyScriptContext.Provider
    value={{
      collectScript: (script: CollectedScriptProps): void => {
        const scripts = scriptsPerPage.get(pathname) || []
        scripts.push(script)
        scriptsPerPage.set(pathname, scripts)
      },
    }}
  >
    {element}
  </GatsbyScriptContext.Provider>
)

export const onRenderBody: GatsbySSR[`onRenderBody`] = ({
  pathname,
  setHeadComponents,
}) => {
  const scriptsOnPage = scriptsPerPage.get(pathname)

  if (!scriptsOnPage?.length) {
    return
  }

  let needsPartytown = false
  const forwards: Array<string> = []

  for (const script of scriptsOnPage) {
    if (script?.strategy === ScriptStrategy.offMainThread) {
      needsPartytown = true
    }

    if (Array.isArray(script?.forward)) {
      forwards.push(...script?.forward)
    }

    const key = script?.id || script?.src

    if (key && !trackedScripts.has(key)) {
      trackedScripts.add(key)
      collectTelemetry(script)
    }
  }

  if (needsPartytown) {
    setHeadComponents([<Partytown key="partytown" forward={forwards} />])
  }

  scriptsPerPage.delete(pathname)
}
