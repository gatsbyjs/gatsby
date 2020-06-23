import React from "react"
import { Link, graphql } from "gatsby"
import Layout from "../../components/layout"

export default function Root(props) {
  return (
    <Layout>
      {props.data.allProduct.nodes.map(node => {
        return (
          <Link
            to={`/collection-routing/${node.name}`}
            data-testid="collection-routing-blog"
            data-testproductname={node.name}
          >
            {node.name}
          </Link>
        )
      })}
    </Layout>
  )
}

export const query = graphql`
  query AllProducts {
    allProduct {
      nodes {
        name
      }
    }
  }
`
