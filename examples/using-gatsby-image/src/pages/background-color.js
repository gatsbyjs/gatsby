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
    image={data.file.childImageSharp.fluid}
    imageBackgroundColor="#F0C450"
  >
    <PageTitle>Background Color</PageTitle>
    <FloatingImage
      imageMobile={data.floatingImageMobile.childImageSharp.fixed}
      imageDesktop={data.floatingImage.childImageSharp.fixed}
    />
    <Lorem />
    <Img
      fluid={data.fullWidthImage.childImageSharp.fluid}
      backgroundColor
      title={`Photo by Ken Treloar on Unsplash`}
    />
    <Ipsum />
  </Layout>
)

export default BlurUp

export const query = graphql`
  query {
    file(relativePath: { regex: "/charles-deluvio-695732-unsplash/" }) {
      childImageSharp {
        fluid(maxWidth: 800, quality: 70) {
          ...GatsbyImageSharpFluid_noBase64
        }
      }
    }
    floatingImageMobile: file(
      relativePath: { regex: "/charles-deluvio-542217-unsplash/" }
    ) {
      childImageSharp {
        fixed(width: 120) {
          ...GatsbyImageSharpFixed_noBase64
        }
      }
    }
    floatingImage: file(
      relativePath: { regex: "/charles-deluvio-542217-unsplash/" }
    ) {
      childImageSharp {
        fixed(width: 200) {
          ...GatsbyImageSharpFixed_noBase64
        }
      }
    }
    fullWidthImage: file(
      relativePath: { regex: "/charles-deluvio-695760-unsplash/" }
    ) {
      childImageSharp {
        fluid(maxWidth: 600) {
          ...GatsbyImageSharpFluid_noBase64
        }
      }
    }
  }
`
