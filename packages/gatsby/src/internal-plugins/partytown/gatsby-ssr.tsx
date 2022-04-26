import React from "react"
import type { GatsbySSR } from "gatsby"
import { Partytown } from "@builder.io/partytown/react"
import { PartytownContext } from "gatsby-script"
import type { PartytownProps } from "@builder.io/partytown/react"

const collectedScripts: Array<PartytownProps> = []

export const wrapRootElement: GatsbySSR[`wrapRootElement`] = ({ element }) => (
  <PartytownContext.Provider
    value={{
      collectedScripts,
      collectScript: (newScript: PartytownProps): void => {
        collectedScripts.push(newScript)
      },
    }}
  >
    {element}
  </PartytownContext.Provider>
)

export const onRenderBody: GatsbySSR[`onRenderBody`] = ({
  setHeadComponents,
}) => {
  const collectedForwards: Array<string> = collectedScripts.reduce(
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
