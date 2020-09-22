import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import FloatingImage from "../components/floating-image"
import PageTitle from "../components/page-title"
import ImageGallery from "../components/image-gallery"

import Layout from "../components/layout"

const TracedSVG = ({ data, location }) => (
  <Layout
    location={location}
    image={data.coverImage.localFile.childImageSharp.fluid}
    imageTitle={`“${data.coverImage.title}” by ${data.coverImage.credit} (via unsplash.com)`}
  >
    <PageTitle>Traced SVG Placeholders</PageTitle>
    <FloatingImage
      imageMobile={data.floatingImageMobile.localFile.childImageSharp.fixed}
      imageDesktop={data.floatingImage.localFile.childImageSharp.fixed}
      title={`“${data.floatingImage.title}” by ${data.floatingImage.credit} (via unsplash.com)`}
    />
    <p>
      Generates a{` `}
      <a href="https://github.com/gatsbyjs/gatsby/issues/2435">traced SVG</a> of
      the image and returns the SVG source as an ”optimized URL-encoded” data:
      URI. This provides an alternative to the default inline base64 placeholder
      image.
    </p>
    <p>
      To make use of this technique, you can apply processing to an image with a
      GraphQL query by applying a <code>traceSVG</code> argument and the
      appropriate{` `}
      <a href="https://www.gatsbyjs.com/plugins/gatsby-image/#gatsby-transformer-sharp">
        fragment applied
      </a>
      .
    </p>
    <h2>Unsplash SVG Image Gallery</h2>
    <ImageGallery images={data.galleryImagesCropped.edges} />
    <Img
      fluid={data.fullWidthImage.localFile.childImageSharp.fluid}
      title={`“${data.fullWidthImage.title}” by ${data.fullWidthImage.credit} (via unsplash.com)`}
    />
  </Layout>
)

export default TracedSVG

export const query = graphql`
  query {
    coverImage: unsplashImagesYaml(title: { eq: "Polaroid Pronto 600" }) {
      credit
      title
      localFile {
        childImageSharp {
          fluid(
            maxWidth: 720
            traceSVG: { background: "#fff", color: "#663399" }
          ) {
            ...GatsbyImageSharpFluid_tracedSVG
          }
        }
      }
    }
    floatingImageMobile: unsplashImagesYaml(
      title: { eq: "Pug without hoodie" }
    ) {
      localFile {
        childImageSharp {
          fixed(width: 120) {
            ...GatsbyImageSharpFixed_tracedSVG
          }
        }
      }
    }
    floatingImage: unsplashImagesYaml(title: { eq: "Pug without hoodie" }) {
      credit
      title
      localFile {
        childImageSharp {
          fixed(width: 200) {
            ...GatsbyImageSharpFixed_tracedSVG
          }
        }
      }
    }
    fullWidthImage: unsplashImagesYaml(title: { eq: "City from above" }) {
      credit
      title
      localFile {
        childImageSharp {
          fluid(maxWidth: 480) {
            ...GatsbyImageSharpFluid_tracedSVG
          }
        }
      }
    }
    galleryImages: allUnsplashImagesYaml(
      filter: { gallery: { eq: true } }
      limit: 10
    ) {
      edges {
        node {
          credit
          title
          localFile {
            childImageSharp {
              fluid(
                maxWidth: 380
                quality: 70
                traceSVG: { background: "#fbfafc", color: "#dbd4e2" }
              ) {
                ...GatsbyImageSharpFluid_tracedSVG
              }
            }
          }
        }
      }
    }
    galleryImagesCropped: allUnsplashImagesYaml(
      filter: { gallery: { eq: true } }
      skip: 10
    ) {
      edges {
        node {
          credit
          title
          localFile {
            childImageSharp {
              fluid(
                maxWidth: 380
                maxHeight: 380
                quality: 70
                traceSVG: { background: "#fbfafc", color: "#dbd4e2" }
              ) {
                ...GatsbyImageSharpFluid_tracedSVG
              }
            }
          }
        }
      }
    }
  }
`
