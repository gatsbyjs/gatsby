import * as React from "react"
import type { GatsbySSR } from "gatsby"
import Layout from "./src/components/layout"

export const wrapPageElement: GatsbySSR["wrapPageElement"] = ({ element }) => {
  return (
    <Layout>
      {element}
    </Layout>
  )
}