import { graphql } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image"
import * as React from "react"

import Layout from "../components/layout"
import Grid from "../components/grid"

const GatsbyPluginImagePage = ({ data }) => {
  return (
    <Layout>
      <h1>Test Gatsby Image CDN</h1>
      <h2>Gatsby Image CDN:</h2>
      <Grid data-cy="gatsby-image-cdn">
        <GatsbyImage image={data.default.gatsbyImage} alt="" />
      </Grid>
    </Layout>
  )
}

export default GatsbyPluginImagePage

export const pageQuery = graphql`
  query GatsbyImageCDNQuery {
    default: contentfulAsset(
      sys: { id: { eq: "3BSI9CgDdAn1JchXmY5IJi" }, locale: { eq: "en-US" } }
    ) {
      title
      description
      fileName
      url
      gatsbyImage(width: 420)
    }
  }
`
