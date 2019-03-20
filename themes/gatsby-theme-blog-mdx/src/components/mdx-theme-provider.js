import React from "react"
import { MDXProvider } from "@mdx-js/tag"
import { TypographyProvider } from "typography-system"

import theme from "../tokens"
import mdxComponents from "./mdx"

export default ({ children }) => (
  <TypographyProvider theme={theme}>
    <MDXProvider theme={mdxComponents}>{children}</MDXProvider>
  </TypographyProvider>
)
