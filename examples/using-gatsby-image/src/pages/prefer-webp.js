import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import FloatingImage from "../components/floating-image"
import PageTitle from "../components/page-title"
import Layout from "../components/layout"
import Ipsum from "../components/ipsum"
import Lorem from "../components/lorem"

const PreferWebp = ({ data, location }) => (
  <Layout
    location={location}
    image={data.coverImage.localFile.childImageSharp.fluid}
    imageTitle={`“${data.coverImage.title}” by ${
      data.coverImage.credit
    } (via unsplash.com)`}
  >
    <PageTitle>Prefer WebP</PageTitle>
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

export default PreferWebp

export const query = graphql`
  query {
    coverImage: unsplashImagesYaml(title: { eq: "Pug with yellow raincoat" }) {
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
    floatingImageMobile: unsplashImagesYaml(title: { eq: "Cacti" }) {
      localFile {
        childImageSharp {
          fixed(width: 120) {
            ...GatsbyImageSharpFixed_withWebp
          }
        }
      }
    }
    floatingImage: unsplashImagesYaml(title: { eq: "Cacti" }) {
      credit
      title
      localFile {
        childImageSharp {
          fixed(width: 200) {
            ...GatsbyImageSharpFixed_withWebp
          }
        }
      }
    }
    fullWidthImage: unsplashImagesYaml(title: { eq: "Tennis court" }) {
      credit
      title
      localFile {
        childImageSharp {
          fluid(maxWidth: 600) {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
    }
  }
`
