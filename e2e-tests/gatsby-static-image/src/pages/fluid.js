import * as React from "react"
import { graphql } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

import Layout from "../components/layout"

const FluidPage = () => (
  <Layout>
    <span data-testid="image-fluid">
    <StaticImage src="../images/citrus-fruits.jpg" fluid alt="Citrus fruits" />
    </span>
    <span data-testid="image-fluid-png">
    <StaticImage src="../images/gatsby-icon.png" fluid alt="Gatsby icon" />
    </span>
    <span data-testid="image-fluid-relative">
    <StaticImage src="../../content/relative.jpg" fluid alt="Citrus fruits" />
    </span>
    <span data-testid="invalid-image">
    <StaticImage src="./does-not-exist.jpg" fluid />
    </span>

  </Layout>
)

export default FluidPage
