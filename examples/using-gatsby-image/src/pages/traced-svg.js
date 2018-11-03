import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import Lorem from "../components/lorem"
import Ipsum from "../components/ipsum"
import FloatingImage from "../components/floating-image"
import PageTitle from "../components/page-title"
import UnsplashMasonry from "../components/image-gallery"

import Layout from "../components/layout"

class TracedSVG extends React.Component {
  render() {
    const data = this.props.data
    return (
      <Layout
        location={this.props.location}
        image={this.props.data.polaroid.localFile.childImageSharp.fluid}
      >
        <PageTitle>Traced SVG Placeholders</PageTitle>
        <FloatingImage
          imageMobile={data.floatingImageMobile.localFile.childImageSharp.fixed}
          imageDesktop={data.floatingImage.localFile.childImageSharp.fixed}
        />
        <Lorem />
        <h2>Unsplash</h2>
        <UnsplashMasonry images={data.galleryImages.edges} />
        <Ipsum />
        <Img
          fluid={data.fullWidthImage.localFile.childImageSharp.fluid}
          title={`Photo by ${data.fullWidthImage.credit} on Unsplash`}
        />
      </Layout>
    )
  }
}

export default TracedSVG

export const query = graphql`
  query {
    polaroid: unsplashImagesYaml(title: { eq: "Polaroid Pronto 600" }) {
      localFile {
        childImageSharp {
          fluid(
            maxWidth: 800
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
      localFile {
        childImageSharp {
          fluid(maxWidth: 600) {
            ...GatsbyImageSharpFluid_tracedSVG
          }
        }
      }
    }
    galleryImages: allUnsplashImagesYaml(filter: { gallery: { eq: true } }) {
      edges {
        node {
          localFile {
            childImageSharp {
              fluid(
                maxWidth: 420
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
