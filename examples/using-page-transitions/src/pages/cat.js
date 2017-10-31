/* eslint-disable react/prop-types */
import React from "react"
import Link from "gatsby-link"

const Cat = ({ transition }) => (
  <div style={transition && transition.style}>
    <h1>meow</h1>
    <div>
      <Link to="/">Go to home</Link>
    </div>
    <div>
      <Link to="/dog/">Go to dog</Link>
    </div>
  </div>
)

export default Cat
