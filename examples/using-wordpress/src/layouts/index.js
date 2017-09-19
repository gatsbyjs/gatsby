import React from "react"
import PropTypes from "prop-types"
import Link from "gatsby-link"

import { rhythm, scale } from "../utils/typography"

const containerStyle = {
  maxWidth: 700,
  margin: `0 auto`,
  padding: rhythm(3 / 4),
}

class DefaultLayout extends React.Component {
  render() {
    return (
      <div>
        <div
          css={{
            background: `rgb(207, 58, 62)`,
            padding: `${rhythm(2)} ${rhythm(3 / 4)}`,
            marginBottom: rhythm(1),
          }}
        >
          <div css={containerStyle}>
            <h1
              css={{
                margin: 0,
                ...scale(1.5),
                "@media screen and (min-width: 500px)": {
                  ...scale(1.9),
                },
              }}
            >
              <Link
                css={{
                  color: `rgb(224,203,144)`,
                  ":hover": {
                    color: `rgb(224,203,144)`,
                    textDecoration: `none`,
                  },
                }}
                to="/"
              >
                Gatsby + Wordpress!!
              </Link>
            </h1>
          </div>
        </div>
        <div css={containerStyle}>{this.props.children()}</div>
      </div>
    )
  }
}

DefaultLayout.propTypes = {
  location: PropTypes.object.isRequired,
}

export default DefaultLayout
