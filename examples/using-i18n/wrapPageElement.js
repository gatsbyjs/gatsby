import React from "react"
import { Layout } from "./src/components/layout"

const wrapPageElement = ({ element, props }) => (
  <Layout {...props}>{element}</Layout>
)

export default wrapPageElement
