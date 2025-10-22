import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../layouts"

function IndexPage({data}) {
  return (
<Layout>
<ul>
{data.allAsciidoc.edges.map(({ node }) => (
<li key={node.id}>
<Link to={node.fields.slug}>{node.document.title}</Link>
</li>
))}
</ul>
</Layout>
);
}

export default IndexPage

export const pageQuery = graphql`
  query {
    allAsciidoc {
      edges {
        node {
          id
          html
          document {
            title
          }
          fields {
            slug
          }
        }
      }
    }
  }
`
