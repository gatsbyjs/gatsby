import React from "react"
import type { GatsbySSR } from "gatsby"
import { Partytown } from "@builder.io/partytown/react"
import { PartytownContext } from "gatsby-script"
import type { PartytownProps } from "@builder.io/partytown/react"

const collectedScripts: Record<string, Array<PartytownProps>> = {}

export const wrapRootElement: GatsbySSR[`wrapRootElement`] = ({
  element,
  pathname,
}) => (
  <PartytownContext.Provider
    value={{
      collectScript: (newScript: PartytownProps): void => {
        collectedScripts[pathname] = [
          ...(collectedScripts?.[pathname] || []),
          newScript,
        ]
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
  const collectedForwards: Array<string> = collectedScripts?.[pathname]?.reduce(
    (forwards: Array<string>, script: PartytownProps) => {
      if (script?.forward) {
        forwards = [...forwards, ...script?.forward]
      }
      return forwards
    },
    []
  )
  setHeadComponents([<Partytown key="partytown" forward={collectedForwards} />])
}
