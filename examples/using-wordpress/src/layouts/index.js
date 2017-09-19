import React from "react"
import PropTypes from "prop-types"
import Link from "gatsby-link"

import { rhythm, scale } from "../utils/typography"

const containerStyle = { maxWidth: 700, margin: `0 auto`, padding: 10 }

class DefaultLayout extends React.Component {
  render() {
    return (
      <div>
        <div
          style={{
            background: `rgb(207, 58, 62)`,
            padding: `${rhythm(2)} ${rhythm(3 / 4)}`,
            marginBottom: rhythm(1),
          }}
        >
          <div style={containerStyle}>
            <h1 style={{ margin: 0, ...scale(1.9) }}>
              <Link style={{ color: `rgb(224,203,144)` }} to="/">
                Gatsby + Wordpress!!
              </Link>
            </h1>
          </div>
        </div>
        <div style={containerStyle}>{this.props.children()}</div>
      </div>
    )
  }
}

DefaultLayout.propTypes = {
  location: PropTypes.object.isRequired,
}

export default DefaultLayout
