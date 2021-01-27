import React from "react"
import { graphql } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"

import FloatingImage from "../components/floating-image"
import PageTitle from "../components/page-title"
import Layout from "../components/layout"

const BlurUp = ({ data, location }) => (
  <Layout
    location={location}
    image={getImage(data.coverImage.localFile)}
    imageTitle={`“${data.coverImage.title}” by ${data.coverImage.credit} (via unsplash.com)`}
  >
    <PageTitle>Blur Up</PageTitle>
    <FloatingImage
      imageMobile={getImage(data.floatingImageMobile.localFile)}
      imageDesktop={getImage(data.floatingImage.localFile)}
      title={`“${data.floatingImage.title}” by ${data.floatingImage.credit} (via unsplash.com)`}
    />
    <p>
      The default Blur Up technique uses progressive loading to make a fast,
      visually pleasing experience without waiting for a full-resolution image
      with a blank screen.
    </p>
    <h2>Progressive Loading with Minimal Effort</h2>
    <p>
      The magic of Gatsby Image's Blur Up technique means that you can load an
      image at moderate resolution and not have to bother with creating a small
      thumbnail yourself. Gatsby Image will automatically create a tiny image
      from your source image and load it first for quick display while the
      larger image file is downloaded and displayed. Users first see a blurry
      lower-resolution image to help with perceived performance, while the
      larger image downloads and everything works automatically.
    </p>
    <p>
      This technique is the default behavior when querying for an image with
      GraphQL or using StaticImage.
    </p>
    <GatsbyImage
      image={getImage(data.fullWidthImage.localFile)}
      title={`“${data.fullWidthImage.title}” by ${data.fullWidthImage.credit} (via unsplash.com)`}
    />
  </Layout>
)

export default BlurUp

export const query = graphql`
  {
    coverImage: unsplashImagesYaml(title: { eq: "Plant with leaves" }) {
      credit
      title
      localFile {
        childImageSharp {
          gatsbyImageData(width: 720, layout: CONSTRAINED, aspectRatio: 0.5)
        }
      }
    }
    floatingImageMobile: unsplashImagesYaml(title: { eq: "Pug with hoodie" }) {
      localFile {
        childImageSharp {
          gatsbyImageData(width: 120, layout: FIXED)
        }
      }
    }
    floatingImage: unsplashImagesYaml(title: { eq: "Pug with hoodie" }) {
      credit
      title
      localFile {
        childImageSharp {
          gatsbyImageData(width: 200, layout: FIXED)
        }
      }
    }
    fullWidthImage: unsplashImagesYaml(title: { eq: "Alien in the forest" }) {
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
