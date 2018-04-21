import React from "react"
import Img from "gatsby-image"
import Lorem from "../components/lorem"
import Ipsum from "../components/ipsum"
import Layout from "../layouts"

import { rhythm, options } from "../utils/typography"

const BlurUp = ({ data, location }) => (
  <Layout location={location}>
    <h2>Background color</h2>
    <Img
      backgroundColor
      style={{ display: `inherit` }}
      css={{
        marginBottom: rhythm(options.blockMarginBottom * 2),
        marginLeft: rhythm(options.blockMarginBottom * 2),
        float: `right`,
        "@media (min-width: 500px)": {
          display: `none`,
        },
      }}
      title={`Photo by Redd Angelo on Unsplash`}
      resolutions={data.reddImageMobile.childImageSharp.resolutions}
    />
    <Img
      backgroundColor
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
      backgroundColor
      title={`Photo by Ken Treloar on Unsplash`}
    />
    <Ipsum />
  </Layout>
)

export default BlurUp

export const query = graphql`
  query BackgroundColorQuery {
    reddImageMobile: file(relativePath: { regex: "/redd/" }) {
      childImageSharp {
        resolutions(width: 126) {
          ...GatsbyImageSharpResolutions_noBase64
        }
      }
    }
    reddImage: file(relativePath: { regex: "/redd/" }) {
      childImageSharp {
        resolutions(width: 201) {
          ...GatsbyImageSharpResolutions_noBase64
        }
      }
    }
    kenImage: file(relativePath: { regex: "/ken-treloar/" }) {
      childImageSharp {
        sizes(maxWidth: 599) {
          ...GatsbyImageSharpSizes_noBase64
        }
      }
    }
  }
`
