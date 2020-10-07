import * as React from "react"
import { StaticImage } from "gatsby-plugin-image"

import Layout from "../components/layout"

const FluidPage = () => (
  <Layout>
    <span data-testid="image-traced">
    <StaticImage src="../images/citrus-fruits.jpg" tracedSVG alt="Citrus fruits" />
    </span>
    <span data-testid="image-traced-png">
    <StaticImage src="../images/gatsby-icon.png" tracedSVG alt="Gatsby icon" />
    </span>
    <span data-testid="image-traced-relative">
    <StaticImage src="../../content/relative.jpg" tracedSVG alt="Citrus fruits" />
    </span>

  </Layout>
)

export default FluidPage

// export const pageQuery = graphql`
//   query {
//     fruitsTraced: file(relativePath: { eq: "citrus-fruits.jpg" }) {
//       childImageSharp {
//         fluid(maxWidth: 500, traceSVG: { background: "red", color: "white" }) {
//           ...GatsbyImageSharpFluid_tracedSVG
//         }
//       }
//     }
//   }
// `
