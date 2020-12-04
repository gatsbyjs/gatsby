import React from "react"
import { graphql } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"

import FloatingImage from "../components/floating-image"
import PageTitle from "../components/page-title"
import ImageGallery from "../components/image-gallery"

import Layout from "../components/layout"

const DominantColor = ({ data, location }) => (
  <Layout
    location={location}
    image={getImage(data.coverImage.localFile)}
    imageTitle={`“${data.coverImage.title}” by ${data.coverImage.credit} (via unsplash.com)`}
  >
    <PageTitle>Dominant Color Placeholders</PageTitle>
    <FloatingImage
      imageMobile={getImage(data.floatingImageMobile.localFile)}
      imageDesktop={getImage(data.floatingImage.localFile)}
      title={`“${data.floatingImage.title}” by ${data.floatingImage.credit} (via unsplash.com)`}
    />
    <p>
      Uses the dominant color of the image as the background. This value is
      extracted ferom the image by sharp.
    </p>
    <p>
      To make use of this technique, pass{" "}
      <code>placeholder: DOMINANT_COLOR</code> to the resolver, or{" "}
      <code>placeholder="dominantColor"</code> with the StaticImage component.
    </p>
    <h2>Unsplash Dominant Color Gallery</h2>
    <ImageGallery images={data.galleryImagesCropped.edges} />
    <GatsbyImage
      image={getImage(data.fullWidthImage.localFile)}
      title={`“${data.fullWidthImage.title}” by ${data.fullWidthImage.credit} (via unsplash.com)`}
    />
  </Layout>
)

export default DominantColor

export const query = graphql`
  {
    coverImage: unsplashImagesYaml(title: { eq: "Polaroid Pronto 600" }) {
      credit
      title
      localFile {
        childImageSharp {
          gatsbyImageData(
            maxWidth: 720
            placeholder: DOMINANT_COLOR
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
          gatsbyImageData(
            width: 120
            placeholder: DOMINANT_COLOR
            layout: FIXED
          )
        }
      }
    }
    floatingImage: unsplashImagesYaml(title: { eq: "Pug without hoodie" }) {
      credit
      title
      localFile {
        childImageSharp {
          gatsbyImageData(
            width: 200
            placeholder: DOMINANT_COLOR
            layout: FIXED
          )
        }
      }
    }
    fullWidthImage: unsplashImagesYaml(title: { eq: "City from above" }) {
      credit
      title
      localFile {
        childImageSharp {
          gatsbyImageData(
            maxWidth: 480
            placeholder: DOMINANT_COLOR
            layout: FLUID
          )
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
                placeholder: DOMINANT_COLOR
                layout: FLUID
              )
            }
          }
        }
      }
    }
  }
`
