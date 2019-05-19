import React from "react"

import MDXThemeProvider from "./src/components/mdx-theme-provider"

export const wrapRootElement = ({ element }) => (
  <MDXThemeProvider>{element}</MDXThemeProvider>
)
