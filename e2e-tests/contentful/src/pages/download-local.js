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
    contentfulAsset(sys: { id: { eq: "3BSI9CgDdAn1JchXmY5IJi" } }) {
      fields {
        localFile {
          absolutePath
          childImageSharp {
            gatsbyImageData
          }
        }
      }
    }
  }
`
