import React from "react"
import { createSnippet } from "./utils/create-snippet"
import { getFlattenedPluginOptions } from "./utils/get-flattened-plugin-options"
import { hasFeature } from "gatsby-plugin-utils"
import { Keys } from "./utils/constants"
import type { GoogleGtagPluginOptions } from "./types"
import type { GatsbySSR, GatsbyBrowser } from "gatsby"

export const wrapPageElement:
  | GatsbySSR[`wrapPageElement`]
  | GatsbyBrowser[`wrapPageElement`] = (
  { element },
  pluginOptions: GoogleGtagPluginOptions
) => {
  if (!hasFeature(`gatsby-script`)) {
    return element
  }

  const { Script } = require(`gatsby`)

  const flattenedPluginOptions = getFlattenedPluginOptions(pluginOptions)
  const __html = createSnippet(flattenedPluginOptions)
  const { gtagURL } = flattenedPluginOptions

  return (
    <>
      {element}
      <Script
        key={Keys.gtag}
        src={gtagURL}
        strategy="off-main-thread"
        forward={[`gtag`]}
      />
      <Script
        key={Keys.gtagConfig}
        id={Keys.gtagConfig}
        strategy="off-main-thread"
        dangerouslySetInnerHTML={{ __html }}
      />
    </>
  )
}
