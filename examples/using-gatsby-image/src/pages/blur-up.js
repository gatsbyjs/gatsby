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
      resolutions={data.reddImageMobile.childImageSharp.resolutions}
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
      resolutions={data.reddImage.childImageSharp.resolutions}
    />
    <Lorem />
    <Img
      sizes={data.kenImage.childImageSharp.sizes}
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
        resolutions(width: 125) {
          ...GatsbyImageSharpResolutions
        }
      }
    }
    reddImage: file(relativePath: { regex: "/redd/" }) {
      childImageSharp {
        resolutions(width: 200) {
          ...GatsbyImageSharpResolutions
        }
      }
    }
    kenImage: file(relativePath: { regex: "/ken-treloar/" }) {
      childImageSharp {
        sizes(maxWidth: 600) {
          ...GatsbyImageSharpSizes
        }
      }
    }
  }
`
