import React from "react"
import Img from "gatsby-image"
import Lorem from "../components/lorem"
import Ipsum from "../components/ipsum"

import { rhythm, options } from "../utils/typography"

const BlurUp = ({ data }) => (
  <div>
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
      resolutions={data.reddImageMobile.resolutions}
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
      resolutions={data.reddImage.resolutions}
    />
    <Lorem />
    <Img
      sizes={data.kenImage.sizes}
      backgroundColor
      title={`Photo by Ken Treloar on Unsplash`}
    />
    <Ipsum />
  </div>
)

export default BlurUp

export const query = graphql`
  query BackgroundColorQuery {
    reddImageMobile: imageSharp(id: { regex: "/redd/" }) {
      resolutions(width: 126) {
        ...GatsbyImageSharpResolutions_noBase64
      }
    }
    reddImage: imageSharp(id: { regex: "/redd/" }) {
      resolutions(width: 201) {
        ...GatsbyImageSharpResolutions_noBase64
      }
    }
    kenImage: imageSharp(id: { regex: "/ken-treloar/" }) {
      sizes(maxWidth: 599) {
        ...GatsbyImageSharpSizes_noBase64
      }
    }
  }
`
