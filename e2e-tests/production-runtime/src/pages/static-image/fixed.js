import * as React from "react"
import { StaticImage } from "gatsby-plugin-image"
import Layout from "../../components/layout"
import Seo from "../../components/seo"

const FluidPage = () => (
  <Layout>
    <div data-testid="image-fixed">
      <StaticImage
        src="../../images/citrus-fruits.jpg"
        width={500}
        layout="fixed"
        alt="Citrus fruits"
      />
    </div>
    <div data-testid="image-fixed-png">
      <StaticImage
        src="../../images/gatsby-icon.png"
        width={500}
        layout="fixed"
        alt="Gatsby Icon"
      />
    </div>
    <div data-testid="image-fixed-relative">
      <StaticImage
        src="../../../citrus-fruits-outside-src.jpg"
        height={500}
        layout="fixed"
        alt="Citrus fruits"
      />
    </div>
  </Layout>
)

export const Head = () => <Seo />

export default FluidPage
