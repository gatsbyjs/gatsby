/* eslint-disable react/prop-types */
import React from "react"
import Link from "gatsby-link"

const Dog = ({ transition }) => (
  <div style={transition && transition.style}>
    <h1>ruff</h1>
    <div>
      <Link to="/">Go to home</Link>
    </div>
    <div>
      <Link to="/cat/">Go to cat</Link>
    </div>
  </div>
)

export default Dog
