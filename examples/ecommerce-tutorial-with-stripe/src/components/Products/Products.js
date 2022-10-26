import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import ProductCard from "./ProductCard"

const containerStyles = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  padding: "1rem 0 1rem 0",
}

const Products = () => {
  const { prices } = useStaticQuery(graphql`
    query ProductPrices {
      prices: allStripePrice(
        filter: { active: { eq: true } }
        sort: { unit_amount: ASC }
      ) {
        edges {
          node {
            id
            active
            currency
            unit_amount
            product {
              id
              name
            }
          }
        }
      }
    }
  `)

  // Group prices by product
  const products = {}
  for (const { node: price } of prices.edges) {
    const product = price.product
    if (!products[product.id]) {
      products[product.id] = product
      products[product.id].prices = []
    }
    products[product.id].prices.push(price)
  }

  return (
    <div style={containerStyles}>
      {Object.keys(products).map(key => (
        <ProductCard key={products[key].id} product={products[key]} />
      ))}
    </div>
  )
}

export default Products
