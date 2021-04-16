import * as React from "react"
import { Link } from "gatsby"

function BrandOfferCoupon({ params }) {
  return (
    <div className="wrapper">
      <header>
        <Link to="/">Go back to "Home"</Link>
      </header>
      <main>
        <h1>Brand: {params.brand}</h1>
        <p>
          Lucky you! Here's your custom coupon code: <em>{params.coupon}</em>
        </p>
      </main>
    </div>
  )
}

export default BrandOfferCoupon
