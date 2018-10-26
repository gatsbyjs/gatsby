import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import FloatingImage from "../components/floating-image"
import PageTitle from "../components/page-title"
import Layout from "../components/layout"
import Ipsum from "../components/ipsum"
import Lorem from "../components/lorem"

const PreferWebp = ({ data, location }) => (
  <Layout location={location} image={data.file.childImageSharp.fluid}>
    <PageTitle>Prefer WebP</PageTitle>
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

export default PreferWebp

export const query = graphql`
  query {
    file(relativePath: { regex: "/charles-deluvio-716555/" }) {
      childImageSharp {
        fluid(maxWidth: 800) {
          ...GatsbyImageSharpFluid
        }
      }
    }
    floatingImageMobile: file(
      relativePath: { regex: "/charles-deluvio-695760/" }
    ) {
      childImageSharp {
        fixed(width: 120) {
          ...GatsbyImageSharpFixed_withWebp
        }
      }
    }
    floatingImage: file(relativePath: { regex: "/charles-deluvio-695760/" }) {
      childImageSharp {
        fixed(width: 200) {
          ...GatsbyImageSharpFixed_withWebp
        }
      }
    }
    fullWidthImage: file(relativePath: { regex: "/michele-feola-166138/" }) {
      childImageSharp {
        fluid(maxWidth: 600) {
          ...GatsbyImageSharpFluid_withWebp
        }
      }
    }
  }
`
