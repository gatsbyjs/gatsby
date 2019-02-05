import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import Lorem from "../components/lorem"
import Ipsum from "../components/ipsum"
import FloatingImage from "../components/floating-image"
import PageTitle from "../components/page-title"
import ImageGallery from "../components/image-gallery"

import Layout from "../components/layout"

const TracedSVG = ({ data, location }) => (
  <Layout
    location={location}
    image={data.coverImage.localFile.childImageSharp.fluid}
    imageTitle={`“${data.coverImage.title}” by ${
      data.coverImage.credit
    } (via unsplash.com)`}
  >
    <PageTitle>Traced SVG Placeholders</PageTitle>
    <FloatingImage
      imageMobile={data.floatingImageMobile.localFile.childImageSharp.fixed}
      imageDesktop={data.floatingImage.localFile.childImageSharp.fixed}
      title={`“${data.floatingImage.title}” by ${
        data.floatingImage.credit
      } (via unsplash.com)`}
    />
    <Lorem />
    <h2>Unsplash</h2>
    <ImageGallery images={data.galleryImages.edges} />
    <Ipsum />
    <Img
      fluid={data.fullWidthImage.localFile.childImageSharp.fluid}
      title={`“${data.fullWidthImage.title}” by ${
        data.fullWidthImage.credit
      } (via unsplash.com)`}
    />
  </Layout>
)

export default TracedSVG

export const query = graphql`
  query {
    coverImage: unsplashImagesYaml(title: { eq: "Polaroid Pronto 600" }) {
      credit
      title
      localFile {
        childImageSharp {
          fluid(
            maxWidth: 720
            traceSVG: { background: "#fff", color: "#663399" }
          ) {
            ...GatsbyImageSharpFluid_tracedSVG
          }
        }
      }
    }
    floatingImageMobile: unsplashImagesYaml(
      title: { eq: "Pug without hoodie" }
    ) {
      localFile {
        childImageSharp {
          fixed(width: 120) {
            ...GatsbyImageSharpFixed_tracedSVG
          }
        }
      }
    }
    floatingImage: unsplashImagesYaml(title: { eq: "Pug without hoodie" }) {
      credit
      title
      localFile {
        childImageSharp {
          fixed(width: 200) {
            ...GatsbyImageSharpFixed_tracedSVG
          }
        }
      }
    }
    fullWidthImage: unsplashImagesYaml(title: { eq: "City from above" }) {
      credit
      title
      localFile {
        childImageSharp {
          fluid(maxWidth: 480) {
            ...GatsbyImageSharpFluid_tracedSVG
          }
        }
      }
    }
    galleryImages: allUnsplashImagesYaml(filter: { gallery: { eq: true } }) {
      edges {
        node {
          credit
          title
          localFile {
            childImageSharp {
              fluid(
                maxWidth: 380
                quality: 70
                traceSVG: { background: "#fbfafc", color: "#dbd4e2" }
              ) {
                ...GatsbyImageSharpFluid_tracedSVG
              }
            }
          }
        }
      }
    }
  }
`
