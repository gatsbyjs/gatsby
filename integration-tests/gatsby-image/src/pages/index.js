import React from 'react'
import { graphql } from 'gatsby'
import Image from 'gatsby-image'
import PropTypes from 'prop-types'

import Layout from '../components/layout'

const IndexPage = ({ data }) => (
  <Layout>
    <h1>Fluid</h1>
    <span data-testid="image-fluid"><Image fluid={data.fruitsFluid.childImageSharp.fluid} /></span>
    <h1>Fixed</h1>
    <span data-testid="image-fixed"><Image fixed={data.fruitsFixed.childImageSharp.fixed} /></span>
  </Layout>
)

IndexPage.propTypes = {
  data: PropTypes.object.isRequired,
}

export default IndexPage

export const pageQuery = graphql`
  query {
    fruitsFluid:file(relativePath: {eq: "citrus-fruits.jpg"}) {
      childImageSharp {
        fluid(maxWidth: 500) {
          ...GatsbyImageSharpFluid
        }
      }
    }
    fruitsFixed:file(relativePath: {eq: "citrus-fruits.jpg"}) {
      childImageSharp {
        fixed(width: 500) {
          ...GatsbyImageSharpFixed
        }
      }
    }
  }
`
