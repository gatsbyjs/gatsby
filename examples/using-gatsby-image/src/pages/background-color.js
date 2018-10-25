import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"
import Lorem from "../components/lorem"
import Ipsum from "../components/ipsum"
import FloatingImage from "../components/floating-image"
import PageTitle from "../components/page-title"
import Layout from "../layouts"

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
        fluid(maxWidth: 1000, quality: 80) {
          ...GatsbyImageSharpFluid_noBase64
        }
      }
    }
    floatingImageMobile: file(
      relativePath: { regex: "/charles-deluvio-542217-unsplash/" }
    ) {
      childImageSharp {
        fixed(width: 126) {
          ...GatsbyImageSharpFixed_noBase64
        }
      }
    }
    floatingImage: file(
      relativePath: { regex: "/charles-deluvio-542217-unsplash/" }
    ) {
      childImageSharp {
        fixed(width: 201) {
          ...GatsbyImageSharpFixed_noBase64
        }
      }
    }
    fullWidthImage: file(relativePath: { regex: "/martin-reisch-113179/" }) {
      childImageSharp {
        fluid(maxWidth: 599) {
          ...GatsbyImageSharpFluid_noBase64
        }
      }
    }
  }
`
