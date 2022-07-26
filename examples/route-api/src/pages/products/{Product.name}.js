import * as React from "react"
import { graphql } from "gatsby"
import ProductView from "../../views/product-view"

function Product(props) {
  const { product } = props.data
  return <ProductView product={product} />
}

export default Product

export const query = graphql`
  query($id: String!) {
    product(id: { eq: $id }) {
      name
      description
      appearance
      meta {
        createdAt
        id
        sku
      }
    }
  }
`
