import React from "react"
import Img from "gatsby-image"
import numeral from "numeral"

import Lorem from "../components/lorem"
import Ipsum from "../components/ipsum"
import { rhythm, options, scale } from "../utils/typography"
import Layout from "../layouts"

numeral.locale(`en`)

const UnsplashMasonry = edges => (
  <div
    css={{
      "@media screen and (min-width: 640px)": {
        margin: `0 calc(-50vw + 320px)`,
      },
    }}
  >
    <div
      css={{
        columnCount: 1,
        columnGap: 0,
        maxWidth: 1360,
        margin: `0 auto`,
        "@media screen and (min-width: 400px)": {
          columnCount: 2,
        },
        "@media screen and (min-width: 800px)": {
          columnCount: 3,
        },
        "@media screen and (min-width: 1400px)": {
          columnCount: 4,
        },
      }}
    >
      {edges.images.map((image, index) => (
        <div
          key={index}
          css={{
            border: `4px solid transparent`,
            breakInside: `avoid`,
            position: `relative`,
            "@media screen and (min-width: 400px)": {
              borderWidth: 8,
            },
            "@media screen and (min-width: 800px)": {
              borderWidth: 8,
            },
            "@media screen and (min-width: 1000px)": {
              borderWidth: 12,
            },
            "& img": {
              borderRadius: 2,
            },
            "& .gatsby-image-wrapper:hover": {
              "& div + img": {
                opacity: `1 !important`,
              },
              "& img + img": {
                opacity: `0 !important`,
              },
              "& span": {
                opacity: `1 !important`,
              },
            },
          }}
        >
          <Img fluid={image.node.childImageSharp.fluid} />
          <span
            css={{
              ...scale(-1),
              color: options.bodyColor,
              position: `absolute`,
              bottom: 10,
              right: 10,
              padding: `.25rem`,
              background: `#fff`,
              borderRadius: 2,
              lineHeight: 1,
              opacity: 0.5,
              fontFamily: options.monospaceFontFamily.join(`,`),
            }}
          >
            <span css={{ color: options.headerColor }}>SVG</span>
            {` `}
            {numeral(
              Buffer.byteLength(
                image.node.childImageSharp.fluid.tracedSVG,
                `utf8`
              )
            ).format()}
            {` `}
            B
          </span>
        </div>
      ))}
    </div>
  </div>
)

class TracedSVG extends React.Component {
  render() {
    const data = this.props.data
    return (
      <Layout location={this.props.location}>
        <h2>Traced SVG Placeholders</h2>
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

        <h2>Unsplash</h2>
        <UnsplashMasonry images={data.unsplashImages.edges} />

        <Ipsum />

        <Img
          fluid={data.kenImage.childImageSharp.fluid}
          title={`Photo by Ken Treloar on Unsplash`}
        />
      </Layout>
    )
  }
}

export default TracedSVG

export const query = graphql`
  query TracedSVGQuery {
    reddImageMobile: file(relativePath: { regex: "/redd/" }) {
      childImageSharp {
        fixed(width: 125) {
          ...GatsbyImageSharpFixed_tracedSVG
        }
      }
    }
    reddImage: file(relativePath: { regex: "/redd/" }) {
      childImageSharp {
        fixed(width: 200) {
          ...GatsbyImageSharpFixed_tracedSVG
        }
      }
    }
    kenImage: file(relativePath: { regex: "/ken-treloar/" }) {
      childImageSharp {
        fluid(maxWidth: 600) {
          ...GatsbyImageSharpFluid_tracedSVG
        }
      }
    }
    unsplashImages: allFile(filter: { relativePath: { regex: "/unsplash/" } }) {
      edges {
        node {
          childImageSharp {
            fluid(
              maxWidth: 430
              quality: 80
              traceSVG: { background: "#f2f8f3", color: "#d6ebd9" }
            ) {
              ...GatsbyImageSharpFluid_tracedSVG
            }
          }
        }
      }
    }
  }
`
