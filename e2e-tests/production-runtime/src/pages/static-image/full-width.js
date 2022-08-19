import * as React from "react"
import { StaticImage } from "gatsby-plugin-image"
import Layout from "../../components/layout"
import Seo from "../../components/seo"

const FluidPage = () => (
  <Layout>
    <div data-testid="image-fluid">
      <StaticImage
        src="../../images/citrus-fruits.jpg"
        layout="fullWidth"
        width={700}
        alt="Citrus fruits"
      />
    </div>
    <div data-testid="image-fluid-png">
      <StaticImage
        src="../../images/gatsby-icon.png"
        layout="fullWidth"
        alt="Gatsby icon"
      />
    </div>
    <div data-testid="image-fluid-relative">
      <StaticImage
        src="../../../citrus-fruits-outside-src.jpg"
        layout="fullWidth"
        alt="Citrus fruits"
      />
    </div>
    <div data-testid="invalid-image">
      <StaticImage src="./does-not-exist.jpg" layout="fullWidth" />
    </div>
  </Layout>
)

export const Head = () => <Seo />

export default FluidPage
