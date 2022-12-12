import * as React from "react"
import { Link, graphql } from "gatsby"
import Layout from "../../../components/layout"

const MaterializedPage = (props) => (
  <Layout>
    <p data-testid="gatsby-path-materialized">{props.data.gatsbyPathMaterializedParent.gatsbyPath}</p>
    <Link to="/">Back to home</Link>
  </Layout>
)

export default MaterializedPage

export const query = graphql`
  query {
    gatsbyPathMaterializedParent {
      name
      gatsbyPath(
        filePath: "/collection-routing/{GatsbyPathMaterializedParent.childType__name}/{GatsbyPathMaterializedParent.name}"
      )
    }
  }
`