import * as React from "react"
import { graphql } from "gatsby"
import Image from "gatsby-image"
import { GatsbyImage } from "gatsby-plugin-image"
import PropTypes from "prop-types"

import Layout from "../components/layout"

const FluidPage = ({ data }) => (
  <Layout>
    <span data-testid="image-fixed">
      <Image fixed={data.fruitsFixed.childImageSharp.fixed} />
    </span>
    <span data-testid="plugin-image-fixed">
      <GatsbyImage image={data.fruitsFixed.childImageSharp.gatsbyImage.imageData} />
    </span>
  </Layout>
)

FluidPage.propTypes = {
  data: PropTypes.object.isRequired,
}

export default FluidPage

export const pageQuery = graphql`
  query {
    fruitsFixed: file(relativePath: { eq: "citrus-fruits.jpg" }) {
      childImageSharp {
        fixed(width: 500) {
          ...GatsbyImageSharpFixed_withWebp
        }
        gatsbyImage(layout: FIXED, width: 500 ) {
          imageData
        }
      }
    }
  }
`
