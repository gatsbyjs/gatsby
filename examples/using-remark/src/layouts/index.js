import React from "react"
import Link from "gatsby-link"
import { rhythm, scale } from "../utils/typography"
import { siteMetadata } from "../../gatsby-config"
import styles from "../styles"
import presets from "../utils/presets"

import "typeface-space-mono"
import "typeface-spectral"

require(`prismjs/themes/prism-solarizedlight.css`)

class DefaultLayout extends React.Component {
  render() {
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
              {siteMetadata.title}
            </h1>
          </Link>
        </div>
        <div {...styles.container} {...styles.verticalPadding}>
          {this.props.children()}
        </div>
      </div>
    )
  }
}

export default DefaultLayout
