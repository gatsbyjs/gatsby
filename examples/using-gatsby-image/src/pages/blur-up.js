import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import Lorem from "../components/lorem"
import Ipsum from "../components/ipsum"
import FloatingImage from "../components/floating-image"
import PageTitle from "../components/page-title"
import Layout from "../components/layout"

const BlurUp = ({ data, location }) => (
  <Layout location={location} image={data.file.childImageSharp.fluid}>
    <PageTitle>Blur Up</PageTitle>
    <FloatingImage
      imageMobile={data.floatingImageMobile.childImageSharp.fixed}
      imageDesktop={data.floatingImage.childImageSharp.fixed}
    />
    <Lorem />
    <Img
      fluid={data.fullWidthImage.childImageSharp.fluid}
      title={`Photo by Ken Treloar on Unsplash`}
    />
    <Ipsum />
  </Layout>
)

export default BlurUp

export const query = graphql`
  query {
    file(relativePath: { regex: "/igor-son-320878/" }) {
      childImageSharp {
        fluid(maxWidth: 800) {
          ...GatsbyImageSharpFluid
        }
      }
    }
    floatingImageMobile: file(
      relativePath: { regex: "/charles-deluvio-782457/" }
    ) {
      childImageSharp {
        fixed(width: 120) {
          ...GatsbyImageSharpFixed
        }
      }
    }
    floatingImage: file(relativePath: { regex: "/charles-deluvio-782457/" }) {
      childImageSharp {
        fixed(width: 200) {
          ...GatsbyImageSharpFixed
        }
      }
    }
    fullWidthImage: file(relativePath: { regex: "/martin-reisch-113179/" }) {
      childImageSharp {
        fluid(maxWidth: 600) {
          ...GatsbyImageSharpFluid
        }
      }
    }
  }
`
