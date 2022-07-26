import * as React from "react"
import { StaticImage } from "gatsby-plugin-image"

import Seo from "../components/seo"
import Layout from "../components/layout"

const IndexPage = () => (
  <>
    <Layout>
      <Seo title="Home" />
      <h1>Hi Test</h1>
      <p>
        Welcome to your new Gatsby site with SSR code-splitting at the component
        level courtesy of loadable-components.
      </p>
      <p>Now go build something great.</p>
      <StaticImage
        src="../images/gatsby-astronaut.png"
        width={300}
        quality={95}
        formats={["AUTO", "WEBP", "AVIF"]}
        alt="A Gatsby astronaut"
        style={{ marginBottom: `1.45rem` }}
      />
    </Layout>
  </>
)

export default IndexPage
