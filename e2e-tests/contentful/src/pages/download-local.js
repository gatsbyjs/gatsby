import { graphql } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image"
import * as React from "react"

import Layout from "../components/layout"

const DownloadLocalPage = ({ data }) => {
  return (
    <Layout>
      <h1>Test downloadLocal feature</h1>
      <GatsbyImage
        id="gatsby-plugin-image-download-local"
        image={data.contentfulAsset.localFile.childImageSharp.gatsbyImageData}
      />
    </Layout>
  )
}

export default DownloadLocalPage

export const pageQuery = graphql`
  query DownloadLocalQuery {
    contentfulAsset(contentful_id: { eq: "3BSI9CgDdAn1JchXmY5IJi" }) {
      contentful_id
      title
      localFile {
        absolutePath
        childImageSharp {
          gatsbyImageData
        }
      }
    }
  }
`
