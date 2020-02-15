import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import FloatingImage from "../components/floating-image"
import PageTitle from "../components/page-title"
import Layout from "../components/layout"

const PreferWebp = ({ data, location }) => (
  <Layout
    location={location}
    image={data.coverImage.localFile.childImageSharp.fluid}
    imageTitle={`“${data.coverImage.title}” by ${data.coverImage.credit} (via unsplash.com)`}
  >
    <PageTitle>Prefer WebP</PageTitle>
    <FloatingImage
      imageMobile={data.floatingImageMobile.localFile.childImageSharp.fixed}
      imageDesktop={data.floatingImage.localFile.childImageSharp.fixed}
      title={`“${data.floatingImage.title}” by ${data.floatingImage.credit} (via unsplash.com)`}
    />
    <p>
      WebP is a modern image format that provides both lossless and lossy
      compression for images on the web. This format can reduce the filesize
      considerably compared to JPG and PNG files, and using it is pretty easy
      with <strong>gatsby-image</strong> and{` `}
      <strong>gatsby-plugin-sharp</strong>.
    </p>
    <p>
      The <strong>WebP</strong> technique is similar to other gatsby-image
      techniques in that it can be applied in image queries with GraphQL. To
      specify that an image should be loaded in the WebP format in supporting
      browsers, use a fragment with <code>withWebp</code> at the end.
    </p>
    <Img
      fluid={data.fullWidthImage.localFile.childImageSharp.fluid}
      title={`“${data.fullWidthImage.title}” by ${data.fullWidthImage.credit} (via unsplash.com)`}
    />
    <p />
  </Layout>
)

export default PreferWebp

export const query = graphql`
  query {
    coverImage: unsplashImagesYaml(title: { eq: "Pug with yellow raincoat" }) {
      credit
      title
      localFile {
        childImageSharp {
          fluid(maxWidth: 720) {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
    floatingImageMobile: unsplashImagesYaml(title: { eq: "Cacti" }) {
      localFile {
        childImageSharp {
          fixed(width: 120) {
            ...GatsbyImageSharpFixed_withWebp
          }
        }
      }
    }
    floatingImage: unsplashImagesYaml(title: { eq: "Cacti" }) {
      credit
      title
      localFile {
        childImageSharp {
          fixed(width: 200) {
            ...GatsbyImageSharpFixed_withWebp
          }
        }
      }
    }
    fullWidthImage: unsplashImagesYaml(title: { eq: "Tennis court" }) {
      credit
      title
      localFile {
        childImageSharp {
          fluid(maxWidth: 600) {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
    }
  }
`
