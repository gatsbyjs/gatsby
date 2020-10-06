import * as React from "react"
import { Link } from "gatsby"

function ProductView({ product }) {
  return (
    <div className="wrapper">
      <header>
        <Link to="/">Go back to "Home"</Link>
      </header>
      <main>
        <h1>{product.name}</h1>
        <p>
          {product.description}. Appeared in {product.appearance}.
        </p>
        <p>SKU: {product.meta.sku}</p>
      </main>
      <footer>Product provided by Incite.</footer>
    </div>
  )
}

export default ProductView
