import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import FloatingImage from "../components/floating-image"
import PageTitle from "../components/page-title"
import Layout from "../components/layout"

const BlurHash = ({ data, location }) => (
  <Layout
    location={location}
    image={data.coverImage.localFile.childImageSharp.fluid}
    imageTitle={`“${data.coverImage.title}” by ${
      data.coverImage.credit
    } (via unsplash.com)`}
  >
    <PageTitle>Blur Hash</PageTitle>
    <FloatingImage
      imageMobile={data.floatingImageMobile.localFile.childImageSharp.fixed}
      imageDesktop={data.floatingImage.localFile.childImageSharp.fixed}
      title={`“${data.floatingImage.title}” by ${
        data.floatingImage.credit
      } (via unsplash.com)`}
    />

    <p>
      The default Blur Up technique uses progressive loading to make a fast,
      visually pleasing experience without waiting for a full-resolution image
      with a blank screen.
    </p>
    <h2>Blur Up with Blurhash library 🚀</h2>
    <p>
      In short, BlurHash takes an image, and gives you a short string (only
      20-30 characters!). BlurHash applies a simple DCT transform to the image
      data, keeping only the first few components, and then encodes these
      components using a base 83 encoding, with a JSON, HTML and shell-safe
      character set. The DC component, which represents the average colour of
      the image, is stored exactly as an sRGB value, for easy use without
      impleneting the full algorithm. The AC components are encoded lossily.
    </p>
    <p>
      This technique is the default behavior when querying for an image with
      QraphQL and providing a fragment like <code>GatsbyImageSharpFixed</code>.
      If you don’t want to use the blur-up effect, choose a fragment with{` `}
      <code>noBase64</code> at the end.
    </p>
    <p>
      This technique could be used out of the usual blur up technique, since
      it's an alternative what you need to do is pass an optional arguments to
      your image queries on the nodes that returns a base64, this arguments are
      "blurhashed" being a boolean, and "componentX" and "componentY" being
      integers. Their default values are "false", "5" and "5" respectively and
      both "componentX" and "componentY" could go from 1 to 9, being 1 super
      blurry and 9 little blurry. You'd end un with a query with these arguments
      like:
      <code>fluid(maxHeight: 500, quality: 90, blurhashed: true) ...</code>
    </p>
    <Img
      fluid={data.fullWidthImage.localFile.childImageSharp.fluid}
      title={`“${data.fullWidthImage.title}” by ${
        data.fullWidthImage.credit
      } (via unsplash.com)`}
    />
  </Layout>
)

export default BlurHash

export const query = graphql`
  query {
    coverImage: unsplashImagesYaml(title: { eq: "Plant with leaves" }) {
      credit
      title
      localFile {
        childImageSharp {
          fluid(maxWidth: 720, blurhashed: true, componentX: 9, componentY: 9) {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
    floatingImageMobile: unsplashImagesYaml(title: { eq: "Pug with hoodie" }) {
      localFile {
        childImageSharp {
          fixed(width: 120, blurhashed: true, componentX: 7, componentY: 7) {
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
          fixed(width: 200, blurhashed: true, componentX: 3, componentY: 6) {
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
          fluid(maxWidth: 600, blurhashed: true, componentX: 9, componentY: 9) {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
  }
`
