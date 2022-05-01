import * as React from "react"
import { Client as Styletron } from "styletron-engine-atomic"
import { Provider, DebugEngine } from "styletron-react"

const debugEngine =
  process.env.NODE_ENV !== `production` ? new DebugEngine() : undefined

export function wrapRootElement({ element }, { prefix, debug }) {
  const enableDebug = debug === true || typeof debug === `undefined`
  const styleElements = document.querySelectorAll(`._styletron_hydrate_`)

  return (
    <Provider
      value={new Styletron({ hydrate: styleElements, prefix })}
      debugMode={enableDebug ? debugEngine : undefined}
      debugAfterHydration={enableDebug}
    >
      {element}
    </Provider>
  )
}
