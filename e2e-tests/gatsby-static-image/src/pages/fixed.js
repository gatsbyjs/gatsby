import * as React from "react"
import {StaticImage} from "gatsby-plugin-image"

import Layout from "../components/layout"

const FluidPage = () => (
  <Layout>
    <span data-testid="image-fixed">
    <StaticImage src="../images/citrus-fruits.jpg" width={500} alt="Citrus fruits" />
    </span>
    <span data-testid="image-fixed-png">
    <StaticImage src="../images/gatsby-icon.png" width={500} alt="Gatsby Icon" />
    </span>
    <span data-testid="image-fixed-relative">
    <StaticImage src="../../content/relative.jpg" height={500} alt="Citrus fruits"/>
    </span>

  </Layout>
)

export default FluidPage