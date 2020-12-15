import * as React from "react"
import { StaticImage } from "gatsby-plugin-image"

import Layout from "../components/layout"

const FluidPage = () => (
  <Layout>
    <div data-testid="image-fluid">
      <StaticImage
        src="../images/citrus-fruits.jpg"
        layout="fluid"
        maxWidth={700}
        alt="Citrus fruits"
      />
    </div>
    <div data-testid="image-fluid-png">
      <StaticImage
        src="../images/gatsby-icon.png"
        layout="fluid"
        alt="Gatsby icon"
      />
    </div>
    <div data-testid="image-fluid-relative">
      <StaticImage
        src="../../content/relative.jpg"
        layout="fluid"
        alt="Citrus fruits"
      />
    </div>
    <div data-testid="invalid-image">
      <StaticImage src="./does-not-exist.jpg" layout="fluid" />
    </div>
  </Layout>
)

export default FluidPage
