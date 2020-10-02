import * as React from "react"
import {graphql, Link} from "gatsby"

function Index({ data }) {
  return (
    <main>
      <h1>Unified Routes</h1>
      <p>Below you'll see some example pages created.</p>
      <p>List of products (both linked by name & SKU):</p>
      <ul>
        {data.products.nodes.map(product => (
          <li key={product.meta.sku}>
            <Link to={product.nameSlug}>{product.name}</Link> <Link to={product.skuSlug}>(SKU)</Link>
          </li>
        ))}
        <li><Link to={`/products/self-parking-attack-motorcycle`}>Self-parking attack motorcycle</Link> (Entry doesn't exist)</li>
      </ul>
    </main>
  )
}

export default Index

export const query = graphql`
  {
    products: allProduct {
      nodes {
        name
        nameSlug: gatsbyPath(filePath: "/products/{Product.name}")
        skuSlug: gatsbyPath(filePath: "/products/{Product.meta__sku}")
        meta {
          sku
        }
      }
    }
  }
`
