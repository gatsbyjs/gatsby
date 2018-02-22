import React from "react"
import Helmet from "react-helmet"
import Link from "gatsby-link"

import Container from "../components/container"

export default () => (
  <Container>
    <Helmet>
      <title>Getting Started</title>
    </Helmet>
    <h1 css={{ marginTop: 0 }}>Getting Started</h1>
    <p>
      Welcome. There are several options you may want to choose when building with Gatsby:
      * [tutorial](/docs/tutorial/index.md) if you want step-by-step instructions
      * [Quick start](/pages/docs/index.js) to install Gatsby and/or dive into the docs

      Want to learn more about Gatsby? Read the overview of Gatsby Features to see whether Gatsby is right for your project.

      [Gatsby Features](/docs/features.js)
    </p>
  </Container>
)
