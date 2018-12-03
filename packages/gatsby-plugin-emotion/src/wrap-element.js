import React from "react"
import { cache } from "emotion"
import { CacheProvider } from "@emotion/core"

export const wrapElement = element => (
  <CacheProvider value={cache}>{element}</CacheProvider>
)
