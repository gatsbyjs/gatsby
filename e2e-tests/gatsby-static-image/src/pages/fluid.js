import * as React from "react"
import { StaticImage } from "gatsby-plugin-image"

import Layout from "../components/layout"

const FluidPage = () => (
  <Layout>
    <span data-testid="image-fluid">
    <StaticImage src="../images/citrus-fruits.jpg" fluid="true" alt="Citrus fruits" />
    </span>
    <span data-testid="image-fluid-png">
    <StaticImage src="../images/gatsby-icon.png" fluid="true" alt="Gatsby icon" />
    </span>
    <span data-testid="image-fluid-relative">
    <StaticImage src="../../content/relative.jpg" fluid="true" alt="Citrus fruits" />
    </span>
    <span data-testid="invalid-image">
    <StaticImage src="./does-not-exist.jpg" fluid="true" />
    </span>

  </Layout>
)

export default FluidPage
