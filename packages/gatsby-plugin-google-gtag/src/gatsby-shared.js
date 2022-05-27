import React from "react"
import { keys } from "./utils/constants"
import { createSnippet } from "./utils/create-snippet"
import { getRelevantPluginOptions } from "./utils/get-relevant-plugin-options"

// Used if Gatsby version supports Gatsby Script (>=4.15.x)
export const wrapPageElement = ({ element }, pluginOptions) => {
  const { Script } = require(`gatsby`)

  const { gtagURL } = getRelevantPluginOptions(pluginOptions)
  const __html = createSnippet(pluginOptions)

  return (
    <>
      {element}
      <Script
        key={keys.gtag}
        src={gtagURL}
        strategy="off-main-thread"
        forward={[`gtag`]}
      />
      <Script
        key={keys.gtagConfig}
        id={keys.gtagConfig}
        strategy="off-main-thread"
        dangerouslySetInnerHTML={{ __html }}
      />
    </>
  )
}

// Used if Gatsby version does NOT support Gatsby Script (<=4.15.x)
export const onRenderBody = (
  { setHeadComponents, setPostBodyComponents },
  pluginOptions = {}
) => {
  const unsupportedEnv =
    process.env.NODE_ENV !== `production` || process.env.NODE_ENV !== `test`
  if (unsupportedEnv) {
    return null
  }

  const { head, gtagURL } = getRelevantPluginOptions(pluginOptions)

  // Lighthouse recommends pre-connecting to google tag manager
  setHeadComponents([
    <link rel="preconnect" key="preconnect-google-gtag" href={origin} />,
    <link rel="dns-prefetch" key="dns-prefetch-google-gtag" href={origin} />,
  ])

  const setComponents = head ? setHeadComponents : setPostBodyComponents

  const __html = createSnippet(pluginOptions)

  return setComponents([
    <script key={keys.gtag} async src={gtagURL} />,
    <script key={keys.gtagConfig} dangerouslySetInnerHTML={{ __html }} />,
  ])
}
