/* eslint-disable react/prop-types */
import React from "react"
import { Link } from "gatsby"

const Cat = ({ transition }) => (
  <div style={transition && transition.style}>
    <h1>meow</h1>
    <div>
      <Link to="/">Go to home</Link>
    </div>
    <div>
      <Link to="/dog/">Go to dog</Link>
    </div>
    <div>
      <Link to="/long-page/">Go to long page</Link>
    </div>
  </div>
)

export default Cat
