import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"
import FloatingImage from "../components/floating-image"
import PageTitle from "../components/page-title"
import Layout from "../components/layout"

const BackgroundColor = ({ data, location }) => (
  <Layout
    location={location}
    image={data.coverImage.localFile.childImageSharp.fluid}
    imageTitle={`“${data.coverImage.title}” by ${data.coverImage.credit} (via unsplash.com)`}
    imageBackgroundColor="#F0C450"
  >
    <PageTitle>Background Color</PageTitle>
    <FloatingImage
      imageMobile={data.floatingImageMobile.localFile.childImageSharp.fixed}
      imageDesktop={data.floatingImage.localFile.childImageSharp.fixed}
      title={`“${data.floatingImage.title}” by ${data.floatingImage.credit} (via unsplash.com)`}
      backgroundColor="#DB3225"
    />
    <p>
      With the Background Color technique, you can specify a CSS background
      color to fill the space as your images download. For graphic images with a
      predominant color in the foreground or background, a matching color in the
      loading space can create a visually pleasing image load experience.
    </p>
    <p>
      To use the Background Color technique, provide a{` `}
      <code>backgroundColor</code> prop in your floating or fixed image
      component instance. You can use hex color values, RGB values, or any other
      valid CSS background color format.
    </p>

    <Img
      fluid={data.fullWidthImage.localFile.childImageSharp.fluid}
      backgroundColor="#F9D6CE"
      title={`“${data.fullWidthImage.title}” by ${data.fullWidthImage.credit} (via unsplash.com)`}
    />
  </Layout>
)

export default BackgroundColor

export const query = graphql`
  query {
    coverImage: unsplashImagesYaml(title: { eq: "Cactus" }) {
      credit
      title
      localFile {
        childImageSharp {
          fluid(maxWidth: 720) {
            ...GatsbyImageSharpFluid_noBase64
          }
        }
      }
    }
    floatingImageMobile: unsplashImagesYaml(title: { eq: "Pug with red hat" }) {
      localFile {
        childImageSharp {
          fixed(width: 120) {
            ...GatsbyImageSharpFixed_noBase64
          }
        }
      }
    }
    floatingImage: unsplashImagesYaml(title: { eq: "Pug with red hat" }) {
      credit
      title
      localFile {
        childImageSharp {
          fixed(width: 200) {
            ...GatsbyImageSharpFixed_noBase64
          }
        }
      }
    }
    fullWidthImage: unsplashImagesYaml(title: { eq: "Cacti" }) {
      credit
      title
      localFile {
        childImageSharp {
          fluid(maxWidth: 600) {
            ...GatsbyImageSharpFluid_noBase64
          }
        }
      }
    }
  }
`
