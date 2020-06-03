import * as React from "react"
import { graphql } from "gatsby"
import Image from "gatsby-image"
import PropTypes from "prop-types"

import Layout from "../components/layout"

const FluidPage = ({ data }) => (
  <Layout>
    <span data-testid="image-fixed">
      <Image fixed={data.fruitsFixed.childImageSharp.fixed} />
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
      }
    }
  }
`
