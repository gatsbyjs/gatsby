import React from "react"
import { graphql } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image"

import FloatingImage from "../components/floating-image"
import PageTitle from "../components/page-title"
import ImageGallery from "../components/image-gallery"

import Layout from "../components/layout"

const TracedSVG = ({ data, location }) => (
  <Layout
    location={location}
    image={data.coverImage.localFile.childImageSharp.gatsbyImageData}
    imageTitle={`“${data.coverImage.title}” by ${data.coverImage.credit} (via unsplash.com)`}
  >
    <PageTitle>Traced SVG Placeholders</PageTitle>
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
    <GatsbyImage
      image={data.fullWidthImage.localFile.childImageSharp.gatsbyImageData}
      title={`“${data.fullWidthImage.title}” by ${data.fullWidthImage.credit} (via unsplash.com)`}
    />
  </Layout>
)

export default TracedSVG

export const query = graphql`
  {
    coverImage: unsplashImagesYaml(title: { eq: "Polaroid Pronto 600" }) {
      credit
      title
      localFile {
        childImageSharp {
          gatsbyImageData(
            maxWidth: 720
            tracedSVGOptions: { background: "#fff", color: "#663399" }
            placeholder: TRACED_SVG
            layout: FLUID
          )
        }
      }
    }
    floatingImageMobile: unsplashImagesYaml(
      title: { eq: "Pug without hoodie" }
    ) {
      localFile {
        childImageSharp {
          gatsbyImageData(width: 120, placeholder: TRACED_SVG, layout: FIXED)
        }
      }
    }
    floatingImage: unsplashImagesYaml(title: { eq: "Pug without hoodie" }) {
      credit
      title
      localFile {
        childImageSharp {
          gatsbyImageData(width: 200, placeholder: TRACED_SVG, layout: FIXED)
        }
      }
    }
    fullWidthImage: unsplashImagesYaml(title: { eq: "City from above" }) {
      credit
      title
      localFile {
        childImageSharp {
          gatsbyImageData(maxWidth: 480, placeholder: TRACED_SVG, layout: FLUID)
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
              gatsbyImageData(
                maxWidth: 380
                quality: 70
                tracedSVGOptions: { background: "#fbfafc", color: "#dbd4e2" }
                placeholder: TRACED_SVG
                layout: FLUID
              )
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
              gatsbyImageData(
                maxWidth: 380
                maxHeight: 380
                quality: 70
                tracedSVGOptions: { background: "#fbfafc", color: "#dbd4e2" }
                placeholder: TRACED_SVG
                layout: FLUID
              )
            }
          }
        }
      }
    }
  }
`
