import * as React from "react"
import { graphql } from "gatsby"
import Image from "gatsby-image"
import PropTypes from "prop-types"

import Layout from "../components/layout"

const FluidPage = ({ data }) => (
  <Layout>
    <span data-testid="image-traced">
      <Image fluid={data.fruitsTraced.childImageSharp.fluid} />
    </span>
  </Layout>
)

FluidPage.propTypes = {
  data: PropTypes.object.isRequired,
}

export default FluidPage

export const pageQuery = graphql`
  query {
    fruitsTraced: file(relativePath: { eq: "citrus-fruits.jpg" }) {
      childImageSharp {
        fluid(maxWidth: 500, traceSVG: { background: "red", color: "white" }) {
          ...GatsbyImageSharpFluid_tracedSVG
        }
      }
    }
  }
`
