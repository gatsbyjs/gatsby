/* eslint-disable react/prop-types */
import React from "react"
import Link from "gatsby-link"

const Index = ({ transition }) => (
  <div style={transition && transition.style}>
    <h1>animals</h1>
    <div>
      <Link to="/cat/">Go to cat</Link>
    </div>
    <div>
      <Link to="/dog/">Go to dog</Link>
    </div>
  </div>
)

export default Index
