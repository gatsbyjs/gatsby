import React from "react"
import type { GatsbySSR } from "gatsby"
import { Partytown } from "@builder.io/partytown/react"

export const onRenderBody: GatsbySSR[`onRenderBody`] = ({
  setHeadComponents,
}) => {
  setHeadComponents([<Partytown key="partytown" />])
}
