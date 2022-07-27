import React from "react"
import type { GatsbySSR } from "gatsby"
import { Partytown } from "@builder.io/partytown/react"
import { ScriptProps } from "gatsby-script"

export const onRenderBody: GatsbySSR[`onRenderBody`] = ({
  pathname,
  setHeadComponents,
}) => {
  const collectedScriptsOnPage =
    globalThis?.__collectedScripts?.get(pathname) || []

  if (!collectedScriptsOnPage?.length) {
    return
  }

  const collectedForwards: Array<string> = collectedScriptsOnPage?.flatMap(
    (script: ScriptProps) => script?.forward || []
  )

  setHeadComponents([<Partytown key="partytown" forward={collectedForwards} />])

  globalThis.__collectedScripts.delete(pathname)
}
