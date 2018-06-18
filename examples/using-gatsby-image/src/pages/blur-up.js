import React from "react"
import Img from "gatsby-image"
import Lorem from "../components/lorem"
import Ipsum from "../components/ipsum"
import Layout from "../layouts"

import { rhythm, options } from "../utils/typography"

const BlurUp = ({ data, location }) => (
  <Layout location={location}>
    <h2>Blur Up</h2>
    <Img
      style={{ display: `inherit` }}
      css={{
        marginBottom: rhythm(options.blockMarginBottom * 2),
        marginLeft: rhythm(options.blockMarginBottom * 2),
        float: `right`,
        "&": {
          "@media (min-width: 500px)": {
            display: `none`,
          },
        },
      }}
      title={`Photo by Redd Angelo on Unsplash`}
      fixed={data.reddImageMobile.childImageSharp.fixed}
    />
    <Img
      style={{ display: `inherit` }}
      css={{
        marginBottom: rhythm(options.blockMarginBottom * 2),
        marginLeft: rhythm(options.blockMarginBottom * 2),
        float: `right`,
        display: `none`,
        "@media (min-width: 500px)": {
          display: `inline-block`,
        },
      }}
      title={`Photo by Redd Angelo on Unsplash`}
      fixed={data.reddImage.childImageSharp.fixed}
    />
    <Lorem />
    <Img
      fluid={data.kenImage.childImageSharp.fluid}
      title={`Photo by Ken Treloar on Unsplash`}
    />
    <Ipsum />
  </Layout>
)

export default BlurUp

export const query = graphql`
  query BlurUpQuery {
    reddImageMobile: file(relativePath: { regex: "/redd/" }) {
      childImageSharp {
        fixed(width: 125) {
          ...GatsbyImageSharpFixed
        }
      }
    }
    reddImage: file(relativePath: { regex: "/redd/" }) {
      childImageSharp {
        fixed(width: 200) {
          ...GatsbyImageSharpFixed
        }
      }
    }
    kenImage: file(relativePath: { regex: "/ken-treloar/" }) {
      childImageSharp {
        fluid(maxWidth: 600) {
          ...GatsbyImageSharpFluid
        }
      }
    }
  }
`
