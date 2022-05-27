import React from "react"
import { hasFeature } from "gatsby-plugin-utils"
import { getFlattenedPluginOptions } from "./utils/get-flattened-plugin-options"
import { createSnippet } from "./utils/create-snippet"
import { Keys } from "./utils/constants"
import type { GoogleGtagPluginOptions } from "./types"
import type { GatsbySSR } from "gatsby"

export { wrapPageElement } from "./gatsby-shared"

export const onRenderBody: GatsbySSR[`onRenderBody`] = (
  { setHeadComponents, setPostBodyComponents },
  pluginOptions: GoogleGtagPluginOptions
) => {
  const unSupportedEnv =
    process.env.NODE_ENV !== `production` && process.env.NODE_ENV !== `test`

  if (unSupportedEnv || hasFeature(`gatsby-script`)) {
    return null
  }

  const flattenedPluginOptions = getFlattenedPluginOptions(pluginOptions)
  const { head, gtagURL } = flattenedPluginOptions

  // Lighthouse recommends pre-connecting to google tag manager
  setHeadComponents([
    <link rel="preconnect" key="preconnect-google-gtag" href={origin} />,
    <link rel="dns-prefetch" key="dns-prefetch-google-gtag" href={origin} />,
  ])

  const setComponents = head ? setHeadComponents : setPostBodyComponents

  const __html = createSnippet(flattenedPluginOptions)

  return setComponents([
    <script key={Keys.gtag} async src={gtagURL} />,
    <script key={Keys.gtagConfig} dangerouslySetInnerHTML={{ __html }} />,
  ])
}
