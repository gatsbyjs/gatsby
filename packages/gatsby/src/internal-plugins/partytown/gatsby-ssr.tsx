import React from "react"
import { Partytown } from "@builder.io/partytown/react"
import { collectedScriptsByPage } from "gatsby-script"
import type { GatsbySSR } from "gatsby"
import type { ScriptProps } from "gatsby-script"

export const onRenderBody: GatsbySSR[`onRenderBody`] = ({
  pathname,
  setHeadComponents,
}) => {
  const collectedScripts = collectedScriptsByPage.get(pathname)

  if (!collectedScripts?.length) {
    return
  }

  const collectedForwards: Array<string> = collectedScripts?.flatMap(
    (script: ScriptProps) => script?.forward || []
  )

  setHeadComponents([<Partytown key="partytown" forward={collectedForwards} />])

  collectedScriptsByPage.delete(pathname)
}
