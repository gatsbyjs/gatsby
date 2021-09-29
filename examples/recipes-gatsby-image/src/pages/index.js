import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"

const IndexPage = ({
  data: {
    allSitePage: { nodes: pages },
  },
}) => (
  <Layout>
    {pages.map((page, index) => (
      <>
        <Link to={page.path}>{page.path}</Link>
        <br />
      </>
    ))}
  </Layout>
)

export default IndexPage

export const query = graphql`
  query HomePageQuery {
    allSitePage(filter: { path: { regex: "/examples/" } }) {
      nodes {
        path
      }
    }
  }
`
