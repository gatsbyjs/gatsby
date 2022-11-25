import React from "react"
import { MDXProvider } from "@mdx-js/react"
import Example from "./example"

const shortcodes = { Example }
export default function Layout({ children }) {
  return <MDXProvider components={shortcodes}>{children}</MDXProvider>
}
