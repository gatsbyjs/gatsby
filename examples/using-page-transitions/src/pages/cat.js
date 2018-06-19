/* eslint-disable react/prop-types */
import React from "react"
import { Link } from "gatsby"
import TemplateWrapper from "../components/layout"

const Cat = () => (
  <TemplateWrapper>
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
  </TemplateWrapper>
)

export default Cat
