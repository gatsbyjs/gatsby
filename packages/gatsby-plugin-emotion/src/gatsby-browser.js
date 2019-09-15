import React from "react"
import { CacheProvider } from "@emotion/core"
import { cache, hydrate } from "emotion"

export const onClientEntry = (_, pluginOptions) => {
  if (pluginOptions.useExtractCriticalSSR) {
    const idsElem = document.getElementById(`emotion-extracted-ids`)

    if (idsElem) {
      const ids = JSON.parse(idsElem.innerHTML)
      hydrate(ids)
    }
  }
}

export const wrapRootElement = ({ element }, pluginOptions) =>
  pluginOptions.useExtractCriticalSSR ? (
    <CacheProvider value={cache}>{element}</CacheProvider>
  ) : (
    element
  )
