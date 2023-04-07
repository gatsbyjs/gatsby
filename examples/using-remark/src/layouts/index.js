import React from "react"
import { Link, StaticQuery, graphql } from "gatsby"
import { scale } from "../utils/typography"
import styles from "../styles"

import "typeface-space-mono"
import "typeface-spectral"

import "prismjs/themes/prism-solarizedlight.css"
import "prismjs/plugins/line-numbers/prism-line-numbers.css"

// TODO(v6): Refactor this to a function component
class Layout extends React.Component {
  render() {
    // TODO(v6): Refactor to use `useStaticQuery` instead of `StaticQuery`, `StaticQuery` will be removed in v6
    return (
      <StaticQuery
        query={graphql`
          query {
            site {
              siteMetadata {
                author
                homepage
              }
            }
          }
        `}
        render={data => {
          const { author, homepage } = data.site.siteMetadata
          return (
            <div>
              <div {...styles.container} {...styles.verticalPadding}>
                <Link
                  to="/"
                  css={{
                    display: `inline-block`,
                    textDecoration: `none`,
                  }}
                >
                  <h1
                    css={{
                      ...scale(0),
                      color: styles.colors.light,
                      fontWeight: `normal`,
                      lineHeight: 1,
                      margin: 0,
                    }}
                  >
                    gatsby-example-using-remark
                  </h1>
                </Link>
              </div>
              <div {...styles.container} {...styles.verticalPadding}>
                {this.props.children}
                <div
                  css={{
                    ...scale(-0.5),
                    color: styles.colors.light,
                  }}
                >
                  powered by
                  {` `}
                  <a target="_blank" rel="noopener noreferrer" href={homepage}>
                    {author}
                  </a>
                </div>
              </div>
            </div>
          )
        }}
      />
    )
  }
}

export default Layout
