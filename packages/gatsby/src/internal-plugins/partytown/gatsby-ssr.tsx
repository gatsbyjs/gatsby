import React from "react"
import { Partytown } from "@builder.io/partytown/react"
import { PartytownContext } from "gatsby"
import type { GatsbySSR, ScriptProps } from "gatsby"

const collectedScripts: Map<string, Array<ScriptProps>> = new Map()

export const wrapRootElement: GatsbySSR[`wrapRootElement`] = ({
  element,
  pathname,
}) => (
  <PartytownContext.Provider
    value={{
      collectScript: (newScript: ScriptProps): void => {
        const currentCollectedScripts = collectedScripts.get(pathname) || []
        currentCollectedScripts.push(newScript)
        collectedScripts.set(pathname, currentCollectedScripts)
      },
    }}
  >
    {element}
  </PartytownContext.Provider>
)

export const onRenderBody: GatsbySSR[`onRenderBody`] = ({
  pathname,
  setHeadComponents,
}) => {
  const collectedScriptsOnPage = collectedScripts.get(pathname)

  if (!collectedScriptsOnPage?.length) {
    return
  }

  const collectedForwards: Array<string> = collectedScriptsOnPage?.flatMap(
    (script: ScriptProps) => script?.forward || []
  )

  setHeadComponents([<Partytown key="partytown" forward={collectedForwards} />])

  collectedScripts.delete(pathname)
}
