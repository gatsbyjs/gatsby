import * as React from "react"
import type { GatsbySSR } from "gatsby"

export const onPreRenderHTML: GatsbySSR[`onPreRenderHTML`] = ({
  replacePreBodyComponents,
}) => {
  replacePreBodyComponents([
    <div id="elements-appended-by-inline-scripts"></div>,
  ])
}

// TODO - Test case where we add <Script> in callbacks here
