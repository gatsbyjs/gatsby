import React from "react"
import type { GatsbySSR } from "gatsby"
import { Partytown } from "@builder.io/partytown/react"
import { PartytownContext } from "gatsby-script"
import type { PartytownProps } from "@builder.io/partytown/react"
import { store } from "../../redux"

const collectedScripts: Map<string, Array<PartytownProps>> = new Map()

export const wrapRootElement: GatsbySSR[`wrapRootElement`] = ({
  element,
  pathname,
}) => (
  <PartytownContext.Provider
    value={{
      collectScript: (newScript: PartytownProps): void => {
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
    (script: PartytownProps) => script?.forward || []
  )

  const { config } = store.getState()
  const lib = config?.partytown?.lib || `/~partytown/`

  setHeadComponents([
    <Partytown key="partytown" forward={collectedForwards} lib={lib} />,
  ])

  collectedScripts.delete(pathname)
}
