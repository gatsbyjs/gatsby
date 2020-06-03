import * as React from "react"
import { graphql } from "gatsby"
import Image from "gatsby-image"
import PropTypes from "prop-types"

import Layout from "../components/layout"

const FluidPage = ({ data }) => (
  <Layout>
    <span data-testid="image-fluid">
      <Image fluid={data.fruitsFluid.childImageSharp.fluid} />
    </span>
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
      }
    }
  }
`
