import React from "react"
import Link from "gatsby-link"
import { rhythm, scale, options } from "../utils/typography"
import Container from "../components/container"
import presets from "../utils/presets"

const IndexRoute = React.createClass({
  render() {
    return (
      <div css={{ background: `#744c9e`, paddingBottom: rhythm(1) }}>
        <Container hasSideBar={false}>
          <h1
            css={{
              marginTop: rhythm(1),
              marginBottom: rhythm(1.5),
              color: `white`,
              ...scale(2),
              lineHeight: 0.9,
              [presets.Mobile]: {
                lineHeight: 1,
              },
            }}
          >
            Blazing fast React.js static site generator
          </h1>
          <div>
            <Link
              css={{
                ...scale(2 / 5),
                border: `1px solid white`,
                display: `inline-block`,
                fontFamily: options.headerFontFamily.join(`,`),
                padding: `${rhythm(1 / 2)} ${rhythm(1)}`,
                // Increase specificity
                "&&": {
                  boxShadow: `none`,
                  color: `white`,
                  ":hover": { background: `white`, color: `#744c9e` },
                },
              }}
              to="/docs/"
            >
              Get Started
            </Link>
          </div>
        </Container>
      </div>
    )
  },
})

export default IndexRoute

export const pageQuery = graphql`
query Index {
  site {
    siteMetadata {
      title
    }
  }
}
`
