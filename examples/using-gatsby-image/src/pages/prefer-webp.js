import React from "react"
import { graphql } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image"

import FloatingImage from "../components/floating-image"
import PageTitle from "../components/page-title"
import Layout from "../components/layout"

const PreferWebp = ({ data, location }) => (
  <Layout
    location={location}
    image={data.coverImage.localFile.childImageSharp.gatsbyImageData}
    imageTitle={`“${data.coverImage.title}” by ${data.coverImage.credit} (via unsplash.com)`}
  >
    <PageTitle>Prefer WebP</PageTitle>
    <FloatingImage
      imageMobile={
        data.floatingImageMobile.localFile.childImageSharp.gatsbyImageData
      }
      imageDesktop={
        data.floatingImage.localFile.childImageSharp.gatsbyImageData
      }
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
    <GatsbyImage
      image={data.fullWidthImage.localFile.childImageSharp.gatsbyImageData}
      title={`“${data.fullWidthImage.title}” by ${data.fullWidthImage.credit} (via unsplash.com)`}
    />
    <p />
  </Layout>
)

export default PreferWebp

export const query = graphql`
  {
    coverImage: unsplashImagesYaml(title: { eq: "Pug with yellow raincoat" }) {
      credit
      title
      localFile {
        childImageSharp {
          gatsbyImageData(maxWidth: 720, layout: FLUID)
        }
      }
    }
    floatingImageMobile: unsplashImagesYaml(title: { eq: "Cacti" }) {
      localFile {
        childImageSharp {
          gatsbyImageData(width: 120, layout: FIXED)
        }
      }
    }
    floatingImage: unsplashImagesYaml(title: { eq: "Cacti" }) {
      credit
      title
      localFile {
        childImageSharp {
          gatsbyImageData(width: 200, layout: FIXED)
        }
      }
    }
    fullWidthImage: unsplashImagesYaml(title: { eq: "Tennis court" }) {
      credit
      title
      localFile {
        childImageSharp {
          gatsbyImageData(maxWidth: 600, layout: FLUID)
        }
      }
    }
  }
`
