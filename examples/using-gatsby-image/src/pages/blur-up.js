import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import FloatingImage from "../components/floating-image"
import PageTitle from "../components/page-title"
import Layout from "../components/layout"

const BlurUp = ({ data, location }) => (
  <Layout
    location={location}
    image={data.coverImage.localFile.childImageSharp.fluid}
    imageTitle={`“${data.coverImage.title}” by ${data.coverImage.credit} (via unsplash.com)`}
  >
    <PageTitle>Blur Up</PageTitle>
    <FloatingImage
      imageMobile={data.floatingImageMobile.localFile.childImageSharp.fixed}
      imageDesktop={data.floatingImage.localFile.childImageSharp.fixed}
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
      QraphQL and providing a fragment like <code>GatsbyImageSharpFixed</code>.
      If you don’t want to use the blur-up effect, choose a fragment with{` `}
      <code>noBase64</code> at the end.
    </p>
    <Img
      fluid={data.fullWidthImage.localFile.childImageSharp.fluid}
      title={`“${data.fullWidthImage.title}” by ${data.fullWidthImage.credit} (via unsplash.com)`}
    />
  </Layout>
)

export default BlurUp

export const query = graphql`
  query {
    coverImage: unsplashImagesYaml(title: { eq: "Plant with leaves" }) {
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
    floatingImageMobile: unsplashImagesYaml(title: { eq: "Pug with hoodie" }) {
      localFile {
        childImageSharp {
          fixed(width: 120) {
            ...GatsbyImageSharpFixed
          }
        }
      }
    }
    floatingImage: unsplashImagesYaml(title: { eq: "Pug with hoodie" }) {
      credit
      title
      localFile {
        childImageSharp {
          fixed(width: 200) {
            ...GatsbyImageSharpFixed
          }
        }
      }
    }
    fullWidthImage: unsplashImagesYaml(title: { eq: "Alien in the forest" }) {
      credit
      title
      localFile {
        childImageSharp {
          fluid(maxWidth: 600) {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
  }
`
