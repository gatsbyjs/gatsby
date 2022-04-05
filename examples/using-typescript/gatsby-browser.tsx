import * as React from "react"
import type { GatsbyBrowser } from "gatsby"
import Layout from "./src/components/layout"
import "./styles.css"

export const wrapPageElement: GatsbyBrowser["wrapPageElement"] = ({ element }) => {
  return (
    <Layout>
      {element}
    </Layout>
  )
}