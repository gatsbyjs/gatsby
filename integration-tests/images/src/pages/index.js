import React from "react"
import { StaticImage } from "gatsby-plugin-image"

const IndexPage = () => (
  <main>
    <section data-test-id="constrained">
      <StaticImage
        src="../images/sighisoara.jpg"
        formats={["auto", "webp", "avif"]}
        width="200"
      />
    </section>
  </main>
)

export default IndexPage
