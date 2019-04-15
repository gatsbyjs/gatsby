import React from "react"
import { MDXProvider } from "@mdx-js/react"

import theme from "../tokens"
import mdxComponents from "./mdx"

export default ({ children }) => (
  <MDXProvider theme={mdxComponents}>{children}</MDXProvider>
)
