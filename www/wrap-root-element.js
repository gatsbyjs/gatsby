import React from "react"
import { MDXProvider } from "@mdx-js/react"
import GuideList from "./src/components/guide-list.js"

const components = {
  GuideList,
}

export default ({ element }) => (
  <MDXProvider components={components}>{element}</MDXProvider>
)
