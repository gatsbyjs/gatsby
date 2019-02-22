import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import Product from "../components/product"

function ProductTemplate({ data }) {
  return (
    <Layout>
      <Product showDetail={true} {...data.product} />
    </Layout>
  )
}

export const productQuery = graphql`
  query ProductBySlug($slug: String!) {
    product: shopifyProduct(fields: { slug: { eq: $slug } }) {
      ...ProductDetails
      images {
        localFile {
          full: childImageSharp {
            fluid(maxWidth: 500, cropFocus: NORTH) {
              ...GatsbyImageSharpFluid
            }
          }

          thumbnail: childImageSharp {
            fixed(width: 50) {
              ...GatsbyImageSharpFixed
            }
          }
        }
      }
    }
  }
`

export default ProductTemplate
