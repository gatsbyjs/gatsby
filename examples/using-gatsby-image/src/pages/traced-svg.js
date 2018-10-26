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
        image={this.props.data.file.childImageSharp.fluid}
      >
        <PageTitle>Traced SVG Placeholders</PageTitle>
        <FloatingImage
          imageMobile={data.floatingImageMobile.childImageSharp.fixed}
          imageDesktop={data.floatingImage.childImageSharp.fixed}
        />
        <Lorem />
        <h2>Unsplash</h2>
        <UnsplashMasonry images={data.galleryImages.edges} />
        <Ipsum />
        <Img
          fluid={data.fullWidthImage.childImageSharp.fluid}
          title={`Photo by Ken Treloar on Unsplash`}
        />
      </Layout>
    )
  }
}

export default TracedSVG

export const query = graphql`
  query {
    file(relativePath: { regex: "/yoann-siloine-532511/" }) {
      childImageSharp {
        fluid(
          maxWidth: 800
          traceSVG: { background: "#fff", color: "#663399" }
        ) {
          ...GatsbyImageSharpFluid_tracedSVG
        }
      }
    }
    floatingImageMobile: file(
      relativePath: { regex: "/charles-deluvio-716558/" }
    ) {
      childImageSharp {
        fixed(width: 120) {
          ...GatsbyImageSharpFixed_tracedSVG
        }
      }
    }
    floatingImage: file(relativePath: { regex: "/charles-deluvio-716558/" }) {
      childImageSharp {
        fixed(width: 200) {
          ...GatsbyImageSharpFixed_tracedSVG
        }
      }
    }
    fullWidthImage: file(relativePath: { regex: "/chuttersnap-1103171/" }) {
      childImageSharp {
        fluid(maxWidth: 600) {
          ...GatsbyImageSharpFluid_tracedSVG
        }
      }
    }
    galleryImages: allFile(
      filter: { relativeDirectory: { regex: "/gallery/" } }
    ) {
      edges {
        node {
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
`
