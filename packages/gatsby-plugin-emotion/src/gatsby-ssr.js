import React from "react"
import { CacheProvider } from "@emotion/core"
import { cache } from "emotion"
import { extractCritical } from "emotion-server"

export const onRenderBody = (
  { bodyHtml, setHeadComponents },
  pluginOptions
) => {
  if (pluginOptions.useExtractCriticalSSR) {
    const { ids, css } = extractCritical(bodyHtml)

    setHeadComponents([
      <style
        key="emotion-extracted-css"
        dangerouslySetInnerHTML={{ __html: css }}
      />,
      <script
        key="emotion-extracted-ids"
        id="emotion-extracted-ids"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ids) }}
      />,
    ])
  }
}

export const wrapRootElement = ({ element }, pluginOptions) =>
  pluginOptions.useExtractCriticalSSR ? (
    <CacheProvider value={cache}>{element}</CacheProvider>
  ) : (
    element
  )
