import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import Lorem from "../components/lorem"
import Ipsum from "../components/ipsum"
import FloatingImage from "../components/floating-image"
import PageTitle from "../components/page-title"
import Layout from "../components/layout"

const BlurUp = ({ data, location }) => (
  <Layout
    location={location}
    image={data.coverImage.localFile.childImageSharp.fluid}
    imageTitle={`“${data.coverImage.title}” by ${
      data.coverImage.credit
    } (via unsplash.com)`}
  >
    <PageTitle>Blur Up</PageTitle>
    <FloatingImage
      imageMobile={data.floatingImageMobile.localFile.childImageSharp.fixed}
      imageDesktop={data.floatingImage.localFile.childImageSharp.fixed}
      title={`“${data.floatingImage.title}” by ${
        data.floatingImage.credit
      } (via unsplash.com)`}
    />

    <Lorem />
    <Img
      fluid={data.fullWidthImage.localFile.childImageSharp.fluid}
      title={`“${data.fullWidthImage.title}” by ${
        data.fullWidthImage.credit
      } (via unsplash.com)`}
    />
    <Ipsum />
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
