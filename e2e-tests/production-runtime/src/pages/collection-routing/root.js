import React from "react"
import { Link, graphql } from "gatsby"
import Layout from "../../components/layout"
import Seo from "../../components/seo"

export default function Root(props) {
  return (
    <Layout>
      {props.data.allProduct.nodes.map(node => {
        return (
          <Link
            to={node.gatsbyPath}
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

export const Head = () => <Seo />

export const query = graphql`
  query AllProducts {
    allProduct {
      nodes {
        gatsbyPath(filePath: "/collection-routing/{Product.name}")
        name
      }
    }
  }
`
