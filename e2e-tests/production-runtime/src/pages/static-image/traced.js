import * as React from "react"
import { StaticImage } from "gatsby-plugin-image"
import Layout from "../../components/layout"
import Seo from "../../components/seo"

const FluidPage = () => (
  <Layout>
    <div data-testid="image-traced">
      <StaticImage
        src="../../images/citrus-fruits.jpg"
        placeholder="tracedSVG"
        alt="Citrus fruits"
      />
    </div>
    <div data-testid="image-traced-png">
      <StaticImage
        src="../../images/gatsby-icon.png"
        placeholder="tracedSVG"
        alt="Gatsby icon"
      />
    </div>
    <div data-testid="image-traced-relative">
      <StaticImage
        src="../../../citrus-fruits-outside-src.jpg"
        placeholder="tracedSVG"
        alt="Citrus fruits"
      />
    </div>
  </Layout>
)

export const Head = () => <Seo />

export default FluidPage
