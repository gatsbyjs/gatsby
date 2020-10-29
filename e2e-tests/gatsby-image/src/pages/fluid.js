import * as React from "react"
import { graphql } from "gatsby"
import Image from "gatsby-image"
import { GatsbyImage } from "gatsby-plugin-image"
import PropTypes from "prop-types"

import Layout from "../components/layout"

const FluidPage = ({ data }) => (
  <Layout>
    <div style={{display: `grid`, gridTemplateColumns: `auto auto`}}>
      <div data-testid="image-fluid">
        <Image fluid={data.fruitsFluid.childImageSharp.fluid} />
      </div>
      <div data-testid="plugin-image-fluid">
        <GatsbyImage image={data.fruitsFluid.childImageSharp.gatsbyImage.imageData} />
      </div>
    </div>
  </Layout>
)

FluidPage.propTypes = {
  data: PropTypes.object.isRequired,
}

export default FluidPage

export const pageQuery = graphql`
  query {
    fruitsFluid: file(relativePath: { eq: "citrus-fruits.jpg" }) {
      childImageSharp {
        fluid(maxWidth: 500) {
          ...GatsbyImageSharpFluid_withWebp
        }
        gatsbyImage(layout: FLUID, maxWidth: 500 ) {
          imageData
        }
      }
    }
  }
`
