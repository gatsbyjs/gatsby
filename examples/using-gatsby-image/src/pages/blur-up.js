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
    image={data.plant.localFile.childImageSharp.fluid}
  >
    <PageTitle>Blur Up</PageTitle>
    <FloatingImage
      imageMobile={data.floatingImageMobile.localFile.childImageSharp.fixed}
      imageDesktop={data.floatingImage.localFile.childImageSharp.fixed}
    />
    <Lorem />
    <Img
      fluid={data.fullWidthImage.localFile.childImageSharp.fluid}
      title={`Photo by Ken Treloar on Unsplash`}
    />
    <Ipsum />
  </Layout>
)

export default BlurUp

export const query = graphql`
  query {
    plant: unsplashImagesYaml(title: { eq: "Plant with leaves" }) {
      localFile {
        childImageSharp {
          fluid(maxWidth: 800) {
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
      localFile {
        childImageSharp {
          fixed(width: 200) {
            ...GatsbyImageSharpFixed
          }
        }
      }
    }

    fullWidthImage: unsplashImagesYaml(title: { eq: "Alien in the forest" }) {
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
