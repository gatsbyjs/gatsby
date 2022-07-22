import React from "react"
import { graphql } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"

import PageTitle from "../components/page-title"
import Layout from "../components/layout"

const PreferWebp = ({ data, location }) => (
  <Layout
    location={location}
    image={getImage(data.coverImage.localFile)}
    imageTitle={`“${data.coverImage.title}” by ${data.coverImage.credit} (via unsplash.com)`}
  >
    <PageTitle>Prefer WebP</PageTitle>
    <GatsbyImage
      image={getImage(data.floatingImage.localFile)}
      alt={`“${data.floatingImage.title}” by ${data.floatingImage.credit} (via unsplash.com)`}
    />
    <p>
      WebP is a modern image format that provides both lossless and lossy
      compression for images on the web. This format can reduce the filesize
      considerably compared to JPG and PNG files. WebP images are generated
      automatically when you use <strong>gatsby-plugin-image</strong> with
      {` `}
      <strong>gatsby-plugin-sharp</strong>.
    </p>
    <p>
      The use of <strong>WebP</strong> is controlled by the{" "}
      <strong>formats</strong> array and can be configured via your{" "}
      <strong>gatsby-config.js</strong> file if you want to apply it to all
      images in your site. Alternatively, it can be part of your GraphQL query
      or passed via props when using StaticImage. <strong>AVIF</strong> is also
      supported. By default, the original image format will be used as fallback
      for browsers that don't have <strong>WebP</strong> support.
    </p>
    <GatsbyImage
      image={getImage(data.fullWidthImage.localFile)}
      alt={`“${data.fullWidthImage.title}” by ${data.fullWidthImage.credit} (via unsplash.com)`}
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
          gatsbyImageData(layout: CONSTRAINED, width: 720, aspectRatio: 0.5)
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
          gatsbyImageData(width: 600, layout: CONSTRAINED)
        }
      }
    }
  }
`
