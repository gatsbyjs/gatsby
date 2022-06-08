import * as React from "react"
import { StaticImage } from "gatsby-plugin-image"
import Layout from "../../components/layout"

const ConstrainedPage = () => (
  <Layout>
    <div data-testid="image-constrained">
      <StaticImage src="../../images/citrus-fruits.jpg" alt="Citrus fruits" />
    </div>
    <div data-testid="image-constrained-limit">
      <StaticImage
        src="../../images/citrus-fruits.jpg"
        width={500}
        alt="Citrus fruits"
      />
    </div>
    <div data-testid="image-constrained-override">
      <StaticImage
        src="../../images/citrus-fruits.jpg"
        width={500}
        sizes="100vw"
        alt="Citrus fruits"
      />
    </div>
  </Layout>
)

export default ConstrainedPage
