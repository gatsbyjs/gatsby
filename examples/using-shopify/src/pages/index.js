import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import Product from "../components/product"
import ProductList from "../components/product-list"
import SEO from "../components/seo"

function IndexPage({ data }) {
  const { products } = data
  return (
    <Layout>
      <SEO title="Home" keywords={[`gatsby`, `store`]} />
      <ProductList>
        {products.edges.map(({ node }) => (
          <Product key={node.id} {...node} />
        ))}
      </ProductList>
    </Layout>
  )
}

export const indexQuery = graphql`
  query {
    products: allShopifyProduct {
      edges {
        node {
          ...ProductDetails
        }
      }
    }
  }
`

export default IndexPage
