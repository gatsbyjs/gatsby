import React from "react"
import { graphql } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image"
import FloatingImage from "../components/floating-image"
import PageTitle from "../components/page-title"
import Layout from "../components/layout"

const BackgroundColor = ({ data, location }) => (
  <Layout
    location={location}
    image={data.coverImage.localFile.childImageSharp.gatsbyImageData}
    imageTitle={`“${data.coverImage.title}” by ${data.coverImage.credit} (via unsplash.com)`}
    imageBackgroundColor="#F0C450"
  >
    <PageTitle>Background Color</PageTitle>
    <FloatingImage
      imageMobile={
        data.floatingImageMobile.localFile.childImageSharp.gatsbyImageData
      }
      imageDesktop={
        data.floatingImage.localFile.childImageSharp.gatsbyImageData
      }
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

    <GatsbyImage
      image={data.fullWidthImage.localFile.childImageSharp.gatsbyImageData}
      backgroundColor="#F9D6CE"
      title={`“${data.fullWidthImage.title}” by ${data.fullWidthImage.credit} (via unsplash.com)`}
    />
  </Layout>
)

export default BackgroundColor

export const query = graphql`
  {
    coverImage: unsplashImagesYaml(title: { eq: "Cactus" }) {
      credit
      title
      localFile {
        childImageSharp {
          gatsbyImageData(maxWidth: 720, placeholder: NONE, layout: FLUID)
        }
      }
    }
    floatingImageMobile: unsplashImagesYaml(title: { eq: "Pug with red hat" }) {
      localFile {
        childImageSharp {
          gatsbyImageData(width: 120, placeholder: NONE, layout: FIXED)
        }
      }
    }
    floatingImage: unsplashImagesYaml(title: { eq: "Pug with red hat" }) {
      credit
      title
      localFile {
        childImageSharp {
          gatsbyImageData(width: 200, placeholder: NONE, layout: FIXED)
        }
      }
    }
    fullWidthImage: unsplashImagesYaml(title: { eq: "Cacti" }) {
      credit
      title
      localFile {
        childImageSharp {
          gatsbyImageData(maxWidth: 600, placeholder: NONE, layout: FLUID)
        }
      }
    }
  }
`
