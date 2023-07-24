import * as React from "react"
import Layout from "../../../components/layout"

const DSG = () => {
  return (
    <Layout>
      <h1>DSG</h1>
    </Layout>
  )
}

export default DSG

export const Head = () => <title>DSG</title>

export async function config() {
  return () => {
    return {
      defer: true,
    }
  }
}