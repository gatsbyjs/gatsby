import * as React from "react"
import Layout from "../../components/layout"

const StaticPage = () => {
  return (
    <Layout>
      <h1>Static</h1>
      <p>Hello World!</p>
    </Layout>
  )
}

export default StaticPage

export const Head = () => <title>Static</title>